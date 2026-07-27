import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getEffectivePrice, getDiscountPercent, formatBDT, primaryImage } from "@/lib/pricing";

export default function ProductCard({ product }: { product: Product }) {
  const image = primaryImage(product);
  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const outOfStock = product.current_stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white border border-ink/10 transition-shadow hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="relative aspect-square bg-cream">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/20 text-sm">No image</div>
        )}

        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-ink">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="spec-readout text-xs text-cream">Out of stock</span>
          </span>
        )}
      </div>

      <div className="p-3.5">
        <p className="line-clamp-2 text-sm font-medium text-ink leading-snug min-h-[2.5rem]">{product.name}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="spec-readout text-[10px] text-ink/40">Price</span>
          <span className="font-display font-bold text-lg text-ink">{formatBDT(price)}</span>
          {discount > 0 && (
            <span className="text-xs text-ink/40 line-through">{formatBDT(product.regular_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
