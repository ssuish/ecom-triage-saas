const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY ?? "";

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  source: "email" | "form";
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  category: "billing" | "technical" | "general" | "other";
  escalate: boolean;
  ai_draft_reply: string | null;
  agent_reply: string | null;
  assigned_agent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketPage {
  items: Ticket[];
  total: number;
}

export interface TicketStatusResponse {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  agent_reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  email: string;
  name: string;
}

export interface TicketCreatePayload {
  subject: string;
  body: string;
  customer_email: string;
  customer_name: string;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.detail ?? `HTTP ${response.status}`);
  }
  return json as T;
}

export function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(payload),
  });
}

export function listTickets({
  token,
  status,
  priority,
  category,
  page = 1,
}: {
  token: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
}): Promise<TicketPage> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (category) params.set("category", category);
  params.set("page", String(page));
  return apiFetch<TicketPage>(`${API_URL}/tickets?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getTicket(id: string, token: string): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listAgents(token: string): Promise<Agent[]> {
  return apiFetch<Agent[]>(`${API_URL}/agents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function assignTicket(id: string, agentId: string, token: string): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${id}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agent_id: agentId }),
  });
}

export function saveReply(id: string, agentReply: string, token: string): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${id}/reply`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agent_reply: agentReply }),
  });
}

export function resolveTicket(id: string, token: string): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${id}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
}

export function getTicketStatus(id: string, token: string): Promise<TicketStatusResponse> {
  return apiFetch<TicketStatusResponse>(`${API_URL}/tickets/${id}/status`, {
    headers: { "x-magic-token": token },
  });
}
