import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/queries";
import Link from "next/link";

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: "newest" | "price_asc" | "price_desc" }>;
}) {
  const { q, page: pageParam, sort } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;

  const { products, total } = await getProducts({ search: q, page, pageSize: PAGE_SIZE, sort });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sortLink = (value: string, label: string) => (
    <Link
      href={`/products?${new URLSearchParams({ ...(q ? { q } : {}), sort: value }).toString()}`}
      className={`rounded-full px-3 py-1.5 text-sm ${sort === value ? "bg-ink text-cream" : "bg-white border border-ink/15 text-ink"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="spec-readout text-xs text-gold-600">Catalog</p>
          <h1 className="font-display font-bold text-2xl text-ink">
            {q ? `Results for "${q}"` : "All Products"}
          </h1>
          <p className="text-sm text-ink/50 mt-1">{total} product{total === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-2">
          {sortLink("newest", "Newest")}
          {sortLink("price_asc", "Price: Low to High")}
          {sortLink("price_desc", "Price: High to Low")}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 py-20 text-center">
          <p className="font-display font-semibold text-lg text-ink">No products found</p>
          <p className="text-sm text-ink/50 mt-1">Try a different search term or browse all categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(sort ? { sort } : {}), page: String(p) }).toString()}`}
              className={`h-9 w-9 flex items-center justify-center rounded-full text-sm ${
                p === page ? "bg-ink text-cream" : "bg-white border border-ink/15 text-ink"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
