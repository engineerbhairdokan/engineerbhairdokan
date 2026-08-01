import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import PrintCouponButton from "./PrintCouponButton";

export default async function CouponPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("coupons").select("*").eq("id", id).single();
  const coupon: any = data;

  if (!coupon) notFound();

  return (
    <div className="mx-auto max-w-md p-10 print:p-0">
      <div className="mb-6 print:hidden flex justify-end">
        <PrintCouponButton />
      </div>

      <div className="rounded-3xl border-4 border-dashed border-ink bg-cream p-8 text-center">
        <p className="font-display font-bold text-lg text-ink">
          Engineer <span className="text-gold-600">Bhai&apos;r</span> Dokan
        </p>
        <p className="spec-readout text-[10px] text-ink/40 mt-1 mb-6">Gift Coupon</p>

        <p className="font-mono font-bold text-3xl tracking-widest text-ink border-2 border-ink rounded-xl py-4 mb-6">
          {coupon.code}
        </p>

        <p className="font-display font-bold text-2xl text-gold-600">
          {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `${formatBDT(coupon.discount_value)} OFF`}
        </p>
        {coupon.min_order_amount > 0 && (
          <p className="text-xs text-ink/50 mt-1">On orders above {formatBDT(coupon.min_order_amount)}</p>
        )}

        <p className="text-xs text-ink/50 mt-6">
          Valid {new Date(coupon.valid_from).toLocaleDateString("en-GB")}
          {coupon.valid_until ? ` – ${new Date(coupon.valid_until).toLocaleDateString("en-GB")}` : " onward"}
        </p>
        {coupon.note && <p className="text-sm text-ink/70 mt-3 italic">&quot;{coupon.note}&quot;</p>}

        <p className="spec-readout text-[9px] text-ink/30 mt-6">Enter this code at checkout</p>
      </div>
    </div>
  );
}
