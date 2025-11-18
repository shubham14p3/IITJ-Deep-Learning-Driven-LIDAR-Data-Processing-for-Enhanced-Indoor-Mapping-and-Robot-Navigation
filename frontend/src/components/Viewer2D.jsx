// Viewer2D.jsx
import { useEffect, useRef } from "react";

export default function Viewer2D({ grid }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!grid) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const W = (canvas.width = rect.width || 500);
    const H = (canvas.height = rect.width || 500);

    ctx.clearRect(0, 0, W, H);

    const rows = grid.length;
    const cols = grid[0].length;
    const cellW = W / cols;
    const cellH = H / rows;

    // Draw grid with class colors
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = grid[y][x];

        let color = "#eaeaea";  // free
        if (v === 1) color = "#2b2b2b";        // wall
        if (v === 2) color = "#ff7043";        // chair
        if (v === 3) color = "#8d6e63";        // door
        if (v === 4) color = "#90caf9";        // ceiling
        if (v === 5) color = "#ffca28";        // table
        if (v === 6) color = "#81d4fa";        // window
        if (v === 7) color = "#ab47bc";        // sofa

        ctx.fillStyle = color;
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);

        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
      }
    }
  }, [grid]);

  return (
    <div
      style={{
        padding: "22px",
        borderRadius: "16px",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(230,248,247,0.9))",
        boxShadow: "0 8px 25px rgba(0,0,0,0.10)",
        backdropFilter: "blur(8px)",
        marginTop: "25px",
        textAlign: "center",
        animation: "fadeIn 0.6s ease",
      }}
    >
      <h3 style={{ marginBottom: "10px", color: "#004d40", fontSize: "1.3rem" }}>
        🗺️ Indoor Occupancy Grid
      </h3>

      <p style={{ marginBottom: "18px", color: "#444", fontSize: "0.9rem" }}>
        Each color represents an object detected from the 3D LiDAR scene.
      </p>

      <canvas
        ref={ref}
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "auto",
          border: "2px solid rgba(0,150,136,0.3)",
          borderRadius: "12px",
          display: "block",
          margin: "0 auto",
        }}
      />

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          canvas:hover {
            transform: scale(1.01);
            transition: 0.25s ease;
            box-shadow: 0 12px 25px rgba(0,0,0,0.15);
            border-color: rgba(0,150,136,0.5);
          }
        `}
      </style>
    </div>
  );
}
