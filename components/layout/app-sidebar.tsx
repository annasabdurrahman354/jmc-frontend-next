"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard } from "lucide-react";

import { menuItems, type MenuItem } from "@/lib/types/menu";
import { cn } from "@/lib/utils";
import { usePermissionFilteredMenu } from "@/hooks/use-filtered-menu";
import { useSidebar } from "@/hooks/use-sidebar";

export const APP_NAME = "Admin JMC";

function isActivePath(currentPath: string, target: string) {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(target + "/");
}

function hasActiveChild(item: MenuItem, pathname: string) {
  if (!item.children) return false;
  return item.children.some((c) => isActivePath(pathname, c.to));
}

function NavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  if (!item.children) {
    const active = item.to ? isActivePath(pathname, item.to) : false;
    const Icon = item.icon ?? LayoutDashboard;
    return (
      <Link
        href={item.to ?? "#"}
        className={cn(
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active && "sidebar-active-bg hover:bg-sidebar-primary",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span>{item.title}</span>
      </Link>
    );
  }

  const parentActive = hasActiveChild(item, pathname);
  const Icon = item.icon ?? LayoutDashboard;
  return (
    <details
      open={parentActive}
      className="group [&>summary::-webkit-details-marker]:hidden"
    >
      <summary
        className={cn(
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors [&::-webkit-details-marker]:hidden",
          parentActive && "text-sidebar-accent-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{item.title}</span>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="border-sidebar-border mt-1 ml-4 space-y-1 border-l pl-3">
        {item.children.map((child) => {
          const active = isActivePath(pathname, child.to);
          return (
            <li key={child.to}>
              <Link
                href={child.to}
                className={cn(
                  "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground block rounded-md px-3 py-1.5 text-sm transition-colors",
                  active &&
                    "text-sidebar-accent-foreground font-semibold underline-offset-4",
                )}
              >
                {child.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const filtered = usePermissionFilteredMenu(menuItems);
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border hidden shrink-0 flex-col border-r lg:flex transition-[width,border-color] duration-300 ease-in-out",
        isCollapsed ? "w-0 border-r-transparent overflow-hidden" : "w-64",
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <Image
          src="/images/logo/logo_jmc.png"
          alt="Logo JMC"
          width={45}
          height={15}
          className="h-4 w-auto"
        />
        <Link
          href="/"
          className="text-sidebar-foreground text-sm font-bold tracking-tight"
        >
          {APP_NAME}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filtered.map((item) => (
          <NavItem key={item.title} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
