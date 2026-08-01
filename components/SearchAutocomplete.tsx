"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/pricing";

type Suggestion = { id: string; name: string; slug: string; regular_price: number; image_url: string | null };

export default function SearchAutocomplete({ placeholder = "Search products..." }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, regular_price, product_images(image_url, is_primary)")
        .eq("status", "active")
        .ilike("name", `%${query.trim()}%`)
        .limit(6);

      const rows = (data ?? []) as any[];
      setSuggestions(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          regular_price: r.regular_price,
          image_url: r.product_images?.find((i: any) => i.is_primary)?.image_url ?? r.product_images?.[0]?.image_url ?? null,
        }))
      );
      setOpen(true);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <form action="/products" className="flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full rounded-full border border-ink/15 bg-white py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-gold outline-none"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-ink/30" />}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-ink/10 bg-white shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/products/${s.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-cream transition-colors"
            >
              <div className="relative h-10 w-10 shrink-0 rounded-lg bg-cream overflow-hidden">
                {s.image_url ? (
                  <Image src={s.image_url} alt={s.name} fill className="object-contain p-1" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-ink/30">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink line-clamp-1">{s.name}</p>
                <p className="text-xs font-medium text-gold-600">{formatBDT(s.regular_price)}</p>
              </div>
            </Link>
          ))}
          <Link
            href={`/products?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-center text-xs font-medium text-ink/50 hover:bg-cream border-t border-ink/5"
          >
            See all results for &quot;{query}&quot;
          </Link>
        </div>
      )}
    </div>
  );
}
