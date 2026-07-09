const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

export { API_KEY, API_URL };

export function errorDetail(json: unknown, status: number): string {
  if (json && typeof json === "object" && "detail" in json) {
    const detail = (json as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return typeof item === "string" ? item : null;
        })
        .filter((message): message is string => Boolean(message));
      if (messages.length > 0) return messages.join(" ");
    }
  }
  return `HTTP ${status}`;
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers?.get("content-type");
  let json: unknown = null;

  if (contentType?.includes("application/json")) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    throw new Error(errorDetail(json, response.status));
  }

  if (json === null) {
    throw new Error(`HTTP ${response.status}: empty response`);
  }

  return json as T;
}
