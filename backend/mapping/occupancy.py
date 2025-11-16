import numpy as np
from typing import Tuple


def points_to_occupancy(points_xyz: np.ndarray,
                        grid_size: int = 200,
                        resolution: float = 0.1,
                        z_thresh: Tuple[float, float] = (-1.0, 2.0)) -> np.ndarray:
    """
    Project 3D points to a simple 2D occupancy grid.

    Args:
        points_xyz: (N, 3) array of x,y,z.
        grid_size: number of cells per side.
        resolution: meters per cell.
        z_thresh: min, max z to consider.

    Returns:
        occ: (grid_size, grid_size) uint8
             0 = free, 1 = occupied
    """
    mask = (points_xyz[:, 2] > z_thresh[0]) & (points_xyz[:, 2] < z_thresh[1])
    pts = points_xyz[mask]
    if pts.shape[0] == 0:
        return np.zeros((grid_size, grid_size), dtype=np.uint8)

    xs, ys = pts[:, 0], pts[:, 1]
    min_x, max_x = xs.min(), xs.max()
    min_y, max_y = ys.min(), ys.max()

    cx = (min_x + max_x) / 2.0
    cy = (min_y + max_y) / 2.0
    xs_rel = xs - cx
    ys_rel = ys - cy

    occ = np.zeros((grid_size, grid_size), dtype=np.uint8)
    half = grid_size // 2
    for x, y in zip(xs_rel, ys_rel):
        ix = int(x / resolution) + half
        iy = int(y / resolution) + half
        if 0 <= ix < grid_size and 0 <= iy < grid_size:
            occ[iy, ix] = 1
    return occ
