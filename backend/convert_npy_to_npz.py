import numpy as np
from pathlib import Path

SOURCE_ROOT = Path("../data/3DSES")
TARGET_DIR  = Path("../data/raw/3dses_npz")
TARGET_DIR.mkdir(parents=True, exist_ok=True)

TARGET_FEATURES = 7   # Final fixed dimension


def convert_to_fixed7(arr):
    """
    Convert any (N, D) array to (N,7)
    Rule:
      cols 0,1,2 = xyz
      cols 3,4,5 = rgb (if exist else zeros)
      col 6      = intensity (if exist else zeros)
    Extra columns are dropped.
    Missing columns are zero padded.
    """
    N, D = arr.shape
    out = np.zeros((N, TARGET_FEATURES), dtype=np.float32)

    # XYZ always taken from first 3 columns
    if D >= 3:
        out[:, :3] = arr[:, :3]

    # RGB (if available)
    if D >= 6:
        out[:, 3:6] = arr[:, 3:6]

    # intensity (col 6)
    if D >= 7:
        out[:, 6] = arr[:, 6]

    # If D = 9, columns 7-8 ignored
    # If D = 7, perfect
    # If D < 7, padded zeros

    return out


def convert_file(file_path: Path):
    print("Processing:", file_path)

    arr = np.load(file_path)

    if not isinstance(arr, np.ndarray) or arr.ndim != 2:
        print(" ❌ Skipping (not 2D array).")
        return

    fixed = convert_to_fixed7(arr)

    labels = np.zeros(fixed.shape[0], dtype=np.int64)

    out_path = TARGET_DIR / (file_path.stem + ".npz")
    np.savez(out_path, points=fixed, labels=labels)

    print(f" ✔ Saved: {out_path} (shape={fixed.shape})")


def scan_all():
    for sub in ["Bronze", "Silver", "Gold"]:
        folder = SOURCE_ROOT / sub
        if not folder.exists():
            print("Skipping missing:", folder)
            continue

        print(f"\n=== Converting folder: {folder} ===")
        npy_files = sorted(folder.glob("*.npy"))

        for f in npy_files:
            convert_file(f)


if __name__ == "__main__":
    scan_all()
