import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, total } = await getProducts({ categorySlug: slug, pageSize: 24 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="spec-readout text-xs text-gold-600">Category</p>
      <h1 className="font-display font-bold text-2xl text-ink">{category.name}</h1>
      <p className="text-sm text-ink/50 mt-1 mb-6">{total} product{total === 1 ? "" : "s"}</p>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 py-20 text-center">
          <p className="font-display font-semibold text-lg text-ink">No products in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
