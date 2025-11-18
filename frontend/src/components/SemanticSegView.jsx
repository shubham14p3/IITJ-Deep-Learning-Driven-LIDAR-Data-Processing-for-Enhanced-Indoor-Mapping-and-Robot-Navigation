import { useState, useRef } from "react";
import { segmentPointCloud, segmentRandom, API_BASE, segmentStream } from "../api";

// ⭐ CLASS MAP — modify according to your dataset
const CLASS_MAP = {
  0: "floor",
  1: "wall",
  2: "chair",
  3: "door",
  4: "ceiling",
  5: "table",
  6: "window",
  7: "sofa",
};

const CLASS_ICONS = {
  0: "🟦", // floor
  1: "🧱", // wall
  2: "🪑", // chair
  3: "🚪", // door
  4: "🕯️", // ceiling-ish
  5: "🧭", // table-ish
  6: "🪟", // window
  7: "🛋️", // sofa
};

export default function SemanticSegView() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ Streaming UI state
  const [progress, setProgress] = useState(null);

  // ⭐ Counters stored WITHOUT triggering rerenders
  const classCountsRef = useRef({});

  // ==========================================================
  // Helper: create class distribution from final labels
  // ==========================================================
  const computeClassCounts = (labels) => {
    return labels.reduce((acc, lbl) => {
      acc[lbl] = (acc[lbl] || 0) + 1;
      return acc;
    }, {});
  };

  // ==========================================================
  // Existing Normal Segmentation
  // ==========================================================
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErr("Please select a .npz file with 'points'.");
      return;
    }

    setErr("");
    setLoading(true);
    setResult(null);
    setProgress(null);

    try {
      const res = await segmentPointCloud(file);
      setResult({
        ...res,
        classCounts: computeClassCounts(res.labels),
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Existing Random Segmentation
  // ==========================================================
  const runRandomSegmentation = async () => {
    setErr("");
    setLoading(true);
    setResult(null);
    setProgress(null);

    try {
      const res = await segmentRandom();
      setResult({
        ...res,
        classCounts: computeClassCounts(res.labels),
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ⭐ Streaming Segmentation (Optimized)
  // ==========================================================
  const runStreamingSegmentation = async () => {
    if (!file) {
      setErr("Please select a .npz file with 'points'.");
      return;
    }

    console.log("Streaming segmentation started");

    setErr("");
    setLoading(true);
    setResult(null);
    setProgress({ current: 0, total: 0 });

    // Reset counters
    classCountsRef.current = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    };

    await segmentStream(
      file,

      // ---------------------- BATCH UPDATE ----------------------
      (update) => {
        if (update.header) {
          setProgress({ current: 0, total: update.total });
          return;
        }

        // Update batch progress
        setProgress((prev) => ({
          ...prev,
          current: update.batch,
        }));

        // ⭐ Update class counts without storing huge arrays
        update.preds.forEach((lbl) => {
          classCountsRef.current[lbl] =
            (classCountsRef.current[lbl] || 0) + 1;
        });
      },

      // ---------------------- FINAL COMPLETE ----------------------
      (final_labels) => {
        setResult({
          num_points: final_labels.length,
          labels: final_labels,
          classCounts: { ...classCountsRef.current },
        });

        setLoading(false);
        setProgress(null);
      }
    );
  };

  // progress percentage
  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px 16px 40px",
        fontFamily: "Poppins, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Gradient header */}
      <div
        style={{
          padding: "18px 22px",
          borderRadius: "18px",
          background:
            "linear-gradient(120deg, #004d40, #00897b, #26a69a)",
          color: "#e0f2f1",
          marginBottom: "24px",
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
              fontSize: "1.6rem",
              fontWeight: 700,
            }}
          >
            Semantic Segmentation Dashboard
          </h2>
          <p
            style={{
              marginTop: 4,
              fontSize: "0.85rem",
              opacity: 0.9,
            }}
          >
            Upload 3D LiDAR scans, stream predictions in batches, and inspect
            per-class statistics.
          </p>
        </div>

        {/* Small "LiDAR" illustrative circle */}
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
            fontSize: "1.8rem",
            boxShadow: "0 0 18px rgba(0,0,0,0.35)",
          }}
        >
          📡
        </div>
      </div>

      {/* Main content: 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.3fr)",
          gap: "20px",
        }}
      >
        {/* LEFT: Controls */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(224, 242, 241, 0.8)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.15)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: "1.1rem",
              color: "#004d40",
            }}
          >
            1️⃣ Load Scan
          </h3>
          <p
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: "0.9rem",
              color: "#315c53",
            }}
          >
            Upload a <b>.npz</b> file with a <code>points</code> array or try a
            random dataset sample.
          </p>

          <p style={{ marginBottom: 14, fontSize: "0.85rem" }}>
            Need a sample?{" "}
            <a
              href={`${API_BASE}/sample_npz`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#004d40",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Download sample .npz
            </a>
          </p>

          <form
            onSubmit={onSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
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
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#00796b",
                  fontWeight: 500,
                }}
              >
                Browse
              </span>
              <input
                type="file"
                accept=".npz"
                onChange={(e) => setFile(e.target.files[0] || null)}
                style={{ display: "none" }}
              />
            </label>

            {/* Normal segmentation */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading
                  ? "linear-gradient(120deg,#80cbc4,#4db6ac)"
                  : "linear-gradient(120deg,#00695c,#00897b)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
              }}
            >
              {loading ? "Processing..." : "Run Segmentation"}
            </button>

            <div
              style={{
                margin: "6px 0",
                fontSize: "0.8rem",
                color: "#607d8b",
                textAlign: "center",
              }}
            >
              — OR —
            </div>

            {/* Random segmentation */}
            <button
              type="button"
              disabled={loading}
              onClick={runRandomSegmentation}
              style={{
                background: loading
                  ? "linear-gradient(120deg,#b2dfdb,#80cbc4)"
                  : "linear-gradient(120deg,#00838f,#00acc1)",
                color: "#fff",
                padding: "9px 20px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              }}
            >
              {loading ? "Processing..." : "Run Random Segmentation"}
            </button>

            {/* Streaming segmentation */}
            <button
              type="button"
              disabled={loading}
              onClick={runStreamingSegmentation}
              style={{
                background: loading
                  ? "linear-gradient(120deg,#ce93d8,#ba68c8)"
                  : "linear-gradient(120deg,#6a1b9a,#8e24aa)",
                color: "#fff",
                padding: "9px 20px",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              {loading ? "Streaming..." : "Run Streaming Segmentation"}
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

          {/* Streaming Progress */}
          {progress && (
            <div
              style={{
                marginTop: 18,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#fffde7",
                border: "1px solid #fff59d",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span>Streaming batches…</span>
                <span>
                  {progress.current} / {progress.total} ({progressPercent}%)
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 999,
                  background: "#eee",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg,#ffb300,#ff8f00,#f4511e)",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Result / Legend */}
        <div
          style={{
            position: "relative",
          }}
        >
          {/* Decorative bg blob */}
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

          {result ? (
            <div
              style={{
                padding: "20px 20px 18px",
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    color: "#004d40",
                  }}
                >
                  Segmentation Result
                </h3>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#e0f2f1",
                    fontSize: "0.75rem",
                    color: "#00695c",
                    fontWeight: 600,
                  }}
                >
                  {result.num_points.toLocaleString()} pts
                </span>
              </div>

              {/* First labels */}
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "#f1f8e9",
                  border: "1px dashed #c5e1a5",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#558b2f",
                    marginBottom: 6,
                  }}
                >
                  First 30 labels
                </div>
                <code
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    wordBreak: "break-word",
                    color: "#33691e",
                  }}
                >
                  {result.labels.slice(0, 30).join(", ")}
                </code>
              </div>

              {/* Class legend cards */}
              <h4
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  fontSize: "0.95rem",
                  color: "#00695c",
                }}
              >
                Class Legend
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {Object.entries(CLASS_MAP).map(([label, meaning]) => (
                  <div
                    key={label}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#e0f2f1",
                        fontSize: "1.1rem",
                      }}
                    >
                      {CLASS_ICONS[label] || "🔹"}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#37474f",
                        }}
                      >
                        {meaning}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#78909c",
                        }}
                      >
                        Label {label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Class distribution */}
              <h4
                style={{
                  marginTop: 6,
                  marginBottom: 6,
                  fontSize: "0.95rem",
                  color: "#00695c",
                }}
              >
                Class Distribution
              </h4>
              <div
                style={{
                  maxHeight: 180,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.85rem",
                  }}
                >
                  {result.classCounts &&
                    Object.entries(result.classCounts).map(([lbl, cnt]) => (
                      <li
                        key={lbl}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "1px dashed #eceff1",
                        }}
                      >
                        <span>
                          <b>{CLASS_ICONS[lbl] || "🔹"}</b>{" "}
                          <b>{CLASS_MAP[lbl] || "Unknown"}</b> ({lbl})
                        </span>
                        <span style={{ color: "#455a64" }}>
                          {cnt.toLocaleString()} pts
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
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
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
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
                  🖼️
                </span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    No segmentation yet
                  </div>
                  <div>
                    Upload a <code>.npz</code> file and run any of the three
                    modes to see predictions and per-class stats here.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fade animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
