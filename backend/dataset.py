import os
import glob
import numpy as np
from torch.utils.data import Dataset


class PointCloudDataset(Dataset):
    """
    Dataset for processed .npz files with 'points' and 'labels' arrays.

    Each file must contain:
      - points: (N,F) float32 (x,y,z,...)
      - labels: (N,) int64
    """

    def __init__(self, root_dir, split='train', num_points=4096):
        self.root_dir = root_dir
        self.split = split
        self.num_points = num_points

        pattern = os.path.join(root_dir, f"{split}_*.npz")
        self.files = sorted(glob.glob(pattern))
        if not self.files:
            raise RuntimeError(
                f"No files found for split={split} in {root_dir}. "
                "Run preprocess_3dses.py and check paths."
            )

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        path = self.files[idx]
        data = np.load(path)
        points = data["points"]  # (N,F)
        labels = data["labels"]  # (N,)

        N = points.shape[0]
        if N >= self.num_points:
            idxs = np.random.choice(N, self.num_points, replace=False)
        else:
            pad = np.random.choice(N, self.num_points - N, replace=True)
            idxs = np.concatenate([np.arange(N), pad])

        pts = points[idxs, :3]  # xyz only
        lbl = labels[idxs]

        return pts.astype("float32"), lbl.astype("int64")
