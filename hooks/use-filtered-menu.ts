import { useAuthStore } from "@/lib/auth/store";
import { canAccess } from "@/lib/rbac/permissions";
import { menuItems, type MenuItem } from "@/lib/types/menu";

export function usePermissionFilteredMenu(items: MenuItem[] = menuItems): MenuItem[] {
  const perms = useAuthStore((s) => s.permissions);

  return items
    .map((item) => {
      if (!item.requiredPermission) return item;
      const { modul, action } = item.requiredPermission;
      if (!canAccess(perms, modul, action)) return null;
      if (item.children) {
        const children = item.children.filter((child) => {
          if (!child.requiredPermission) return true;
          const { modul: cm, action: ca } = child.requiredPermission;
          return canAccess(perms, cm, ca);
        });
        if (children.length === 0) return null;
        return { ...item, children };
      }
      return item;
    })
    .filter((x): x is MenuItem => x !== null);
}
