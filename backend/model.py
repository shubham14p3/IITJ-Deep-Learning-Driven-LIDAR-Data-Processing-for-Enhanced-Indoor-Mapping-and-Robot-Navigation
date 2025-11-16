# backend/model.py
import torch
import torch.nn as nn
import torch.nn.functional as F


class TNet(nn.Module):
    """Simple T-Net (for input transform) used in PointNet-like models."""
    def __init__(self, k=3):
        super().__init__()
        self.k = k
        self.conv1 = nn.Conv1d(k, 64, 1)
        self.conv2 = nn.Conv1d(64, 128, 1)
        self.conv3 = nn.Conv1d(128, 1024, 1)
        self.fc1 = nn.Linear(1024, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, k * k)

        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(1024)
        self.bn4 = nn.BatchNorm1d(512)
        self.bn5 = nn.BatchNorm1d(256)

    def forward(self, x):
        # x: (B, k, N)
        B = x.size(0)
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = F.relu(self.bn3(self.conv3(x)))  # (B, 1024, N)
        x = torch.max(x, 2)[0]  # (B, 1024)
        x = F.relu(self.bn4(self.fc1(x)))
        x = F.relu(self.bn5(self.fc2(x)))
        x = self.fc3(x)  # (B, k*k)

        # Add identity
        id_matrix = torch.eye(self.k, device=x.device).view(1, self.k * self.k).repeat(B, 1)
        x = x + id_matrix
        x = x.view(-1, self.k, self.k)
        return x


class PointNetSeg(nn.Module):
    """PointNet-style semantic segmentation network."""
    def __init__(self, num_classes, input_dim=3):
        super().__init__()
        self.input_dim = input_dim
        self.tnet = TNet(k=input_dim)

        self.conv1 = nn.Conv1d(input_dim, 64, 1)
        self.conv2 = nn.Conv1d(64, 128, 1)
        self.conv3 = nn.Conv1d(128, 1024, 1)

        self.bn1 = nn.BatchNorm1d(64)
        self.bn2 = nn.BatchNorm1d(128)
        self.bn3 = nn.BatchNorm1d(1024)

        self.conv4 = nn.Conv1d(1088, 512, 1)
        self.conv5 = nn.Conv1d(512, 256, 1)
        self.conv6 = nn.Conv1d(256, 128, 1)
        self.conv7 = nn.Conv1d(128, num_classes, 1)

        self.bn4 = nn.BatchNorm1d(512)
        self.bn5 = nn.BatchNorm1d(256)
        self.bn6 = nn.BatchNorm1d(128)

    def forward(self, x):
        """
        x: (B, N, input_dim) -> (B, num_classes, N)
        """
        x = x.transpose(2, 1)  # (B, input_dim, N)

        # T-Net transform
        trans = self.tnet(x)
        x = torch.bmm(trans, x)  # (B, input_dim, N)

        x = F.relu(self.bn1(self.conv1(x)))  # (B, 64, N)
        pointfeat = x

        x = F.relu(self.bn2(self.conv2(x)))  # (B, 128, N)
        x = self.bn3(self.conv3(x))          # (B, 1024, N)
        global_feat = torch.max(x, 2, keepdim=True)[0]  # (B, 1024, 1)
        global_feat = global_feat.repeat(1, 1, pointfeat.size(2))  # (B, 1024, N)

        # Concatenate local + global
        x = torch.cat([pointfeat, global_feat], 1)  # (B, 1088, N)

        x = F.relu(self.bn4(self.conv4(x)))
        x = F.relu(self.bn5(self.conv5(x)))
        x = F.relu(self.bn6(self.conv6(x)))
        x = self.conv7(x)  # (B, num_classes, N)

        return x  # logits
