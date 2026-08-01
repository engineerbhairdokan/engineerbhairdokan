import Link from "next/link";
import Image from "next/image";
import { getActiveCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="spec-readout text-xs text-gold-600">Browse</p>
      <h1 className="font-display font-bold text-2xl text-ink">All Categories</h1>
      <p className="text-sm text-ink/50 mt-1 mb-6">
        {categories.length} categor{categories.length === 1 ? "y" : "ies"}
      </p>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 py-20 text-center">
          <p className="font-display font-semibold text-lg text-ink">No categories yet</p>
          <p className="text-sm text-ink/50 mt-1">Add some from Admin → Categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition-colors hover:border-gold"
            >
              <div className="relative aspect-square bg-cream">
                {c.image_url ? (
                  <Image
                    src={c.image_url}
                    alt={c.name}
                    fill
                    className="object-contain p-4 transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink/30">
                    No image
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5">
                <p className="font-display font-semibold text-sm text-ink">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
