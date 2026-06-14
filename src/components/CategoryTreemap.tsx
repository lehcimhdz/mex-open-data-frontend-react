import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { squarify } from "../lib/treemap";
import type { Category } from "../api/types";

const PALETTE = [
  "var(--color-viz-1)",
  "var(--color-viz-2)",
  "var(--color-viz-3)",
  "var(--color-viz-4)",
  "var(--color-viz-5)",
  "var(--color-viz-6)",
];

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
    <div ref={ref} className="relative w-full overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-1)]" style={{ height }}>
      {rects.map((r, i) => {
        const fontSize = r.h < 28 ? 0 : Math.min(r.w / 8, 18);
        const colour = PALETTE[i % PALETTE.length];
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
              style={{ background: colour, color: "var(--color-ink-0)" }}
            >
              {fontSize > 9 ? (
                <div className="absolute inset-0 p-2 flex flex-col justify-end leading-tight">
                  <div
                    className="font-medium truncate"
                    style={{ fontSize, color: "var(--color-ink-0)" }}
                  >
                    {r.data.name}
                  </div>
                  <div
                    className="opacity-80 mono"
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
