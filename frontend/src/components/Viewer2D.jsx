import { useEffect, useRef } from "react";

export default function Viewer2D({ grid }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!grid) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const H = canvas.height;
    const W = canvas.width;
    ctx.clearRect(0, 0, W, H);
    const size = grid.length;
    const cell = Math.min(W, H) / size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = grid[y][x];
        let color = "#ffffff";
        if (v === 1) color = "#444";      // obstacle
        if (v === 2) color = "#4caf50";   // goal
        if (v === 3) color = "#2196f3";   // agent
        ctx.fillStyle = color;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }, [grid]);

  return (
    <canvas
      ref={ref}
      width={400}
      height={400}
      style={{ border: "1px solid #ccc" }}
    />
  );
}
