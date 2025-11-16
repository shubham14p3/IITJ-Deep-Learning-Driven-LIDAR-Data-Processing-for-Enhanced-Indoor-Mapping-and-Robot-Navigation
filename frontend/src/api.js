const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

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
