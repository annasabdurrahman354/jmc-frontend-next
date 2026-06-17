"use client";

import * as React from "react";

import { AppBreadcrumb } from "@/components/layout/app-breadcrumb";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  actions,
  className,
}: {
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  if (!title && !actions) return null;

  return (
    <div
      className={cn(
        "mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex-1 space-y-1">
        <AppBreadcrumb />
        {title ? (
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
