"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem =
    totalItems !== undefined && itemsPerPage !== undefined
      ? (currentPage - 1) * itemsPerPage + 1
      : null;
  const endItem =
    totalItems !== undefined && itemsPerPage !== undefined
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 sm:flex-row pt-6",
        className
      )}
    >
      {startItem !== null && endItem !== null && totalItems !== undefined ? (
        <p className="text-xs sm:text-sm text-muted">
          Showing <span className="font-bold text-forest">{startItem}</span> to{" "}
          <span className="font-bold text-forest">{endItem}</span> of{" "}
          <span className="font-bold text-forest">{totalItems}</span> results
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 px-3 gap-1"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs font-bold text-muted select-none"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={cn(
                  "h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  currentPage === page
                    ? "bg-forest text-white shadow-xs"
                    : "border border-sage-border bg-white text-muted hover:border-forest/40 hover:bg-sage-subtle hover:text-forest"
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 px-3 gap-1"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
