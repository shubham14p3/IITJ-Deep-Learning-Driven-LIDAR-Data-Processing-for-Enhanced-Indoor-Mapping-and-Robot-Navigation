import numpy as np
import random
import torch
import torch.nn as nn
import torch.nn.functional as F

from config import GRID_SIZE


class DQN(nn.Module):
    def __init__(self, grid_size, num_actions=4):
        super().__init__()
        self.fc1 = nn.Linear(grid_size * grid_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, num_actions)

    def forward(self, x):
        b = x.size(0)
        x = x.view(b, -1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)


class MapEnv:
    """
    Simple navigation environment on a 2D occupancy grid.
    grid: 0 = free, 1 = obstacle, 2 = goal, 3 = agent
    """
    def __init__(self, grid_size=GRID_SIZE):
        self.grid_size = grid_size
        self.reset_random()

    def reset_random(self):
        self.grid = np.zeros((self.grid_size, self.grid_size), dtype=np.int32)
        # random obstacles
        for _ in range(self.grid_size * 3):
            x = np.random.randint(0, self.grid_size)
            y = np.random.randint(0, self.grid_size)
            self.grid[y, x] = 1
        self.agent_pos = [0, 0]
        self.goal_pos = [self.grid_size - 1, self.grid_size - 1]
        self.grid[self.goal_pos[1], self.goal_pos[0]] = 2
        self.grid[self.agent_pos[1], self.agent_pos[0]] = 3
        self.steps = 0
        return self.grid.copy()

    def load_from_occ(self, occ):
        g = np.zeros_like(occ, dtype=np.int32)
        g[occ == 1] = 1
        self.grid_size = g.shape[0]
        self.grid = g
        self.agent_pos = [0, 0]
        self.goal_pos = [self.grid_size - 1, self.grid_size - 1]
        self.grid[self.goal_pos[1], self.goal_pos[0]] = 2
        self.grid[self.agent_pos[1], self.agent_pos[0]] = 3
        self.steps = 0
        return self.grid.copy()

    def step(self, action):
        # 0=up,1=down,2=left,3=right
        self.steps += 1
        y, x = self.agent_pos
        self.grid[y, x] = 0
        if action == 0 and y > 0:
            y -= 1
        elif action == 1 and y < self.grid_size - 1:
            y += 1
        elif action == 2 and x > 0:
            x -= 1
        elif action == 3 and x < self.grid_size - 1:
            x += 1

        reward = -0.01
        done = False
        cell = self.grid[y, x]
        if cell == 1:
            reward = -1.0
            done = True
        elif cell == 2:
            reward = 1.0
            done = True

        self.agent_pos = [x, y]
        self.grid[y, x] = 3
        if self.steps >= self.grid_size * self.grid_size:
            done = True
        return self.grid.copy(), reward, done


class SimpleRLAgent:
    def __init__(self, device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.env = MapEnv()
        self.q_net = DQN(self.env.grid_size, 4).to(self.device)
        self.state = self.env.reset_random()

    def reset_random(self):
        self.state = self.env.reset_random()
        return self.state

    def reset_from_occ(self, occ):
        self.state = self.env.load_from_occ(occ)
        return self.state
    def step(self, epsilon=0.2):
        st = torch.from_numpy(self.state).float().unsqueeze(0).to(self.device)
        with torch.no_grad():
            q = self.q_net(st)[0].cpu().numpy()
        if random.random() < epsilon:
            action = random.randint(0, 3)
        else:
            action = int(np.argmax(q))
        ns, reward, done = self.env.step(action)
        self.state = ns
        return ns, reward, done, action
