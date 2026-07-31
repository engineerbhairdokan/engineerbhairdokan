import type { Product } from "@/lib/types";

export function getEffectivePrice(p: Product): number {
  const now = new Date();
  const inWindow =
    (!p.discount_start_date || now >= new Date(p.discount_start_date)) &&
    (!p.discount_end_date || now <= new Date(p.discount_end_date));

  if (p.discount_type === "none" || !inWindow) return p.regular_price;
  if (p.discount_type === "percentage") {
    return Math.round(p.regular_price * (1 - p.discount_value / 100) * 100) / 100;
  }
  return Math.max(p.regular_price - p.discount_value, 0);
}

export function getDiscountPercent(p: Product): number {
  const effective = getEffectivePrice(p);
  if (effective >= p.regular_price) return 0;
  return Math.round(((p.regular_price - effective) / p.regular_price) * 100);
}

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function primaryImage(p: Product): string | null {
  if (!p.product_images || p.product_images.length === 0) return null;
  const primary = p.product_images.find((i) => i.is_primary);
  return (primary ?? p.product_images[0]).image_url;
}
