// One distinct color family per comparison platform, used across the archive.
export const PLATFORM_COLORS: Record<
  string,
  { hex: string; bg: string; border: string; text: string; chip: string }
> = {
  gaslicht: { hex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", chip: "bg-amber-100 text-amber-800" },
  energiekiezer: { hex: "#0ea5e9", bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700", chip: "bg-sky-100 text-sky-800" },
  energievergelijk: { hex: "#a855f7", bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", chip: "bg-purple-100 text-purple-800" },
  independer: { hex: "#6366f1", bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-700", chip: "bg-indigo-100 text-indigo-800" },
  overstappen: { hex: "#ef4444", bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", chip: "bg-rose-100 text-rose-800" },
  pricewise: { hex: "#14b8a6", bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-700", chip: "bg-teal-100 text-teal-800" },
};

export const platformColor = (name: string) =>
  PLATFORM_COLORS[name] ?? {
    hex: "#64748b", bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-700", chip: "bg-slate-100 text-slate-700",
  };
