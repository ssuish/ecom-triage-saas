export function parseTicketRoute(pathname: string, search: string): { ticketId: string; token: string } | null {
  const match = pathname.match(/^\/ticket\/([^/]+)\/?$/);
  const token = new URLSearchParams(search).get("token");
  if (!match || !token) return null;
  return { ticketId: match[1], token };
}
