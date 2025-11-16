import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from config import DATA_PROCESSED, CHECKPOINT_DIR, NUM_CLASSES, NUM_POINTS
from dataset import PointCloudDataset
from models.pointnet import PointNetSeg


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

    train_ds = PointCloudDataset(DATA_PROCESSED, split="train", num_points=NUM_POINTS)
    val_ds = PointCloudDataset(DATA_PROCESSED, split="val", num_points=NUM_POINTS)
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)

    model = PointNetSeg(num_classes=NUM_CLASSES, input_dim=3).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)

    best_val_acc = 0.0

    for epoch in range(1, args.epochs + 1):
        model.train()
        total_loss = 0.0
        total_correct = 0
        total_points = 0

        for pts, labels in train_loader:
            pts, labels = pts.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(pts)  # (B,C,N)
            logits = logits.transpose(2, 1).contiguous().view(-1, NUM_CLASSES)
            labels_flat = labels.view(-1)
            loss = criterion(logits, labels_flat)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * labels_flat.numel()
            preds = logits.argmax(dim=1)
            total_correct += (preds == labels_flat).sum().item()
            total_points += labels_flat.numel()

        train_loss = total_loss / total_points
        train_acc = total_correct / total_points

        # validation
        model.eval()
        val_correct = 0
        val_points = 0
        with torch.no_grad():
            for pts, labels in val_loader:
                pts, labels = pts.to(device), labels.to(device)
                logits = model(pts)
                logits = logits.transpose(2, 1).contiguous().view(-1, NUM_CLASSES)
                labels_flat = labels.view(-1)
                preds = logits.argmax(dim=1)
                val_correct += (preds == labels_flat).sum().item()
                val_points += labels_flat.numel()

        val_acc = val_correct / val_points if val_points > 0 else 0.0
        print(f"Epoch {epoch:03d} | Train loss {train_loss:.4f} | "
              f"Train acc {train_acc:.4f} | Val acc {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            ckpt = CHECKPOINT_DIR / "pointnet_3dses_best.pth"
            torch.save(model.state_dict(), ckpt)
            print("  -> Saved best model to", ckpt)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()
    train(args)
