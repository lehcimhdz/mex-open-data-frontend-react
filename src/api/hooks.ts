import { useQuery } from "@tanstack/react-query";
import { apiGet, apiGetWithHeaders } from "./client";
import type {
  Category,
  Dataset,
  DatasetDetail,
  EdaIndex,
  EdaProfile,
  EdaSample,
  Organization,
  Resource,
  Stats,
} from "./types";

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

export function useOrganizations(opts: { limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: ["organizations", opts],
    queryFn: () =>
      apiGet<Organization[]>("/organizations", {
        limit: opts.limit ?? 200,
        offset: opts.offset,
      }),
    retry: false,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<Stats>("/stats"),
    staleTime: 60_000,
  });
}

export type DatasetListOpts = {
  category?: string;
  organization?: string;
  format?: string;
  sort?: "recent" | "title" | "slug";
  limit?: number;
  offset?: number;
};

export function useDatasetList(opts: DatasetListOpts = {}) {
  return useQuery({
    queryKey: ["dataset-list", opts],
    queryFn: () =>
      apiGetWithHeaders<Dataset[]>("/datasets", {
        category: opts.category,
        organization: opts.organization,
        format: opts.format,
        sort: opts.sort ?? "recent",
        limit: opts.limit ?? 50,
        offset: opts.offset ?? 0,
      }),
    placeholderData: (prev) => prev,
  });
}

export type ResourcePreview = {
  resource_id: string;
  columns: string[];
  rows: string[][];
  row_count?: number;
  truncated?: boolean;
  delimiter?: string;
  bytes?: number;
};

export function useResourcePreview(rid: string | undefined, rows = 200) {
  return useQuery({
    queryKey: ["resource-preview", rid, rows],
    queryFn: () =>
      apiGet<ResourcePreview>(`/resources/${rid}/preview`, { rows }),
    enabled: !!rid,
    retry: false,
  });
}

export function useEdaProfile(slug: string | undefined) {
  return useQuery({
    queryKey: ["eda-profile", slug],
    queryFn: () => apiGet<EdaProfile>(`/datasets/${slug}/eda`),
    enabled: !!slug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEdaSample(slug: string | undefined) {
  return useQuery({
    queryKey: ["eda-sample", slug],
    queryFn: () => apiGet<EdaSample>(`/datasets/${slug}/eda/sample`),
    enabled: !!slug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEdaIndex() {
  return useQuery({
    queryKey: ["eda-index"],
    queryFn: () => apiGet<EdaIndex>("/eda/stats"),
    retry: false,
    staleTime: 60_000,
  });
}
