"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BANGLADESH_DISTRICTS } from "@/lib/districts";
import { formatBDT } from "@/lib/pricing";
import { CheckCircle2, Loader2, MapPin, Truck } from "lucide-react";

type Investment = { id: string; product_id: string; status: string; products: { name: string; current_stock: number } | null };
type PickupLocation = { id: string; name: string; address: string };

export default function SampleOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("investment");

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [investmentId, setInvestmentId] = useState(preselectedId ?? "");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [pickupLocationId, setPickupLocationId] = useState("");
  const [insideDhaka, setInsideDhaka] = useState(70);
  const [outsideDhaka, setOutsideDhaka] = useState(130);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: investor } = await supabase.from("investors").select("id").eq("auth_user_id", user.id).single();
      if (!investor) return;

      const { data: inv } = await supabase
        .from("product_investments")
        .select("id, product_id, status, products(name, current_stock)")
        .eq("investor_id", (investor as any).id)
        .eq("status", "active");
      setInvestments((inv as unknown as Investment[]) ?? []);

      const { data: locs } = await supabase.from("pickup_locations").select("id, name, address").eq("is_active", true).order("name");
      setPickupLocations((locs as unknown as PickupLocation[]) ?? []);

      const { data: settings } = await supabase.from("delivery_settings").select("*").eq("id", 1).single();
      if (settings) {
        setInsideDhaka((settings as any).inside_dhaka_charge);
        setOutsideDhaka((settings as any).outside_dhaka_charge);
      }
    })();
  }, []);

  const deliveryCharge = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (!district) return null;
    return district === "Dhaka" ? insideDhaka : outsideDhaka;
  }, [deliveryMethod, district, insideDhaka, outsideDhaka]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!investmentId) {
      setError("Select which investment/product this sample is for.");
      return;
    }
    if (deliveryMethod === "delivery" && (!district || address.length < 5)) {
      setError("Select a district and enter your full address.");
      return;
    }
    if (deliveryMethod === "pickup" && !pickupLocationId) {
      setError("Select a pickup location.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("claim_investor_sample", {
      p_product_investment_id: investmentId,
      p_delivery_method: deliveryMethod,
      p_district: deliveryMethod === "delivery" ? district : null,
      p_full_address: deliveryMethod === "delivery" ? address : null,
      p_pickup_location_id: deliveryMethod === "pickup" ? pickupLocationId : null,
    });

    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    fetch("/api/investor-samples/notify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId: data }),
    }).catch(() => {});

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-gold bg-gold-100 p-6 text-center max-w-lg">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold-600" />
        <p className="font-display font-bold text-lg text-ink mt-3">Sample Requested</p>
        <p className="text-sm text-ink/70 mt-1">
          The product itself is free. {deliveryMethod === "delivery" ? "The delivery charge was deducted from your balance." : "No charge for pickup."}
        </p>
        <button onClick={() => router.push("/invest")} className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selected = investments.find((i) => i.id === investmentId);

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="spec-readout text-xs text-gold-600">Investor Perk</p>
        <h2 className="font-display font-bold text-xl text-ink">Order a Free Sample</h2>
        <p className="text-sm text-ink/50 mt-1">
          The product is free — you already invested in it. Home delivery charge (if any) comes out of your own balance and never affects the shop&apos;s revenue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Which product?</span>
          <select value={investmentId} onChange={(e) => setInvestmentId(e.target.value)} className="input">
            <option value="">Select an investment</option>
            {investments.map((inv) => (
              <option key={inv.id} value={inv.id} disabled={(inv.products?.current_stock ?? 0) < 1}>
                {inv.products?.name} {inv.products && inv.products.current_stock < 1 ? "(out of stock)" : ""}
              </option>
            ))}
          </select>
          {investments.length === 0 && <p className="mt-1 text-xs text-ink/40">You don&apos;t have any active investments yet.</p>}
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDeliveryMethod("delivery")}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
              deliveryMethod === "delivery" ? "border-gold bg-gold-100 text-ink" : "border-ink/15 text-ink/50 hover:bg-cream"
            }`}
          >
            <Truck className="h-4 w-4" /> Home Delivery
          </button>
          <button
            type="button"
            onClick={() => setDeliveryMethod("pickup")}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
              deliveryMethod === "pickup" ? "border-gold bg-gold-100 text-ink" : "border-ink/15 text-ink/50 hover:bg-cream"
            }`}
          >
            <MapPin className="h-4 w-4" /> Pickup (Free)
          </button>
        </div>

        {deliveryMethod === "delivery" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">District</span>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input">
                <option value="">Select district</option>
                {BANGLADESH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">Full Address</span>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="input" />
            </label>
          </>
        ) : (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">Pickup Location</span>
            <select value={pickupLocationId} onChange={(e) => setPickupLocationId(e.target.value)} className="input">
              <option value="">Select a location</option>
              {pickupLocations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </label>
        )}

        <div className="rounded-xl bg-cream p-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-ink/60">Product</span><span className="font-medium text-emerald-600">Free</span></div>
          <div className="flex justify-between">
            <span className="text-ink/60">Delivery Charge</span>
            <span className="font-medium text-ink">
              {deliveryMethod === "pickup" ? formatBDT(0) : deliveryCharge === null ? "Select district" : formatBDT(deliveryCharge)}
            </span>
          </div>
          <p className="text-[11px] text-ink/40 pt-1">Deducted from your investor balance, not the shop&apos;s revenue.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !selected}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Claim Free Sample
        </button>
      </form>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
