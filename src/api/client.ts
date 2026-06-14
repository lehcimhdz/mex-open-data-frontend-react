import { config } from "../config";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown = null) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const base = config.apiBaseUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.append(k, String(v));
      }
    }
  }
  // If apiBaseUrl is absolute, drop our origin
  if (/^https?:/.test(config.apiBaseUrl)) {
    return `${config.apiBaseUrl.replace(/\/$/, "")}${url.pathname}${url.search}`;
  }
  return `${url.pathname}${url.search}`;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = buildUrl(path, params);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (config.apiKey) headers["X-API-Key"] = config.apiKey;

  const res = await fetch(url, { headers });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `HTTP ${res.status}`) ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}
