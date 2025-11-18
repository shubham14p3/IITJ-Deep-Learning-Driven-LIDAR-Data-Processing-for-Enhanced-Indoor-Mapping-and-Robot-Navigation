export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function segmentPointCloud(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/segment`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("segment API failed");
  return res.json();
}

export async function segmentRandom() {
  const res = await fetch(`${API_BASE}/segment_random`);
  return res.json();
}

export async function buildMap(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/build_map`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("build_map API failed");
  return res.json();
}

export async function getMap() {
  const res = await fetch(`${API_BASE}/get_map`);
  if (!res.ok) throw new Error("get_map API failed");
  return res.json();
}

export async function rlResetRandom() {
  const res = await fetch(`${API_BASE}/rl_reset_random`, { method: "POST" });
  if (!res.ok) throw new Error("rl_reset_random failed");
  return res.json();
}

export async function rlResetFromMap() {
  const res = await fetch(`${API_BASE}/rl_reset_from_map`, { method: "POST" });
  if (!res.ok) throw new Error("rl_reset_from_map failed");
  return res.json();
}

export async function rlStep() {
  const res = await fetch(`${API_BASE}/rl_step`, { method: "POST" });
  if (!res.ok) throw new Error("rl_step failed");
  return res.json();
}
export function downloadRandomScene() {
  return `${API_BASE}/random_scene_npz`;
}

/* 
  ❗️ Correct Streaming Segmentation Function 
  Do NOT add another `segmentStream` above this.
*/
// 🚀 SSE Streaming API
export async function segmentStream(file, onBatch, onComplete) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/segment_stream`;

    const formData = new FormData();
    formData.append("file", file);

    // Create fetch request
    fetch(url, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.body) {
        reject(new Error("No response body received"));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // Split events
          const parts = buffer.split("\n\n");
          buffer = parts.pop(); // last incomplete

          for (let part of parts) {
            if (!part.startsWith("data:")) continue;

            const jsonStr = part.replace("data:", "").trim();
            const data = JSON.parse(jsonStr);

            // Header
            if (data.total_batches) {
              onBatch({ header: true, total: data.total_batches });
              continue;
            }

            // Normal batch update
            if (data.batch && data.preds) {
              onBatch({ batch: data.batch, preds: data.preds });
              continue;
            }

            // Final completion
            if (data.done && data.final) {
              onComplete(data.final);
              resolve();
            }
          }

          read();
        });
      }

      read();
    });
  });
}

