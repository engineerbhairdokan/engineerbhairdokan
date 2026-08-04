"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/invest", label: "Dashboard" },
  { href: "/invest/deposit", label: "Deposit" },
  { href: "/invest/sample-order", label: "Order Sample" },
  { href: "/invest/notifications", label: "Notifications" },
  { href: "/invest/transactions", label: "Transaction History" },
];

export default function InvestorNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/invest" ? pathname === href : pathname?.startsWith(href));

  return (
    <div className="mb-6 border-b border-ink/10">
      {/* Desktop / tablet: horizontal tabs */}
      <div className="hidden sm:flex gap-2 overflow-x-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
              isActive(link.href) ? "text-gold-600 border-gold" : "text-ink border-transparent hover:text-gold-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile: hamburger dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-1 py-2.5 text-sm font-medium text-ink"
        >
          <span className="text-gold-600">
            {NAV_LINKS.find((l) => isActive(l.href))?.label ?? "Menu"}
          </span>
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        {open && (
          <div className="flex flex-col pb-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-2 py-2 text-sm font-medium ${
                  isActive(link.href) ? "bg-gold-100 text-gold-600" : "text-ink hover:bg-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
