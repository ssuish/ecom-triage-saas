import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  createTicket,
  listTickets,
  getTicket,
  listAgents,
  assignTicket,
  saveReply,
  resolveTicket,
  getTicketStatus,
} from "./api";

const API_URL = "http://localhost:8080";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

test("createTicket posts to /tickets with x-api-key", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ id: "t1", subject: "S" }),
  } as Response);

  const result = await createTicket({
    subject: "S",
    body: "B",
    customer_email: "a@b.com",
    customer_name: "A",
  });
  expect(fetch).toHaveBeenCalledWith(
    `${API_URL}/tickets`,
    expect.objectContaining({ method: "POST" })
  );
  expect(result.id).toBe("t1");
});

test("listTickets gets /tickets with Clerk token", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ items: [], total: 0 }),
  } as Response);

  await listTickets({ token: "clerk-jwt", status: "open" });
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/tickets?status=open");
  expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer clerk-jwt");
});

test("listAgents gets /agents with Clerk token", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => [],
  } as Response);

  await listAgents("clerk-jwt");
  const [url, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect(url).toContain("/agents");
  expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer clerk-jwt");
});

test("getTicketStatus passes token as x-magic-token header", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ id: "t1", subject: "S", status: "open", agent_reply: null }),
  } as Response);

  await getTicketStatus("t1", "magic-tok");
  const [, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
  expect((opts.headers as Record<string, string>)["x-magic-token"]).toBe("magic-tok");
});

test("api throws on non-ok response", async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ detail: "Not found" }),
  } as Response);

  await expect(getTicketStatus("bad-id", "bad-tok")).rejects.toThrow("Not found");
});
