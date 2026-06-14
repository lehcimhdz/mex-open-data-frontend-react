import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { apiGet, apiGetWithHeaders } from "./client";
import type { Category, Dataset, DatasetDetail } from "./types";

/**
 * Hook factory that returns `onMouseEnter` / `onFocus` handlers which warm
 * the React Query cache for the link the user is about to follow. The
 * actual fetch only happens once per (target, session) — repeat hovers are
 * deduplicated by both TanStack Query (`ensureQueryData`) and a local Set.
 */
export function useHoverPrefetch() {
  const qc = useQueryClient();
  const warmed = useRef(new Set<string>());

  const dataset = useCallback(
    (slug: string) => {
      const key = `ds:${slug}`;
      if (warmed.current.has(key)) return;
      warmed.current.add(key);
      qc.prefetchQuery({
        queryKey: ["dataset", slug],
        queryFn: () => apiGet<DatasetDetail>(`/datasets/${slug}`),
        staleTime: 5 * 60 * 1000,
      });
    },
    [qc]
  );

  const category = useCallback(
    (slug: string) => {
      const key = `cat:${slug}`;
      if (warmed.current.has(key)) return;
      warmed.current.add(key);
      qc.prefetchQuery({
        queryKey: ["category", slug],
        queryFn: () => apiGet<Category>(`/categories/${slug}`),
        staleTime: 5 * 60 * 1000,
      });
      qc.prefetchQuery({
        queryKey: [
          "dataset-list",
          {
            category: slug,
            sort: "recent",
            limit: 100,
            offset: 0,
          },
        ],
        queryFn: () =>
          apiGetWithHeaders<Dataset[]>("/datasets", {
            category: slug,
            sort: "recent",
            limit: 100,
            offset: 0,
          }),
        staleTime: 5 * 60 * 1000,
      });
    },
    [qc]
  );

  return { dataset, category };
}
