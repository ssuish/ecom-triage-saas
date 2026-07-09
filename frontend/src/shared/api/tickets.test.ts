import { test, expect, vi, beforeEach } from "vitest";
import {
  createTicket,
  listTickets,
  getTicket,
  listAgents,
  assignTicket,
  saveReply,
  resolveTicket,
  getTicketStatus,
} from "./tickets";

const API_URL = "http://localhost:8080";
const JSON_HEADERS = new Headers({ "content-type": "application/json" });

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    headers: JSON_HEADERS,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

test("createTicket posts to /tickets with x-api-key", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: "t1", subject: "S" }));

  const result = await createTicket({
    subject: "S",
    body: "B",
    customer_email: "a@b.com",
    customer_name: "A",
  });
  const [, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(fetch).toHaveBeenCalledWith(
    `${API_URL}/tickets`,
    expect.objectContaining({ method: "POST" }),
  );
  expect((opts.headers as Record<string, string>)["x-api-key"]).toBeDefined();
  expect(result.id).toBe("t1");
});

test("listTickets gets /tickets with Clerk token", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ items: [], total: 0 }));

  await listTickets({ token: "clerk-jwt", status: "open" });
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/tickets?status=open");
  expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer clerk-jwt");
});

test("getTicket gets ticket with Clerk token", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: "t1", subject: "S" }));

  await getTicket("t1", "clerk-jwt");
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/tickets/t1");
  expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer clerk-jwt");
});

test("listAgents gets /agents with Clerk token", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse([]));

  await listAgents("clerk-jwt");
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/agents");
  expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer clerk-jwt");
});

test("assignTicket patches assign endpoint", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: "t1", assigned_agent_id: "a1" }));

  await assignTicket("t1", "a1", "clerk-jwt");
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/tickets/t1/assign");
  expect(opts.method).toBe("PATCH");
});

test("saveReply patches reply endpoint", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: "t1", agent_reply: "Hi" }));

  await saveReply("t1", "Hi", "clerk-jwt");
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/tickets/t1/reply");
  expect(opts.method).toBe("PATCH");
});

test("resolveTicket patches resolve endpoint", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: "t1", status: "resolved" }));

  await resolveTicket("t1", "clerk-jwt");
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/tickets/t1/resolve");
  expect(opts.method).toBe("PATCH");
});

test("getTicketStatus passes token as x-magic-token header", async () => {
  vi.mocked(fetch).mockResolvedValue(
    jsonResponse({ id: "t1", subject: "S", status: "open", agent_reply: null }),
  );

  await getTicketStatus("t1", "magic-tok");
  const [, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect((opts.headers as Record<string, string>)["x-magic-token"]).toBe("magic-tok");
});

test("api throws on non-ok response", async () => {
  vi.mocked(fetch).mockResolvedValue(jsonResponse({ detail: "Not found" }, 404));

  await expect(getTicketStatus("bad-id", "bad-tok")).rejects.toThrow("Not found");
});

test("api throws on non-json error response", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    status: 502,
    headers: new Headers({ "content-type": "text/html" }),
  } as Response);

  await expect(getTicketStatus("bad-id", "bad-tok")).rejects.toThrow("HTTP 502");
});

test("api passes abort signal", async () => {
  const controller = new AbortController();
  vi.mocked(fetch).mockResolvedValue(
    jsonResponse({ id: "t1", subject: "S", status: "open", agent_reply: null }),
  );

  await getTicketStatus("t1", "magic-tok", controller.signal);
  const [, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(opts.signal).toBe(controller.signal);
});
