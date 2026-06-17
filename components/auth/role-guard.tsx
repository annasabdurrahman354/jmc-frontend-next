"use client";

import { useAuthStore } from "@/lib/auth/store";
import { canAccess } from "@/lib/rbac/permissions";
import type { Action, ModulName } from "@/lib/rbac/types";

type Props = {
  modul: ModulName;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGuard({ modul, action, children, fallback = null }: Props) {
  const perms = useAuthStore((s) => s.permissions);
  return canAccess(perms, modul, action) ? <>{children}</> : <>{fallback}</>;
}
