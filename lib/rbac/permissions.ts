import type { Permission } from "@/lib/api/types";
import type { Action, ModulName } from "./types";

export function canAccess(
  perms: Permission[],
  modul: ModulName,
  action: Action,
): boolean {
  const p = perms.find((x) => x.modulFitur === modul);
  if (!p || !p.akses) return false;
  switch (action) {
    case "read":
      return p.read !== "No";
    case "create":
      return p.create;
    case "update":
      return p.update !== "No";
    case "delete":
      return p.delete !== "No";
  }
}

export function canRead(perms: Permission[], modul: ModulName) {
  return canAccess(perms, modul, "read");
}
export function canCreate(perms: Permission[], modul: ModulName) {
  return canAccess(perms, modul, "create");
}
export function canUpdate(perms: Permission[], modul: ModulName) {
  return canAccess(perms, modul, "update");
}
export function canDelete(perms: Permission[], modul: ModulName) {
  return canAccess(perms, modul, "delete");
}
