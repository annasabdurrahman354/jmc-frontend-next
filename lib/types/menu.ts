import {
  LayoutDashboard,
  User,
  Database,
  Users,
  History,
  type LucideIcon,
} from "lucide-react";
import type { ModulName, Action } from "@/lib/rbac/types";

export type MenuChild = {
  title: string;
  to: string;
  requiredPermission?: { modul: ModulName; action: Action };
};

export type MenuItem = {
  title: string;
  to?: string;
  icon?: LucideIcon;
  requiredPermission?: { modul: ModulName; action: Action };
  children?: MenuChild[];
};

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    to: "/",
    requiredPermission: { modul: "Dashboard", action: "read" },
  },
  {
    title: "Data Pegawai",
    icon: User,
    to: "/pegawai",
    requiredPermission: { modul: "Modul Data Pegawai", action: "read" },
  },
  {
    title: "Tunjangan",
    icon: Database,
    requiredPermission: { modul: "Modul Tunjangan Transport", action: "read" },
    children: [
      {
        title: "Setting Tunjangan Transport",
        to: "/tunjangan/setting",
        requiredPermission: { modul: "Setting Tunjangan Transport", action: "read" },
      },
      {
        title: "Tunjangan Transport",
        to: "/tunjangan/transport",
        requiredPermission: { modul: "Modul Tunjangan Transport", action: "read" },
      },
    ],
  },
  {
    title: "Manajemen User",
    icon: Users,
    requiredPermission: { modul: "Kelola User", action: "read" },
    children: [
      {
        title: "Manajemen Role",
        to: "/user/role",
        requiredPermission: { modul: "Kelola Role", action: "read" },
      },
      {
        title: "Manajemen User",
        to: "/user/manage",
        requiredPermission: { modul: "Kelola User", action: "read" },
      },
    ],
  },
  {
    title: "Log Aktifitas",
    icon: History,
    to: "/log",
    requiredPermission: { modul: "Modul Log", action: "read" },
  },
];

export const pathLabels: Record<string, string> = {
  pegawai: "Data Pegawai",
  tunjangan: "Tunjangan",
  setting: "Setting Tunjangan Transport",
  transport: "Tunjangan Transport",
  user: "Manajemen User",
  role: "Manajemen Role",
  manage: "Manajemen User",
  log: "Log Aktifitas",
  form: "Form Pegawai",
  "hak-akses": "Hak Akses",
  detail: "Detail",
  profile: "Profil Saya",
};
