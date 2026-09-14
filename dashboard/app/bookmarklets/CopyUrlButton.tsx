"use client";

import { useState } from "react";

// Fallback for when dragging isn't convenient: copy the `javascript:` URL and
// paste it as the URL of a new bookmark.
export default function CopyUrlButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setState("done");
        } catch {
          setState("failed");
        }
        setTimeout(() => setState("idle"), 1500);
      }}
      className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
    >
      {state === "done" ? "URL gekopieerd ✓" : state === "failed" ? "kopiëren mislukt" : "kopieer URL"}
    </button>
  );
}
