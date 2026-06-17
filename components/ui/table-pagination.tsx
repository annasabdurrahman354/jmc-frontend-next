"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  total: number;
  label?: string;
};

export function TablePagination({
  page,
  totalPages,
  onPage,
  total,
  label = "data",
}: TablePaginationProps) {
  if (totalPages <= 1) {
    return <div className="text-muted-foreground text-xs">Total {total} {label}</div>;
  }

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground text-xs">
        Hal {page} dari {totalPages} ({total} {label})
      </div>
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </li>
        {pages.map((p) => (
          <li key={p}>
            <Button
              variant={p === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPage(p)}
            >
              {p}
            </Button>
          </li>
        ))}
        <li>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
            aria-label="Berikutnya"
          >
            <ChevronRight className="size-4" />
          </Button>
        </li>
      </ul>
    </div>
  );
}
