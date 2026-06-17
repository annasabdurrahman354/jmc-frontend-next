"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { pathLabels } from "@/lib/types/menu";
import { cn } from "@/lib/utils";

export function AppBreadcrumb() {
  const pathname = usePathname();

  const crumbs = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const result: { label: string; to: string }[] = [
      { label: "Home", to: "/" },
    ];

    let accumulated = "";
    parts.forEach((part) => {
      accumulated += "/" + part;
      result.push({
        label:
          pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1),
        to: accumulated,
      });
    });

    return result;
  }, [pathname]);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="breadcrumb">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li
              key={crumb.to}
              className={cn(
                "flex items-center gap-1",
                isLast && "text-foreground font-medium",
              )}
            >
              {!isLast ? (
                <Link
                  href={crumb.to}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 opacity-60" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
