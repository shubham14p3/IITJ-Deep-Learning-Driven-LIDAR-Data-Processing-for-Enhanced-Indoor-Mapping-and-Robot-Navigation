import { useEffect, useState } from "react";
import { rlResetRandom, rlResetFromMap, rlStep } from "../api";
import Viewer2D from "./Viewer2D";

export default function RLView() {
  const [grid, setGrid] = useState(null);
  const [info, setInfo] = useState("");
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    rlResetRandom().then((res) => {
      setGrid(res.grid);
      setInfo("Random env reset.");
    });
  }, []);

  useEffect(() => {
    let id;
    if (auto) {
      id = setInterval(async () => {
        const res = await rlStep();
        setGrid(res.grid);
        setInfo(
          `Action: ${res.action}, reward: ${res.reward.toFixed(
            2
          )}, done: ${res.done}`
        );
      }, 400);
    }
    return () => clearInterval(id);
  }, [auto]);

  const handleResetRandom = async () => {
    const res = await rlResetRandom();
    setGrid(res.grid);
    setInfo("Random env reset.");
  };

  const handleResetFromMap = async () => {
    const res = await rlResetFromMap();
    setGrid(res.grid);
    setInfo("Env reset using last built map as obstacles.");
  };

  const handleStep = async () => {
    const res = await rlStep();
    setGrid(res.grid);
    setInfo(
      `Action: ${res.action}, reward: ${res.reward.toFixed(2)}, done: ${
        res.done
      }`
    );
  };

  return (
    <div>
      <h2>3. RL Navigation on Map</h2>
      <p>
        Simple DQN-style agent navigating on an occupancy grid (random or built
        from LiDAR).
      </p>
      <button onClick={handleResetRandom}>Reset Random Env</button>
      <button onClick={handleResetFromMap} style={{ marginLeft: "0.5rem" }}>
        Reset From Map
      </button>
      <button onClick={handleStep} style={{ marginLeft: "0.5rem" }}>
        Step Once
      </button>
      <button onClick={() => setAuto((a) => !a)} style={{ marginLeft: "0.5rem" }}>
        {auto ? "Stop Auto" : "Auto Run"}
      </button>
      <p>{info}</p>
      {grid && <Viewer2D grid={grid} />}
    </div>
  );
}
