import numpy as np
from pathlib import Path

# ------------------------------------------------------------
# AUTO-DETECT PROJECT ROOT (one level above backend/)
# ------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[1]

# INPUT FOLDER (3DSES_test_area)
SOURCE = PROJECT_ROOT / "data" / "3DSES_test_area"

# OUTPUT FOLDER (converted npz)
TARGET = PROJECT_ROOT / "data" / "raw" / "3dses_npz"
TARGET.mkdir(parents=True, exist_ok=True)

TARGET_FEATURES = 7  # xyz + rgb + intensity

# ------------------------------------------------------------
# Convert N×D array → N×7 features
# ------------------------------------------------------------
def convert_to_fixed7(arr):
    N, D = arr.shape
    out = np.zeros((N, TARGET_FEATURES), dtype=np.float32)

    if D >= 3:
        out[:, :3] = arr[:, :3]  # XYZ

    if D >= 6:
        out[:, 3:6] = arr[:, 3:6]  # RGB

    if D >= 7:
        out[:, 6] = arr[:, 6]  # Intensity

    return out

# ------------------------------------------------------------
# Process each .npy file
# ------------------------------------------------------------
def process_file(npy_file):
    print(f"Processing: {npy_file.name}")

    arr = np.load(npy_file)
    if not isinstance(arr, np.ndarray) or arr.ndim != 2:
        print(" ❌ Error: Data is not 2D")
        return

    pts = convert_to_fixed7(arr)
    num_points = pts.shape[0]

    # Dummy semantic labels to populate UI (8 classes)
    labels = np.random.choice(
        8,                      # 8 classes
        size=num_points,
        p=[
            0.30,  # 0 = floor
            0.30,  # 1 = wall
            0.10,  # 2 = chair
            0.05,  # 3 = door
            0.05,  # 4 = ceiling
            0.10,  # 5 = table
            0.07,  # 6 = window
            0.03,  # 7 = sofa
        ]
    ).astype(np.int64)

    out_path = TARGET / f"{npy_file.stem}.npz"
    np.savez(out_path, points=pts, labels=labels)

    print(f" ✔ Saved {out_path}  shape={pts.shape}")

# ------------------------------------------------------------
# MAIN
# ------------------------------------------------------------
def main():
    if not SOURCE.exists():
        print(f"❌ Folder not found: {SOURCE}")
        return

    npy_files = sorted(SOURCE.glob("*.npy"))
    if not npy_files:
        print(f"❌ No .npy files found in {SOURCE}")
        return

    print(f"Found {len(npy_files)} .npy files\n")

    for npy in npy_files:
        process_file(npy)

    print("\n🎉 DONE — ALL TEST AREA FILES CONVERTED SUCCESSFULLY")


if __name__ == "__main__":
    main()
