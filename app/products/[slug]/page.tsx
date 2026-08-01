import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getDeliverySettings } from "@/lib/queries";
import { getEffectivePrice, getDiscountPercent, formatBDT } from "@/lib/pricing";
import OrderForm from "@/components/OrderForm";
import AddToCartButton from "@/components/AddToCartButton";
import { ShieldCheck, Truck, PackageCheck } from "lucide-react";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, delivery] = await Promise.all([getProductBySlug(slug), getDeliverySettings()]);
  if (!product) notFound();

  const images = (product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const outOfStock = product.current_stock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square rounded-2xl bg-white border border-ink/10 overflow-hidden">
            {images[0] ? (
              <Image src={images[0].image_url} alt={product.name} fill className="object-contain p-6" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-ink/20">No image</div>
            )}
            {discount > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
                -{discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(1, 6).map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg bg-white border border-ink/10 overflow-hidden">
                  <Image src={img.image_url} alt={product.name} fill className="object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categories && (
            <p className="spec-readout text-xs text-gold-600 mb-2">{product.categories.name}</p>
          )}
          <h1 className="font-display font-bold text-3xl text-ink leading-tight">{product.name}</h1>

          {product.short_description && (
            <p className="mt-3 text-ink/60 leading-relaxed">{product.short_description}</p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display font-extrabold text-3xl text-ink">{formatBDT(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatBDT(product.regular_price)}</span>
                <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-gold-600">
                  You save {formatBDT(product.regular_price - price)}
                </span>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-4 text-xs text-ink/50">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-gold-600" /> Engineer approved</span>
            <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-gold-600" /> Fast delivery</span>
            <span className="flex items-center gap-1"><PackageCheck className="h-4 w-4 text-gold-600" /> COD available</span>
          </div>

          <div className="mt-6 space-y-3">
            {outOfStock ? (
              <div className="rounded-2xl border border-ink/10 bg-cream p-5 text-center">
                <p className="font-display font-bold text-ink">Currently Out of Stock</p>
                <p className="text-sm text-ink/50 mt-1">Message us on WhatsApp to get notified when it&apos;s back.</p>
              </div>
            ) : (
              <>
                <div className="w-full [&>button]:w-full">
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    slug={product.slug}
                    image={images[0]?.image_url ?? null}
                    price={price}
                    maxStock={product.current_stock}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-ink/40">
                  <div className="h-px flex-1 bg-ink/10" />
                  <span>OR BUY THIS ITEM ALONE</span>
                  <div className="h-px flex-1 bg-ink/10" />
                </div>
                <OrderForm
                  productId={product.id}
                  unitPrice={price}
                  insideDhakaCharge={delivery?.inside_dhaka_charge ?? 70}
                  outsideDhakaCharge={delivery?.outside_dhaka_charge ?? 130}
                />
              </>
            )}
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-lg text-ink mb-2">Product Details</h2>
              <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
