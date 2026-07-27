"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, PlusCircle, Boxes,
  Truck, Receipt, PiggyBank, Image as ImageIcon, Settings, BarChart3, Bell,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/orders/new", label: "New Manual Order", icon: PlusCircle },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/couriers", label: "Couriers", icon: Truck },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/investments", label: "Investments", icon: PiggyBank },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 shrink-0 bg-ink text-cream min-h-screen p-4 hidden lg:block">
      <div className="mb-6 px-2">
        <p className="font-display font-bold text-lg">
          Engineer <span className="text-gold">Bhai&apos;r</span> Dokan
        </p>
        <p className="spec-readout text-[10px] text-cream/40">Admin Panel</p>
      </div>

      <ul className="space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-gold text-ink font-medium" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
