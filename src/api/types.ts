export type Category = {
  slug: string;
  name: string;
  description?: string | null;
  dataset_count?: number;
  updated_at?: string | null;
};

export type Resource = {
  resource_id: string;
  name?: string | null;
  format?: string | null;
  download_url?: string | null;
  file_size?: number | null;
};

export type Dataset = {
  slug: string;
  category_slug?: string | null;
  category_name?: string | null;
  title: string;
  description?: string | null;
  organization?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  last_updated?: string | null;
  resource_count?: number;
  ingested_at?: string | null;
  url?: string | null;
};

export type DatasetDetail = Dataset & {
  resources: Resource[];
  tags?: string[];
  license_name?: string | null;
  license_url?: string | null;
  created?: string | null;
};

export type Organization = {
  slug: string;
  title: string;
  description?: string | null;
  dataset_count: number;
  image_url?: string | null;
  created?: string | null;
  url?: string | null;
};

export type StatsTopItem = { slug: string; name: string; count: number };

export type EdaTopValue = { value: string; count: number };
export type EdaNumeric = {
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  p95: number;
  histogram: { bin: string; count: number }[];
};
export type EdaTemporal = {
  min: string;
  max: string;
  bucket: string;
  buckets: { period: string; count: number }[];
};
export type EdaColumn = {
  name: string;
  type: "number" | "string" | "date" | "bool" | "categorical" | "empty";
  non_null: number;
  null_pct: number;
  distinct: number;
  top_values: EdaTopValue[];
  numeric?: EdaNumeric;
  temporal?: EdaTemporal;
};
export type EdaCorrelation = { a: string; b: string; r: number };
export type EdaCrossTab = {
  x: string;
  y: string;
  x_labels: string[];
  y_labels: string[];
  matrix: number[][];
  chi2?: number;
};
export type EdaClusters = {
  k: number;
  feature_columns: string[];
  projection: string;
  centroids: number[][];
  sample_points: { cluster: number; x: number; y: number }[];
};
export type EdaProfile = {
  version: number;
  dataset_slug: string;
  category_slug: string | null;
  generated_at: string;
  resource: {
    id: string;
    name: string | null;
    format: string | null;
    delimiter: string;
    byte_size: number | null;
    bytes_read: number;
    truncated: boolean;
    source_url: string;
  };
  shape: { rows: number; rows_sampled: number; columns: number };
  columns: EdaColumn[];
  column_types: Record<string, string>;
  summary_counts: { numeric: number; categorical: number; date: number };
  correlations: EdaCorrelation[];
  correlation_matrix: { columns: string[]; matrix: number[][] };
  cross_tabs: EdaCrossTab[];
  clusters: EdaClusters | null;
  narrative: string;
};

export type EdaSample = { columns: string[]; rows: (string | null)[][] };

export type EdaIndex = {
  version: number;
  generated_at: string;
  totals: {
    datasets: number;
    with_eda: number;
    skipped_no_csv: number;
    skipped_fresh: number;
    failed: number;
  };
  by_category: {
    slug: string;
    total: number;
    with_eda: number;
    pct: number;
    breakdown: Record<string, number>;
  }[];
  failures: { slug: string; reason: string }[];
};

export type Stats = {
  datasets: number;
  categories: number;
  organizations: number;
  resources: number;
  fresh_30d: number;
  latest_update: string | null;
  top_categories: StatsTopItem[];
  top_organizations: StatsTopItem[];
  format_breakdown: StatsTopItem[];
};
