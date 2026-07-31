"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User } from "lucide-react";
import type { ContactInformation } from "@/lib/types";
import CartIcon from "@/components/CartIcon";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/#contact", label: "Contact" },
];

export default function Header({ contact }: { contact: ContactInformation | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {contact?.logo_url ? (
            <Image
              src={contact.logo_url}
              alt={contact.business_name}
              width={36}
              height={36}
              className="rounded-lg object-contain"
            />
          ) : null}
          <span className="font-display text-lg font-bold leading-tight sm:text-xl">
            <span className="text-cream">Engineer</span>{" "}
            <span className="text-gold">Bhai&apos;r</span>{" "}
            <span className="brand-dokan">Dokan</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cream/80 hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 md:block">
          <SearchAutocomplete />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/account"
            className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-cream/10 sm:flex"
            aria-label="Account"
          >
            <User className="h-5 w-5 text-cream" />
          </Link>
          <CartIcon />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream/10 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchAutocomplete />
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-cream/10 px-4 py-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-cream/80 hover:bg-cream/10 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-2 py-2 text-sm font-medium text-cream/80 hover:bg-cream/10 hover:text-gold"
          >
            Account
          </Link>
        </nav>
      )}
    </header>
  );
}
