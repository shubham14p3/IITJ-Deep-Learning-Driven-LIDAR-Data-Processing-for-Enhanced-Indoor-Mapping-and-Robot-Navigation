// MapView.jsx
import { useState } from "react";
import { buildMap, getMap, downloadRandomScene } from "../api";
import Viewer2D from "./Viewer2D";

/* Legend Component */
function LegendItem({ color, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "12px",
        background: "#f5f5f5",
        fontSize: "0.85rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          background: color,
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      ></div>
      {label}
    </div>
  );
}

export default function MapView() {
  const [file, setFile] = useState(null);
  const [grid, setGrid] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onBuild = async (e) => {
    e.preventDefault();
    if (!file) {
      setErr("Please select a .npz scan first.");
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

  const occupiedCount =
    grid?.reduce(
      (sum, row) => sum + row.reduce((s, v) => s + (v !== 0 ? 1 : 0), 0),
      0
    ) ?? 0;

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px 16px 40px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "22px",
          borderRadius: "18px",
          background: "linear-gradient(120deg, #004d40, #00897b, #26a69a)",
          color: "#e0f2f1",
          marginBottom: "26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 14px 35px rgba(0,0,0,0.25)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            IIT Jodhpur • Indoor LiDAR Lab
          </div>
          <h2
            style={{
              margin: "4px 0 0 0",
              fontSize: "1.7rem",
              fontWeight: 700,
            }}
          >
            Occupancy Grid Mapping
          </h2>
          <p
            style={{
              marginTop: 6,
              fontSize: "0.85rem",
              opacity: 0.9,
            }}
          >
            Convert 3D LiDAR scans into a 2D map used for robotics, SLAM and
            navigation.
          </p>
        </div>

        {/* Decoration bubble */}
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, #ffffffaa, #004d40)",
            border: "2px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            boxShadow: "0 0 18px rgba(0,0,0,0.35)",
          }}
        >
          🗺️
        </div>
      </div>

      {/* Two column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "22px",
        }}
      >
        {/* LEFT PANEL — Upload + Controls */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(224, 242, 241, 0.85)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: "1.15rem",
              color: "#004d40",
            }}
          >
            1️⃣ Load a LiDAR Scan
          </h3>

          <p
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: "0.9rem",
              color: "#315c53",
            }}
          >
            Upload a <b>.npz</b> file or download a random generated indoor
            scene.
          </p>

          <p style={{ marginBottom: 14, fontSize: "0.85rem" }}>
            Need a random scene?{" "}
            <a
              href={downloadRandomScene()}
              download
              style={{
                color: "#004d40",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Download random scene
            </a>
          </p>

          <form
            onSubmit={onBuild}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* File Picker */}
            <label
              style={{
                border: "2px dashed #009688",
                padding: "16px 18px",
                cursor: "pointer",
                borderRadius: "14px",
                background: "#ffffffee",
                color: "#00695c",
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#e0f2f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  📁
                </span>
                {file ? file.name : "Click to select .npz file"}
              </span>
              <input
                type="file"
                accept=".npz"
                onChange={(e) => setFile(e.target.files[0] || null)}
                style={{ display: "none" }}
              />
            </label>

            {/* Build */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading
                  ? "linear-gradient(120deg,#80cbc4,#4db6ac)"
                  : "linear-gradient(120deg,#00695c,#00897b)",
                color: "white",
                padding: "10px 24px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {loading ? "Building..." : "Build Map"}
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={onRefresh}
              style={{
                background: "linear-gradient(120deg,#00838f,#00acc1)",
                color: "white",
                padding: "10px 24px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              }}
            >
              Refresh Map
            </button>
          </form>

          {err && (
            <p
              style={{
                marginTop: "14px",
                color: "#c62828",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              ⚠ {err}
            </p>
          )}
        </div>

        {/* RIGHT PANEL — Viewer */}
        <div style={{ position: "relative" }}>
          {/* decorative backdrops */}
          <div
            style={{
              position: "absolute",
              inset: -18,
              background:
                "radial-gradient(circle at 10% 0%, rgba(0,150,136,0.1), transparent 55%), radial-gradient(circle at 90% 100%, rgba(156,39,176,0.13), transparent 50%)",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />

          {grid ? (
            <div
              style={{
                padding: "22px",
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "1.15rem",
                  color: "#004d40",
                }}
              >
                Map Output
              </h3>

              <p style={{ fontSize: "0.9rem", color: "#555" }}>
                <b>Grid size:</b> {grid.length} × {grid[0].length} <br />
                <b>Occupied cells:</b> {occupiedCount}
              </p>

              {/* Legend */}
              <h4
                style={{
                  marginTop: 14,
                  marginBottom: 10,
                  color: "#00695c",
                  fontSize: "0.95rem",
                }}
              >
                Class Legend
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: "10px",
                  marginBottom: 20,
                }}
              >
                <LegendItem color="#2b2b2b" label="1 — Wall" />
                <LegendItem color="#ff7043" label="2 — Chair" />
                <LegendItem color="#8d6e63" label="3 — Door" />
                <LegendItem color="#90caf9" label="4 — Ceiling" />
                <LegendItem color="#ffca28" label="5 — Table" />
                <LegendItem color="#81d4fa" label="6 — Window" />
                <LegendItem color="#ab47bc" label="7 — Sofa" />
              </div>

              {/* Canvas Viewer */}
              <Viewer2D grid={grid} />
            </div>
          ) : (
            <div
              style={{
                padding: "22px",
                borderRadius: "16px",
                background: "#fafafa",
                border: "1px dashed #cfd8dc",
                color: "#607d8b",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}
                >
                  🗺️
                </span>
                <div>
                  <strong>No map yet</strong>
                  <div style={{ marginTop: 4 }}>
                    Upload a scan and build a map to see output here.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
