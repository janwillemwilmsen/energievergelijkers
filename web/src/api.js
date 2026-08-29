async function req(path, opts) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("markdown") || ct.includes("text/plain")) return res.text();
  return res.json();
}

export const api = {
  meta: () => req("/api/meta"),
  settings: () => req("/api/settings"),
  saveSettings: (body) => req("/api/settings", { method: "PUT", body: JSON.stringify(body) }),
  latest: () => req("/api/results/latest"),
  trends: (q = {}) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && p.set(k, v));
    return req(`/api/trends?${p}`);
  },
  snapshots: () => req("/api/snapshots"),
  snapshotText: (kind, id) => req(`/api/snapshots/${kind}/${id}`),
  snapshotUrl: (kind, id, download = false) =>
    `/api/snapshots/${kind}/${id}${download ? "?download=1" : ""}`,
  compare: (body) => req("/api/compare", { method: "POST", body: JSON.stringify(body) }),
  compareStatus: (id) => req(`/api/compare/status/${id}`),
};
