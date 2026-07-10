import { API_KEY, API_URL, apiFetch } from "./client";

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

export interface TicketCreateResult extends Ticket {
  magic_token: string;
}

export function createTicket(
  payload: TicketCreatePayload,
  signal?: AbortSignal,
): Promise<TicketCreateResult> {
  return apiFetch<TicketCreateResult>(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(payload),
    signal,
  });
}

export function listTickets({
  token,
  status,
  priority,
  category,
  page = 1,
  signal,
}: {
  token: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  signal?: AbortSignal;
}): Promise<TicketPage> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (category) params.set("category", category);
  params.set("page", String(page));
  return apiFetch<TicketPage>(`${API_URL}/tickets?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
}

export function getTicket(id: string, token: string, signal?: AbortSignal): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
}

export function listAgents(token: string, signal?: AbortSignal): Promise<Agent[]> {
  return apiFetch<Agent[]>(`${API_URL}/agents`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
}

export function assignTicket(
  id: string,
  agentId: string,
  token: string,
  signal?: AbortSignal,
): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${encodeURIComponent(id)}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agent_id: agentId }),
    signal,
  });
}

export function saveReply(
  id: string,
  agentReply: string,
  token: string,
  signal?: AbortSignal,
): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${encodeURIComponent(id)}/reply`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agent_reply: agentReply }),
    signal,
  });
}

export function resolveTicket(id: string, token: string, signal?: AbortSignal): Promise<Ticket> {
  return apiFetch<Ticket>(`${API_URL}/tickets/${encodeURIComponent(id)}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
    signal,
  });
}

export function getTicketStatus(
  id: string,
  token: string,
  signal?: AbortSignal,
): Promise<TicketStatusResponse> {
  return apiFetch<TicketStatusResponse>(`${API_URL}/tickets/${encodeURIComponent(id)}/status`, {
    headers: { "x-magic-token": token },
    signal,
  });
}
