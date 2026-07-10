export function validateTicketSearch(search: Record<string, unknown>) {
  return {
    token: typeof search.token === "string" ? search.token : "",
  };
}
