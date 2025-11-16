import { useState } from "react";
import { buildMap, getMap } from "../api";
import Viewer2D from "./Viewer2D";

export default function MapView() {
  const [file, setFile] = useState(null);
  const [grid, setGrid] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onBuild = async (e) => {
    e.preventDefault();
    if (!file) {
      setErr("Select a .npz scan first.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const res = await buildMap(file);
      setGrid(res.grid);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setErr("");
    try {
      const res = await getMap();
      setGrid(res.grid);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div>
      <h2>2. Indoor Map (Occupancy Grid)</h2>
      <p>Build a simple occupancy grid from one LiDAR scan.</p>
      <form onSubmit={onBuild}>
        <input
          type="file"
          accept=".npz"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Building..." : "Build Map"}
        </button>
        <button type="button" onClick={onRefresh} style={{ marginLeft: "0.5rem" }}>
          Refresh Map
        </button>
      </form>
      {err && <p style={{ color: "red" }}>{err}</p>}
      {grid && (
        <div style={{ marginTop: "1rem" }}>
          <Viewer2D grid={grid} />
        </div>
      )}
    </div>
  );
}
