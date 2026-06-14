import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./client";
import type { Category, Dataset, DatasetDetail, Organization, Resource } from "./types";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<{ status: string; version?: string }>("/health"),
    staleTime: 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<Category[]>("/categories"),
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => apiGet<Category>(`/categories/${slug}`),
    enabled: !!slug,
  });
}

export function useCategoryDatasets(
  slug: string | undefined,
  opts: { limit?: number; offset?: number; after?: string } = {}
) {
  return useQuery({
    queryKey: ["category-datasets", slug, opts],
    queryFn: () =>
      apiGet<Dataset[]>(`/categories/${slug}/datasets`, {
        limit: opts.limit ?? 50,
        offset: opts.offset,
        after: opts.after,
      }),
    enabled: !!slug,
  });
}

export function useDataset(slug: string | undefined) {
  return useQuery({
    queryKey: ["dataset", slug],
    queryFn: () => apiGet<DatasetDetail>(`/datasets/${slug}`),
    enabled: !!slug,
  });
}

export function useDatasetResources(slug: string | undefined) {
  return useQuery({
    queryKey: ["dataset-resources", slug],
    queryFn: () => apiGet<Resource[]>(`/datasets/${slug}/resources`),
    enabled: !!slug,
  });
}

export function useSearch(
  q: string,
  opts: { category?: string; format?: string; limit?: number; offset?: number } = {}
) {
  return useQuery({
    queryKey: ["search", q, opts],
    queryFn: () =>
      apiGet<Dataset[]>("/search", {
        q,
        category: opts.category,
        format: opts.format,
        limit: opts.limit ?? 50,
        offset: opts.offset,
      }),
    enabled: q.trim().length > 0,
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiGet<Organization[]>("/organizations"),
    retry: false,
  });
}
