import { useCallback, useEffect, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Ticket } from "@/shared/api/tickets";
import { StatusBadge } from "@/shared/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";

const columnHelper = createColumnHelper<Ticket>();

const columns = [
  columnHelper.accessor("subject", {
    header: "Subject",
    cell: (info) => (
      <span className="block max-w-[12rem] truncate type-body text-ink" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge value={info.getValue()} type="status" />,
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info) => <StatusBadge value={info.getValue()} type="priority" />,
  }),
  columnHelper.accessor("updated_at", {
    header: "Updated",
    cell: (info) => (
      <span className="type-mono tabular-nums text-ink-faint">{formatDate(info.getValue())}</span>
    ),
  }),
];

function rowLabel(ticket: Ticket): string {
  const status = ticket.status.replace(/_/g, " ");
  return `${ticket.subject}, status ${status}, priority ${ticket.priority}`;
}

interface TicketQueueTableProps {
  tickets: Ticket[];
  selectedId?: string;
  onSelect: (ticketId: string) => void;
  hasActiveFilters?: boolean;
}

export function TicketQueueTable({
  tickets,
  selectedId,
  onSelect,
  hasActiveFilters = false,
}: TicketQueueTableProps) {
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const [focusIndex, setFocusIndex] = useState(0);

  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  useEffect(() => {
    const selectedIndex = tickets.findIndex((ticket) => ticket.id === selectedId);
    if (selectedIndex >= 0) {
      setFocusIndex(selectedIndex);
    }
  }, [selectedId, tickets]);

  const setRowRef = useCallback((id: string, element: HTMLTableRowElement | null) => {
    if (element) {
      rowRefs.current.set(id, element);
    } else {
      rowRefs.current.delete(id);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTableRowElement>, index: number, ticketId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(ticketId);
        return;
      }

      let nextIndex: number | null = null;
      if (event.key === "ArrowDown") {
        nextIndex = Math.min(index + 1, tickets.length - 1);
      } else if (event.key === "ArrowUp") {
        nextIndex = Math.max(index - 1, 0);
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tickets.length - 1;
      }

      if (nextIndex !== null && nextIndex !== index) {
        event.preventDefault();
        const nextTicket = tickets[nextIndex];
        if (nextTicket) {
          setFocusIndex(nextIndex);
          rowRefs.current.get(nextTicket.id)?.focus();
        }
      }
    },
    [onSelect, tickets],
  );

  return (
    <Table role="grid" aria-label="Ticket queue">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} role="row">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} role="columnheader" className="type-small text-ink-faint">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow role="row">
            <TableCell colSpan={columns.length} className="type-body text-ink-muted">
              {hasActiveFilters
                ? "No tickets match these filters."
                : "No tickets in queue."}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, index) => (
            <TableRow
              key={row.id}
              ref={(element) => setRowRef(row.original.id, element)}
              role="row"
              data-state={row.original.id === selectedId ? "selected" : undefined}
              className="cursor-pointer"
              tabIndex={index === focusIndex ? 0 : -1}
              aria-selected={row.original.id === selectedId}
              aria-label={rowLabel(row.original)}
              onClick={() => onSelect(row.original.id)}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index, row.original.id)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} role="gridcell">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
