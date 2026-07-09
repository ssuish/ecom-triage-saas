export function validateOperatorSearch(search: Record<string, unknown>) {
  return {
    status: typeof search.status === "string" ? search.status : undefined,
    priority: typeof search.priority === "string" ? search.priority : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    page:
      typeof search.page === "number"
        ? search.page
        : typeof search.page === "string" && search.page
          ? Number.parseInt(search.page, 10) || 1
          : 1,
    ticketId: typeof search.ticketId === "string" ? search.ticketId : undefined,
  };
}

export const defaultOperatorSearch = validateOperatorSearch({});
