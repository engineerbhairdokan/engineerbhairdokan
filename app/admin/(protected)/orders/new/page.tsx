import { createClient } from "@/lib/supabase/server";
import ManualOrderForm from "./ManualOrderForm";

export default async function NewManualOrderPage() {
  const supabase = await createClient();
  const results = await Promise.all([
    supabase.from("products").select("id, name, sku, regular_price, current_stock").eq("status", "active").order("name"),
    supabase.from("couriers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("pickup_locations").select("id, name, address, phone").eq("is_active", true).order("name"),
  ]);
  const products = (results[0].data ?? []) as any[];
  const couriers = (results[1].data ?? []) as any[];
  const pickupLocations = (results[2].data ?? []) as any[];

  return (
    <div className="max-w-3xl">
      <p className="spec-readout text-xs text-gold-600">Orders</p>
      <h1 className="font-display font-bold text-2xl text-ink mb-5">New Manual Order</h1>
      <p className="text-sm text-ink/50 -mt-3 mb-5">For orders from Facebook, Messenger, WhatsApp, phone calls, or walk-ins.</p>
      <ManualOrderForm products={products ?? []} couriers={couriers ?? []} pickupLocations={pickupLocations ?? []} />
    </div>
  );
}
