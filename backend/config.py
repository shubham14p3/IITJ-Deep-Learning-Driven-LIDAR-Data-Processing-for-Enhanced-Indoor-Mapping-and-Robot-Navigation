from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
CHECKPOINT_DIR = Path(__file__).resolve().parent / "checkpoints"

NUM_CLASSES = 8     # adjust to your label set for 3DSES
NUM_POINTS = 4096   # number of points sampled per scan
GRID_SIZE = 40      # size of occupancy grid for mapping / RL
