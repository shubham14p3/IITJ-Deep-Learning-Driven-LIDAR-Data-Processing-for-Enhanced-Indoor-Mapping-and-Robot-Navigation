"""
Preprocess 3DSES (Zenodo 13323342) into train/val/test .npz files.

You must first:

1. Download 3DSES.zip from:
   https://zenodo.org/records/13323342

2. Convert each scan into a .npz with:
   - 'points': (N,F) float32 (x,y,z,...)
   - 'labels': (N,) int64

   Put those .npz files into:
   data/raw/3dses_npz/

Then run:

    cd backend
    python preprocess_3dses.py
"""

import glob
import shutil
from sklearn.model_selection import train_test_split
from config import DATA_RAW, DATA_PROCESSED

RAW_NPZ_DIR = DATA_RAW / "3dses_npz"


def main():
    DATA_PROCESSED.mkdir(parents=True, exist_ok=True)
    files = sorted(glob.glob(str(RAW_NPZ_DIR / "*.npz")))
    if not files:
        raise SystemExit(
            f"No .npz files found in {RAW_NPZ_DIR}. "
            "Convert 3DSES scans to .npz first."
        )

    train_files, test_files = train_test_split(files, test_size=0.2, random_state=42)
    train_files, val_files = train_test_split(train_files, test_size=0.1, random_state=42)

    def copy_split(split, split_files):
        for i, src in enumerate(split_files):
            dst = DATA_PROCESSED / f"{split}_{i:04d}.npz"
            shutil.copy2(src, dst)
        print(f"{split}: {len(split_files)} files")

    copy_split("train", train_files)
    copy_split("val", val_files)
    copy_split("test", test_files)
    print("Done. Processed files saved in", DATA_PROCESSED)


if __name__ == "__main__":
    main()
