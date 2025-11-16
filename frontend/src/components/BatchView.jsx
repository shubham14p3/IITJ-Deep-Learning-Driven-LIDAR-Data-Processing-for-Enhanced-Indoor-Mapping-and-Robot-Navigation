import { useState } from "react";
import { segmentPointCloud } from "../api";

export default function BatchView() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runBatch = async () => {
    if (!files.length) return;
    setLoading(true);
    const out = [];
    for (const f of files) {
      try {
        const res = await segmentPointCloud(f);
        out.push({ name: f.name, num_points: res.num_points });
      } catch (e) {
        out.push({ name: f.name, error: e.message });
      }
    }
    setResults(out);
    setLoading(false);
  };

  return (
    <div>
      <h2>4. Batch Segmentation</h2>
      <p>Run segmentation on multiple scans and see a summary.</p>
      <input
        type="file"
        multiple
        accept=".npz"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button onClick={runBatch} disabled={loading || !files.length}>
        {loading ? "Processing..." : "Run Batch"}
      </button>
      <ul>
        {results.map((r, i) => (
          <li key={i}>
            {r.name} —{" "}
            {r.error ? (
              <span style={{ color: "red" }}>{r.error}</span>
            ) : (
              `${r.num_points} points`
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
