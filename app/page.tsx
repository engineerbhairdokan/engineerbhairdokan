import HeroSlider from "@/components/HeroSlider";
import HeroCTAButtons from "@/components/HeroCTAButtons";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import {
  getActiveBanners,
  getActiveCategories,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getContactInfo,
} from "@/lib/queries";

export default async function HomePage() {
  const [banners, categories, featured, newArrivals, bestSellers, contact] = await Promise.all([
    getActiveBanners(),
    getActiveCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
    getBestSellers(),
    getContactInfo(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-14">
      <div className="space-y-5">
        <HeroSlider banners={banners} />
        <HeroCTAButtons whatsapp={contact?.whatsapp ?? null} />
      </div>

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
