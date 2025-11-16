import { useEffect, useState } from "react";
import { healthCheck } from "./api";
import SemanticSegView from "./components/SemanticSegView";
import MapView from "./components/MapView";
import RLView from "./components/RLView";
import BatchView from "./components/BatchView";

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.4rem 0.8rem",
        marginRight: "0.5rem",
        border: "none",
        borderBottom: active ? "2px solid #1976d2" : "2px solid transparent",
        background: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("seg");
  const [backend, setBackend] = useState("Checking...");

  useEffect(() => {
    healthCheck()
      .then(() => setBackend("Connected"))
      .catch(() => setBackend("Not reachable"));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "1rem auto", fontFamily: "sans-serif" }}>
      <h1>Deep Learning LIDAR Indoor Mapping & Navigation</h1>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>Backend: {backend}</p>

      <div style={{ borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
        <TabButton active={tab === "seg"} onClick={() => setTab("seg")}>
          Segmentation
        </TabButton>
        <TabButton active={tab === "map"} onClick={() => setTab("map")}>
          Map
        </TabButton>
        <TabButton active={tab === "rl"} onClick={() => setTab("rl")}>
          RL Navigation
        </TabButton>
        <TabButton active={tab === "batch"} onClick={() => setTab("batch")}>
          Batch
        </TabButton>
      </div>

      {tab === "seg" && <SemanticSegView />}
      {tab === "map" && <MapView />}
      {tab === "rl" && <RLView />}
      {tab === "batch" && <BatchView />}
    </div>
  );
}
