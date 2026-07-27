import HeroSlider from "@/components/HeroSlider";
import CategoryPills from "@/components/CategoryPills";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import {
  getActiveBanners,
  getActiveCategories,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
} from "@/lib/queries";

export default async function HomePage() {
  const [banners, categories, featured, newArrivals, bestSellers] = await Promise.all([
    getActiveBanners(),
    getActiveCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
    getBestSellers(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-14">
      <HeroSlider banners={banners} />

      <section>
        <p className="spec-readout text-xs text-gold-600 mb-3">Browse</p>
        <CategoryPills categories={categories} />
      </section>

      {featured.length > 0 && (
        <section>
          <SectionHeading eyebrow="Handpicked" title="Featured Products" action={{ label: "See all", href: "/products?featured=1" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section>
          <SectionHeading eyebrow="Just In" title="New Arrivals" action={{ label: "See all", href: "/products?sort=newest" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section>
          <SectionHeading eyebrow="Customer Favourites" title="Best Selling" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
