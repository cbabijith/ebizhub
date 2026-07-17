import { Users, Building2, Hammer, Layers, LayoutGrid, Megaphone, Settings, UserCheck } from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

export const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Members", href: "/members", icon: Users },
  { name: "Businesses", href: "/businesses", icon: Building2 },
  { name: "Service Providers", href: "/providers", icon: Hammer },
  { name: "Categories", href: "/categories", icon: Layers },
  { name: "Community Content", href: "/community", icon: Megaphone },
  { name: "Banners", href: "/banners", icon: UserCheck },
  { name: "Admin Profile", href: "/profile", icon: Settings },
];
