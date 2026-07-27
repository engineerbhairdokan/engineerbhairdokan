import Link from "next/link";
import Image from "next/image";
import { Search, Phone } from "lucide-react";
import type { ContactInformation } from "@/lib/types";

export default function Header({ contact }: { contact: ContactInformation | null }) {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src={contact?.logo_url || "/logo.png"} alt={contact?.business_name ?? "Engineer Bhai'r Dokan"} width={44} height={44} className="rounded-full" priority />
            <span className="font-display font-extrabold text-lg leading-tight text-ink hidden sm:block">
              Engineer <span className="text-gold-600">Bhai&apos;r</span> Dokan
            </span>
          </Link>

          <form action="/products" className="flex-1 max-w-md hidden md:flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
              <input
                name="q"
                placeholder="Search gadgets & accessories..."
                className="w-full rounded-full border border-ink/15 bg-white py-2 pl-9 pr-4 text-sm focus:border-gold outline-none"
              />
            </div>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            {contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="hidden sm:flex items-center gap-1.5 rounded-full bg-ink text-cream text-sm font-medium px-4 py-2 hover:bg-ink-700 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> {contact.phone}
              </a>
            )}
          </div>
        </div>

        <form action="/products" className="md:hidden pb-3 flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input
              name="q"
              placeholder="Search products..."
              className="w-full rounded-full border border-ink/15 bg-white py-2 pl-9 pr-4 text-sm outline-none"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
