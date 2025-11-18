// BatchView.jsx
import { useRef, useState } from "react";
import { segmentPointCloud } from "../api";

export default function BatchView() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const list = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.endsWith(".npz")
    );

    setFiles((prev) => [...prev, ...list]);
  };

  const runBatch = async () => {
    if (!files.length) return;

    setLoading(true);
    setProgress(0);
    setResults([]);

    const out = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const f = files[i];

      try {
        const res = await segmentPointCloud(f);
        out.push({ name: f.name, num_points: res.num_points });
      } catch (e) {
        out.push({ name: f.name, error: e.message });
      }

      // Update progressive results immediately
      setResults([...out]);

      // Progress % update
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setLoading(false);
  };

  const downloadResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "batch_results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px 16px 40px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------ */}
      <div
        style={{
          padding: "22px",
          borderRadius: "18px",
          background: "linear-gradient(120deg,#004d40,#00897b,#26a69a)",
          color: "white",
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
              opacity: 0.9,
            }}
          >
            IIT Jodhpur • Indoor LiDAR Lab
          </div>

          <h2 style={{ margin: "4px 0 0 0", fontSize: "1.6rem", fontWeight: 700 }}>
            Batch Segmentation
          </h2>

          <p
            style={{
              marginTop: 4,
              fontSize: "0.9rem",
              maxWidth: "600px",
              opacity: 0.95,
              lineHeight: "1.5",
            }}
          >
            Upload multiple 3D LiDAR (.npz) scans and process them together.
            Each file is segmented independently, and results appear live while
            processing continues in the background.
          </p>
        </div>

        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, #ffffffaa, #004d40)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            boxShadow: "0 0 18px rgba(0,0,0,0.35)",
          }}
        >
          📦
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* DRAG & DROP UPLOAD */}
      {/* ------------------------------------------------------ */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          background: "rgba(224,242,241,0.85)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
          maxWidth: "650px",
          margin: "0 auto 26px auto",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 14, color: "#004d40" }}>
          1️⃣ Upload Multiple LiDAR Scans
        </h3>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          style={{
            padding: "24px",
            border: "2px dashed #009688",
            borderRadius: "14px",
            background: dragging ? "#b2dfdbaa" : "#ffffffee",
            textAlign: "center",
            color: "#00695c",
            cursor: "pointer",
            transition: "0.25s",
            marginBottom: "18px",
            position: "relative",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📥</div>
          <div style={{ fontWeight: 600 }}>Drag & Drop your .npz files here</div>
          <div style={{ marginTop: 4, fontSize: "0.8rem", opacity: 0.8 }}>
            or click to browse manually
          </div>
        </div>

        <input
          type="file"
          accept=".npz"
          multiple
          ref={fileInputRef}
          onChange={(e) => {
            const list = Array.from(e.target.files);
            setFiles(list);
            e.target.value = null;
          }}
          style={{ display: "none" }}
        />

        {/* Selected file list */}
        {files.length > 0 && (
          <div
            style={{
              marginBottom: "12px",
              background: "#ffffffcc",
              padding: "12px",
              borderRadius: "8px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            <b>Selected Files:</b>
            <ul style={{ paddingLeft: "20px" }}>
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={runBatch}
          disabled={loading || !files.length}
          style={{
            width: "100%",
            padding: "12px 20px",
            background: loading
              ? "linear-gradient(120deg,#80cbc4,#4db6ac)"
              : "linear-gradient(120deg,#00695c,#00897b)",
            border: "none",
            borderRadius: "999px",
            color: "white",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          }}
        >
          {loading
            ? `Processing... (${progress}%)`
            : `Run Batch (${files.length} files)`}
        </button>

        {/* Progress bar */}
        {loading && (
          <div
            style={{
              marginTop: 14,
              width: "100%",
              height: 10,
              background: "#e0f2f1",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg,#ffb300,#fb8c00,#f4511e)",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        )}
      </div>

      {/* ------------------------------------------------------ */}
      {/* RESULTS TABLE */}
      {/* ------------------------------------------------------ */}
      {results.length > 0 && (
        <div
          style={{
            padding: "22px",
            borderRadius: "16px",
            background: "white",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            maxWidth: "850px",
            margin: "0 auto",
          }}
        >
          <h3 style={{ color: "#00695c", marginBottom: 18 }}>
            2️⃣ Results Summary ({results.length}/{files.length})
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr style={{ background: "#e0f2f1" }}>
                <th style={thStyle}>File Name</th>
                <th style={thStyle}>Output</th>
              </tr>
            </thead>

            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{r.name}</td>
                  <td style={tdStyle}>
                    {r.error ? (
                      <span style={{ color: "#c62828", fontWeight: 700 }}>
                        ❌ {r.error}
                      </span>
                    ) : (
                      <span style={{ color: "#004d40", fontWeight: 700 }}>
                        {r.num_points} points
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DOWNLOAD BUTTON */}
          <button
            onClick={downloadResults}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(120deg,#4caf50,#2e7d32)",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
            }}
          >
            ⬇ Download Results (JSON)
          </button>
        </div>
      )}
    </div>
  );
}

/* Table Styles */
const thStyle = {
  padding: "12px",
  textAlign: "left",
  color: "#004d40",
  fontWeight: 700,
  borderBottom: "2px solid #b2dfdb",
};

const tdStyle = {
  padding: "12px",
  color: "#37474f",
  fontWeight: 500,
};
