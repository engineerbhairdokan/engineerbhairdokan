"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, PlusCircle, Boxes,
  Truck, Receipt, PiggyBank, Image as ImageIcon, Settings, BarChart3, Bell, X, Tag, Award, Users, MapPin, Landmark,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/couriers", label: "Couriers", icon: Truck },
  { href: "/admin/pickup-locations", label: "Pickup Locations", icon: MapPin },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/investments", label: "Investments", icon: PiggyBank },
  { href: "/admin/investors", label: "Investors", icon: Landmark },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/memberships", label: "Memberships", icon: Award },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink/10 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
            <PlusCircle className="h-5 w-5 text-gold-600" />
            <span className="font-display text-lg font-semibold text-ink">
              Engineer Bhai&apos;r Dokan
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-ink/60 hover:text-ink lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold-100 text-ink"
                    : "text-ink/60 hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
