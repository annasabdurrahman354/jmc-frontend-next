export const MODUL_LIST = [
  "Kelola Role",
  "Kelola User",
  "My Profile",
  "Dashboard",
  "Modul Data Pegawai",
  "Modul Tunjangan Transport",
  "Setting Tunjangan Transport",
  "Modul Log",
] as const;

export type ModulName = (typeof MODUL_LIST)[number];

export type Action = "read" | "create" | "update" | "delete";

export type PermissionScope = "All" | "Own" | "No";
