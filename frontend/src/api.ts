const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface TicketStatusResponse {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  agent_reply: string | null;
  created_at: string;
  updated_at: string;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.detail ?? `HTTP ${response.status}`);
  }
  return json as T;
}

export function getTicketStatus(id: string, token: string): Promise<TicketStatusResponse> {
  return apiFetch<TicketStatusResponse>(`${API_URL}/tickets/${id}/status`, {
    headers: { "x-magic-token": token },
  });
}
