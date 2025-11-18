from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
import torch
import io
from pathlib import Path
import glob
import random
from config import DATA_RAW
from fastapi.responses import StreamingResponse
import json
import time
RAW_NPZ_DIR = DATA_RAW / "3dses_npz"
from config import CHECKPOINT_DIR, NUM_CLASSES, GRID_SIZE, PROJECT_ROOT
from models.pointnet import PointNetSegLite
from rl_nav import SimpleRLAgent

# -----------------------------------------------------------
# FastAPI Setup
# -----------------------------------------------------------

app = FastAPI(title="Indoor LiDAR Mapping & Navigation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------------------------------------
# Load Segmentation Model (input_dim=7 since your dataset is Nx7)
# -----------------------------------------------------------

SEG_MODEL = PointNetSegLite(num_classes=NUM_CLASSES, input_dim=7).to(DEVICE)

ckpt = CHECKPOINT_DIR / "pointnet_3dses_best.pth"
if ckpt.exists():
    SEG_MODEL.load_state_dict(torch.load(ckpt, map_location=DEVICE))
    SEG_MODEL.eval()
    print("[INFO] Loaded segmentation checkpoint.")
else:
    print("[WARN] Segmentation checkpoint not found. Using random weights.")

# Global occupancy map
GLOBAL_OCC = np.zeros((GRID_SIZE, GRID_SIZE), dtype=np.uint8)

# RL Agent
RL_AGENT = SimpleRLAgent(device=DEVICE)
BACKEND_DIR = Path(__file__).resolve().parent

# -----------------------------------------------------------
# Response Models
# -----------------------------------------------------------

class SegmentResponse(BaseModel):
    num_points: int
    labels: list[int]


class MapResponse(BaseModel):
    grid: list[list[int]]


class RLStateResponse(BaseModel):
    grid: list[list[int]]
    reward: float
    done: bool
    action: int


# -----------------------------------------------------------
# Health Check
# -----------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


# -----------------------------------------------------------
# Download Sample NPZ
# -----------------------------------------------------------

@app.get("/sample_npz")
def download_sample_npz():
    sample_path = PROJECT_ROOT / "data" / "processed" / "train_0000.npz"

    if not sample_path.exists():
        return {"error": "Sample .npz not found. Please run preprocessing."}

    return FileResponse(
        path=sample_path,
        filename="sample_lidar_scan.npz",
        media_type="application/octet-stream"
    )


# -----------------------------------------------------------
# SEGMENTATION — FIXED VERSION
# ----------------------------------------------------------

def to_model_input(points: np.ndarray) -> torch.Tensor:
    """
    points: (N, F) -> normalize to (N,7) and convert to (1, N, 7) tensor
    """
    points = normalize_point_features(points)              # (N,7)
    pts = torch.from_numpy(points).float().unsqueeze(0)    # (1,N,7)
    return pts.to(DEVICE)
    
def normalize_point_features(points):
    """
    Ensures points always become (N,7)
    - If >7 features → keep first 7
    - If <7 features → pad with zeros
    """

    pts = np.asarray(points, dtype=np.float32)

    # If too many features → crop
    if pts.shape[1] > 7:
        pts = pts[:, :7]

    # If too few → pad
    if pts.shape[1] < 7:
        pad_width = 7 - pts.shape[1]
        pad = np.zeros((pts.shape[0], pad_width), dtype=np.float32)
        pts = np.concatenate([pts, pad], axis=1)

    return pts

@app.post("/segment_stream")
async def segment_stream(file: UploadFile = File(...)):
    content = await file.read()
    data = np.load(io.BytesIO(content))

    if "points" not in data:
        return StreamingResponse(
            iter([f"data: {json.dumps({'error': 'points missing'})}\n\n"]),
            media_type="text/event-stream"
        )

    points = normalize_point_features(data["points"])
    N = points.shape[0]
    batch_size = 50000

    total_batches = (N + batch_size - 1) // batch_size

    def event_generator():
        # Send header info (total batches)
        yield f"data: {json.dumps({'total_batches': total_batches})}\n\n"

        all_preds = []

        with torch.no_grad():
            batch_num = 1
            for i in range(0, N, batch_size):
                part = points[i:i+batch_size]
                pts = torch.from_numpy(part).float().unsqueeze(0).to(DEVICE)

                logits = SEG_MODEL(pts)
                preds = logits.argmax(dim=1).squeeze(0).cpu().numpy()

                # Save partial results
                all_preds.append(preds.tolist())

                # Send batch update to UI
                yield f"data: {json.dumps({'batch': batch_num, 'preds': preds.tolist()})}\n\n"
                batch_num += 1

        final_preds = np.concatenate([np.array(x) for x in all_preds]).tolist()

        # Final result
        yield f"data: {json.dumps({'done': True, 'final': final_preds})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/segment", response_model=SegmentResponse)
async def segment(file: UploadFile = File(...)):
    MAX_PTS = 50000

    content = await file.read()
    data = np.load(io.BytesIO(content))

    if "points" not in data:
        return {"error": "NPZ must contain 'points' array."}

    raw = data["points"]  # (N,F)
    points = normalize_point_features(raw)  # (N,7)
    N = points.shape[0]

    if N > MAX_PTS:
        idx = np.random.choice(N, MAX_PTS, replace=False)
        points = points[idx]
        N = MAX_PTS

    pts = torch.from_numpy(points).float().unsqueeze(0).to(DEVICE)  # (1,N,7)

    with torch.no_grad():
        logits = SEG_MODEL(pts)  # (1, num_classes, N)
        preds = logits.argmax(dim=1).squeeze(0).cpu().numpy()  # (N,)

    return SegmentResponse(num_points=int(N), labels=preds.tolist())


@app.get("/segment_random", response_model=SegmentResponse)
def segment_random():
    files = glob.glob(str(RAW_NPZ_DIR / "*.npz"))
    if not files:
        return {"error": "No dataset .npz files found."}

    file_path = np.random.choice(files)
    data = np.load(file_path)

    if "points" not in data:
        return {"error": f"'points' not in {file_path}"}

    raw = data["points"]  # (N,F)
    points = normalize_point_features(raw)  # (N,7)

    N = points.shape[0]
    MAX_PTS = 50000
    if N > MAX_PTS:
        idx = np.random.choice(N, MAX_PTS, replace=False)
        points = points[idx]
        N = MAX_PTS

    pts = torch.from_numpy(points).float().unsqueeze(0).to(DEVICE)  # (1,N,7)

    with torch.no_grad():
        logits = SEG_MODEL(pts)   # (1, num_classes, N)
        preds = logits.argmax(dim=1).squeeze(0).cpu().numpy()

    return SegmentResponse(num_points=int(N), labels=preds.tolist())




# -----------------------------------------------------------
# BUILD OCCUPANCY MAP
# -----------------------------------------------------------

def points_to_occupancy(points, labels=None, grid_size=40, resolution=0.2, z_thresh=None):
    """
    Multi-class occupancy grid.
    
    points: (N,3) or (N,2)
    labels: (N,) class labels [0–7]. If None ⇒ assign 1 (obstacle)
    grid_size: output grid dimension
    resolution: meters per cell
    z_thresh: (min_z, max_z) optional height filter
    """

    pts = np.asarray(points)

    # --- Handle input shape ---
    if pts.shape[1] == 3:
        if z_thresh is not None:
            mask = (pts[:, 2] >= z_thresh[0]) & (pts[:, 2] <= z_thresh[1])
            pts = pts[mask]
            if labels is not None:
                labels = labels[mask]
        xy = pts[:, :2]
    elif pts.shape[1] == 2:
        xy = pts
    else:
        raise ValueError(f"Expected (N,2) or (N,3), got {pts.shape}")

    if labels is None:
        labels = np.ones((xy.shape[0],), dtype=np.uint8)   # default=obstacle

    if len(xy) == 0:
        return np.zeros((grid_size, grid_size), dtype=np.uint8)

    # --- Normalize XY ---
    xy = xy - xy.min(axis=0)

    world_size = grid_size * resolution
    xy_max = xy.max(axis=0)
    scale = (world_size - 1e-3) / max(xy_max)
    xy = xy * scale
    xy = np.clip(xy, 0, world_size - 1e-3)

    # --- Convert to grid cells ---
    ix = (xy[:, 0] / resolution).astype(int)
    iy = (xy[:, 1] / resolution).astype(int)

    # --- Multi-class occupancy grid ---
    grid = np.zeros((grid_size, grid_size), dtype=np.uint8)

    for x, y, lbl in zip(ix, iy, labels.astype(np.uint8)):
        grid[y, x] = lbl   # ★ WRITE ACTUAL CLASS LABEL

    return grid


@app.post("/build_map", response_model=MapResponse)
async def build_map(file: UploadFile = File(...)):
    global GLOBAL_OCC

    content = await file.read()
    data = np.load(io.BytesIO(content))

    if "points" not in data:
        return {"error": "NPZ must contain 'points' array."}
    if "labels" not in data:
        return {"error": "NPZ must contain 'labels' array."}

    points = data["points"][:, :3].astype("float32")
    labels = data["labels"].astype("uint8")

    occ = points_to_occupancy(
        points,
        labels=labels,    # ★ PASS LABELS
        grid_size=GRID_SIZE,
        resolution=0.2,
        z_thresh=(0.1, 2.5)
    )

    GLOBAL_OCC = occ
    return MapResponse(grid=occ.tolist())


# -----------------------------------------------------------
# GET GLOBAL MAP
# -----------------------------------------------------------

@app.get("/get_map", response_model=MapResponse)
def get_map():
    return MapResponse(grid=GLOBAL_OCC.tolist())


# -----------------------------------------------------------
# RL: RESET RANDOM
# -----------------------------------------------------------

@app.post("/rl_reset_random", response_model=RLStateResponse)
def rl_reset_random():
    grid = RL_AGENT.reset_random()
    return RLStateResponse(
        grid=grid.tolist(),
        reward=0.0,
        done=False,
        action=-1
    )


# -----------------------------------------------------------
# RL: RESET FROM MAP
# -----------------------------------------------------------

@app.post("/rl_reset_from_map", response_model=RLStateResponse)
def rl_reset_from_map():
    grid = RL_AGENT.reset_from_occ(GLOBAL_OCC)
    return RLStateResponse(
        grid=grid.tolist(),
        reward=0.0,
        done=False,
        action=-1
    )

@app.get("/random_scene_npz")
def random_scene_npz():
    """
    Returns a random sceneX.npz from backend folder (same folder as this file).
    """
    BACKEND_DIR = Path(__file__).resolve().parent
    scene_files = list(BACKEND_DIR.glob("scene*.npz"))

    if not scene_files:
        return {"error": "No sceneX.npz files found in backend folder."}

    chosen = random.choice(scene_files)

    return FileResponse(
        path=chosen,
        filename=chosen.name,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{chosen.name}"'}
    )

@app.get("/build_map_random", response_model=MapResponse)
def build_map_random():
    files = glob.glob(str(RAW_NPZ_DIR / "*.npz"))
    if not files:
        return {"error": "No dataset .npz found."}

    file_path = np.random.choice(files)
    data = np.load(file_path)
    points = data["points"][:, :3]  # xyz only

    occ = points_to_occupancy(
        points,
        grid_size=GRID_SIZE,
        resolution=0.2,
        z_thresh=(0.1, 2.5)
    )

    GLOBAL_OCC = occ
    return MapResponse(grid=occ.tolist())


# -----------------------------------------------------------
# RL: STEP
# -----------------------------------------------------------

@app.post("/rl_step", response_model=RLStateResponse)
def rl_step():
    ns, reward, done, action = RL_AGENT.step(epsilon=0.2)
    return RLStateResponse(
        grid=ns.tolist(),
        reward=float(reward),
        done=bool(done),
        action=int(action),
    )
