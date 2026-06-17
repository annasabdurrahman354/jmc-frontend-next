"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  User as UserIcon,
} from "lucide-react";

import { useSidebar } from "@/hooks/use-sidebar";
import { getInitials } from "@/lib/utils";
import { menuItems, type MenuItem } from "@/lib/types/menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth/store";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { usePermissionFilteredMenu } from "@/hooks/use-filtered-menu";

function isActivePath(currentPath: string, target: string) {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(target + "/");
}

function hasActiveChild(item: MenuItem, pathname: string) {
  if (!item.children) return false;
  return item.children.some((c) => isActivePath(pathname, c.to));
}

function NavItems({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        if (!item.children) {
          const active = item.to ? isActivePath(pathname, item.to) : false;
          const Icon = item.icon ?? UserIcon;
          return (
            <Link
              key={item.title}
              href={item.to ?? "#"}
              className={cn(
                "text-sidebar-foreground/80 hover:bg-sidebar-accent flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active && "sidebar-active-bg",
              )}
            >
              <Icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          );
        }
        const active = hasActiveChild(item, pathname);
        const Icon = item.icon ?? UserIcon;
        return (
          <details
            key={item.title}
            open={active}
            className="group [&>summary::-webkit-details-marker]:hidden"
          >
            <summary className="hover:bg-sidebar-accent flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors">
              <Icon className="size-4" />
              <span className="flex-1">{item.title}</span>
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="border-sidebar-border mt-1 ml-4 space-y-1 border-l pl-3">
              {item.children.map((child) => {
                const cActive = isActivePath(pathname, child.to);
                return (
                  <li key={child.to}>
                    <Link
                      href={child.to}
                      className={cn(
                        "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground block rounded-md px-3 py-1.5 text-sm transition-colors",
                        cActive &&
                          "text-sidebar-accent-foreground font-semibold",
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
      })}
    </>
  );
}

function MobileSidebar() {
  const filtered = usePermissionFilteredMenu(menuItems);
  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <Image
          src="/images/logo/logo_jmc.png"
          alt="Logo JMC"
          width={45}
          height={15}
          className="h-4 w-auto"
        />
        <span className="text-sm font-bold">Admin JMC</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-3">
          <NavItems items={filtered} />
        </nav>
      </div>
    </div>
  );
}

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post(ENDPOINTS.auth.logout);
    } catch {
      // ignore
    } finally {
      clear();
      toast.success("Berhasil logout");
      setLoggingOut(false);
      setLogoutOpen(false);
      window.location.replace("/login");
    }
  };

  const initials = user?.nama ? getInitials(user.nama) : "?";
  const displayName = user?.nama ?? "User";
  const displayRole = user?.role?.namaRole ?? "-";

  return (
    <header className="bg-card sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileSidebar />
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />}>
            <Bell className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="text-muted-foreground p-3 text-sm">
                Belum ada notifikasi.
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" className="hover:bg-muted flex items-center gap-2 rounded-md p-1.5 transition-colors" />}>
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left text-sm leading-tight md:block">
              <div className="font-semibold">{displayName.toUpperCase()}</div>
              <div className="text-muted-foreground text-xs">{displayRole.toUpperCase()}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href="/profile" className="flex items-center gap-2" />}>
              <UserIcon className="size-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="size-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Keluar dari aplikasi?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan keluar dari sesi saat ini. Lanjutkan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loggingOut}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? "Memproses..." : "Keluar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
