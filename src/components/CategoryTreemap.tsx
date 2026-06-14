import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { squarify } from "../lib/treemap";
import type { Category } from "../api/types";

// Monochrome stone ramp — the largest (index 0) gets the cinnabar accent so
// the eye lands there. Everything else uses graduated neutral tones.
function colourFor(index: number, total: number): { bg: string; text: string } {
  if (index === 0) {
    return { bg: "var(--color-accent-600)", text: "var(--color-ink-0)" };
  }
  // Map remaining rectangles linearly from a darker to a lighter stone tone.
  const t = total <= 2 ? 0.5 : (index - 1) / Math.max(total - 2, 1);
  const stops = [
    { bg: "var(--ramp-1)", text: "var(--ramp-text-light)" },
    { bg: "var(--ramp-2)", text: "var(--ramp-text-light)" },
    { bg: "var(--ramp-3)", text: "var(--ramp-text-dark)" },
    { bg: "var(--ramp-4)", text: "var(--ramp-text-dark)" },
  ];
  const idx = Math.min(stops.length - 1, Math.floor(t * stops.length));
  return stops[idx];
}

export function CategoryTreemap({
  categories,
  height = 360,
}: {
  categories: Category[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const sorted = [...categories]
    .filter((c) => (c.dataset_count ?? 0) > 0)
    .sort((a, b) => (b.dataset_count ?? 0) - (a.dataset_count ?? 0));

  const rects = squarify(
    sorted.map((c) => ({ data: c, weight: c.dataset_count ?? 1 })),
    width,
    height
  );

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)] treemap"
      style={{ height }}
    >
      {rects.map((r, i) => {
        const fontSize = r.h < 28 ? 0 : Math.min(r.w / 8, 18);
        const { bg, text } = colourFor(i, rects.length);
        return (
          <Link
            key={r.data.slug}
            to={`/categorias/${r.data.slug}`}
            className="absolute group focus-visible:outline-none"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
            title={`${r.data.name} · ${r.data.dataset_count ?? 0} datasets`}
          >
            <div
              className="absolute inset-px rounded-[2px] transition-transform group-hover:scale-[0.985] group-focus-visible:scale-[0.985] group-hover:shadow-md"
              style={{ background: bg, color: text }}
            >
              {fontSize > 9 ? (
                <div className="absolute inset-0 p-2.5 flex flex-col justify-end leading-tight">
                  <div
                    className="font-medium truncate"
                    style={{ fontSize, color: text }}
                  >
                    {r.data.name}
                  </div>
                  <div
                    className="opacity-70 mono"
                    style={{ fontSize: Math.max(fontSize * 0.55, 9) }}
                  >
                    {r.data.dataset_count ?? 0}
                  </div>
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
