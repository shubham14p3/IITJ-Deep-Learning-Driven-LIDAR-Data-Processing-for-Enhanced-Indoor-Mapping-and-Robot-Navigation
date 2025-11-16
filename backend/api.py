from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
import numpy as np
import torch

from config import CHECKPOINT_DIR, NUM_CLASSES, GRID_SIZE
from models.pointnet import PointNetSeg
from mapping.occupancy import points_to_occupancy
from rl_nav import SimpleRLAgent

app = FastAPI(title="Indoor LiDAR Mapping & Navigation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# segmentation model
SEG_MODEL = PointNetSeg(num_classes=NUM_CLASSES, input_dim=3).to(DEVICE)
ckpt = CHECKPOINT_DIR / "pointnet_3dses_best.pth"
if ckpt.exists():
    SEG_MODEL.load_state_dict(torch.load(ckpt, map_location=DEVICE))
    SEG_MODEL.eval()
else:
    print("[WARN] segmentation checkpoint not found at", ckpt)
    # still usable with random weights

GLOBAL_OCC = np.zeros((GRID_SIZE, GRID_SIZE), dtype=np.uint8)
RL_AGENT = SimpleRLAgent(device=DEVICE)


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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/segment", response_model=SegmentResponse)
async def segment(file: UploadFile = File(...)):
    """
    Upload .npz with 'points' array -> return per-point labels.
    """
    content = await file.read()
    data = np.load(io.BytesIO(content))
    points = data["points"]
    xyz = points[:, :3].astype("float32")
    N = xyz.shape[0]

    with torch.no_grad():
        pts = torch.from_numpy(xyz).unsqueeze(0).to(DEVICE)  # (1,N,3)
        logits = SEG_MODEL(pts)  # (1,C,N)
        preds = logits.argmax(dim=1).squeeze(0).cpu().numpy()

    return SegmentResponse(num_points=int(N), labels=preds.astype(int).tolist())


@app.post("/build_map", response_model=MapResponse)
async def build_map(file: UploadFile = File(...)):
    """
    Build a simple occupancy map from one LiDAR scan and store globally.
    """
    global GLOBAL_OCC
    content = await file.read()
    data = np.load(io.BytesIO(content))
    points = data["points"]
    xyz = points[:, :3].astype("float32")
    occ = points_to_occupancy(xyz, grid_size=GRID_SIZE, resolution=0.2)
    GLOBAL_OCC = occ
    return MapResponse(grid=occ.tolist())


@app.get("/get_map", response_model=MapResponse)
def get_map():
    return MapResponse(grid=GLOBAL_OCC.tolist())


@app.post("/rl_reset_random", response_model=RLStateResponse)
def rl_reset_random():
    grid = RL_AGENT.reset_random()
    return RLStateResponse(grid=grid.tolist(), reward=0.0, done=False, action=-1)


@app.post("/rl_reset_from_map", response_model=RLStateResponse)
def rl_reset_from_map():
    grid = RL_AGENT.reset_from_occ(GLOBAL_OCC)
    return RLStateResponse(grid=grid.tolist(), reward=0.0, done=False, action=-1)


@app.post("/rl_step", response_model=RLStateResponse)
def rl_step():
    ns, reward, done, action = RL_AGENT.step(epsilon=0.2)
    return RLStateResponse(
        grid=ns.tolist(),
        reward=float(reward),
        done=bool(done),
        action=int(action),
    )
