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
