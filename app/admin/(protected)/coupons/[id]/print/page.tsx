import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import PrintCouponButton from "./PrintCouponButton";
import { ShieldCheck, Truck, Package, Lightbulb } from "lucide-react";

export default async function CouponPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("coupons").select("*").eq("id", id).single();
  const coupon: any = data;

  if (!coupon) notFound();

  const discountLabel =
    coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : formatBDT(coupon.discount_value);

  return (
    <div className="mx-auto max-w-2xl p-6 print:p-0">
      <div className="mb-6 print:hidden flex justify-end">
        <PrintCouponButton />
      </div>

      <div className="relative flex rounded-2xl border-4 border-ink overflow-hidden bg-cream">
        {/* Left stub */}
        <div className="relative w-2/5 bg-ink px-5 py-8 text-center flex flex-col items-center justify-center">
          <span className="inline-block -rotate-1 rounded bg-gold px-3 py-1 text-[11px] font-extrabold tracking-wide text-ink">
            DISCOUNT COUPON
          </span>
          <p className="mt-4 text-sm font-bold text-cream/80">GET</p>
          <p className="font-display font-extrabold leading-none text-gold text-6xl">
            {discountLabel}
            {coupon.discount_type === "percentage" && <span className="text-3xl align-top"></span>}
          </p>
          <p className="text-xl font-extrabold text-cream -mt-1">
            {coupon.discount_type === "percentage" ? "OFF" : "OFF"}
          </p>
          <p className="text-xs font-semibold text-cream/70 mt-1">ON YOUR NEXT ORDER</p>

          <div className="mt-5 w-full">
            <p className="text-[10px] font-semibold text-cream/60">USE CODE:</p>
            <p className="mt-1 rounded-lg border-2 border-dashed border-gold bg-gold/90 py-2 font-mono font-extrabold text-lg tracking-widest text-ink">
              {coupon.code}
            </p>
          </div>

          <p className="mt-4 text-[11px] text-cream/70">
            VALID TILL:{" "}
            <span className="font-bold text-gold">
              {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "NO EXPIRY"}
            </span>
          </p>
          {coupon.min_order_amount > 0 && (
            <p className="text-[10px] text-cream/50 mt-1">On orders above {formatBDT(coupon.min_order_amount)}</p>
          )}

          <p className="mt-5 text-[11px] font-medium text-cream/70">
            SHOP SMART,<br />
            SHOP <span className="text-gold font-bold">ENGINEER APPROVED!</span> 😎
          </p>

          {/* perforation notches */}
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-white" />
          <span className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-white" />
        </div>

        {/* Divider */}
        <div className="w-0 border-l-2 border-dashed border-ink/30" />

        {/* Right brand panel */}
        <div className="relative w-3/5 px-6 py-8 flex flex-col justify-center">
          <p className="font-display font-extrabold text-3xl leading-none">
            <span className="text-ink">Engineer</span>
            <br />
            <span className="text-gold-600">Bhai&apos;r</span> <span className="brand-dokan">Dokan</span>
          </p>
          <p className="text-xs font-medium text-ink/50 mt-2">
            Engineer Approved, <span className="text-gold-600">Customer Loved!</span> 😊
          </p>
          {coupon.note && <p className="text-sm text-ink/70 mt-3 italic">&quot;{coupon.note}&quot;</p>}

          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-ink/10 pt-4 text-[11px] font-semibold text-ink/70">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold-600" /> QUALITY ASSURED</span>
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-gold-600" /> FAST DELIVERY</span>
            <span className="flex items-center gap-1.5"><Package className="h-4 w-4 text-gold-600" /> TRUSTED PRODUCTS</span>
            <span className="flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-gold-600" /> SMART SOLUTIONS</span>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-ink/30 mt-4 print:hidden">Enter this code at checkout</p>
    </div>
  );
}
