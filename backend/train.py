# backend/train.py
import os
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from dataset import PointCloudDataset
from model import PointNetSeg


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_ds = PointCloudDataset(args.data_root, split='train', num_points=args.num_points)
    val_ds = PointCloudDataset(args.data_root, split='val', num_points=args.num_points)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=4)

    num_classes = args.num_classes
    model = PointNetSeg(num_classes=num_classes, input_dim=3).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)

    best_val_acc = 0.0
    os.makedirs(args.ckpt_dir, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for xyz, labels in train_loader:
            xyz = xyz.to(device)          # (B, N, 3)
            labels = labels.to(device)    # (B, N)

            optimizer.zero_grad()
            logits = model(xyz)           # (B, C, N)
            logits = logits.transpose(2, 1).contiguous().view(-1, num_classes)
            labels = labels.view(-1)

            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * labels.numel()
            preds = logits.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.numel()

        train_loss = running_loss / total
        train_acc = correct / total

        # Validation
        model.eval()
        correct_val = 0
        total_val = 0
        with torch.no_grad():
            for xyz, labels in val_loader:
                xyz = xyz.to(device)
                labels = labels.to(device)
                logits = model(xyz)
                logits = logits.transpose(2, 1).contiguous().view(-1, num_classes)
                labels = labels.view(-1)
                preds = logits.argmax(dim=1)
                correct_val += (preds == labels).sum().item()
                total_val += labels.numel()

        val_acc = correct_val / total_val

        print(f"Epoch {epoch:03d} | Train Loss: {train_loss:.4f} | "
              f"Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}")

        # Save best
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            ckpt_path = os.path.join(args.ckpt_dir, "pointnet_3dses_best.pth")
            torch.save(model.state_dict(), ckpt_path)
            print(f"  -> Saved best model to {ckpt_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_root", type=str, default="../data/processed")
    parser.add_argument("--ckpt_dir", type=str, default="./checkpoints")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--num_points", type=int, default=4096)
    parser.add_argument("--num_classes", type=int, default=10)  # adjust to 3DSES
    args = parser.parse_args()
    train(args)
