"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BANGLADESH_DISTRICTS } from "@/lib/districts";
import { formatBDT } from "@/lib/pricing";
import { Loader2, Plus, Trash2 } from "lucide-react";

type ProductOption = { id: string; name: string; sku: string; regular_price: number; current_stock: number };
type CourierOption = { id: string; name: string };

type LineItem = { productId: string; quantity: number; unitPrice: number; lineDiscount: number };

const SOURCES = [
  { value: "facebook", label: "Facebook" },
  { value: "messenger", label: "Messenger" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone_call", label: "Phone Call" },
  { value: "walk_in", label: "Walk-in" },
];

export default function ManualOrderForm({ products, couriers }: { products: ProductOption[]; couriers: CourierOption[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [source, setSource] = useState("facebook");
  const [courierId, setCourierId] = useState("");
  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: 1, unitPrice: 0, lineDiscount: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderNumber: string; grandTotal: number } | null>(null);

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function onProductChange(i: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateItem(i, { productId, unitPrice: product?.regular_price ?? 0 });
  }

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.unitPrice * it.quantity - it.lineDiscount, 0),
    [items]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !district || !address || items.some((i) => !i.productId)) {
      setError("Please fill in all required fields and select a product for each line.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase.rpc("place_manual_order", {
      p_customer_name: name,
      p_phone: phone,
      p_alt_phone: altPhone || null,
      p_district: district,
      p_full_address: address,
      p_order_source: source as any,
      p_items: items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        line_discount: i.lineDiscount,
      })),
      p_courier_id: courierId || null,
      p_tracking_number: tracking || null,
      p_notes: notes || null,
    });

    if (error || !data || data.length === 0) {
      setError(error?.message ?? "Failed to create order.");
      setSubmitting(false);
      return;
    }

    setSuccess({ orderNumber: data[0].order_number, grandTotal: data[0].grand_total });
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-gold bg-gold-100 p-6 text-center">
        <p className="font-display font-bold text-xl text-ink">Order Created!</p>
        <p className="text-sm text-ink/70 mt-1">
          {success.orderNumber} — {formatBDT(success.grandTotal)}
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => router.push("/admin/orders")} className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream">
            View Orders
          </button>
          <button onClick={() => window.location.reload()} className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-ink/10 bg-white p-5 space-y-3">
        <h2 className="font-display font-bold text-ink">Customer & Delivery</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Customer Name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></Field>
          <Field label="Alt Phone"><input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} className="input" /></Field>
          <Field label="District">
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input">
              <option value="">Select district</option>
              {BANGLADESH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Full Address"><textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="input" /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Order Source">
            <select value={source} onChange={(e) => setSource(e.target.value)} className="input">
              {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Courier (optional)">
            <select value={courierId} onChange={(e) => setCourierId(e.target.value)} className="input">
              <option value="">Not assigned yet</option>
              {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        {courierId && (
          <Field label="Tracking Number"><input value={tracking} onChange={(e) => setTracking(e.target.value)} className="input" /></Field>
        )}
        <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input" /></Field>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-ink">Items</h2>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0, lineDiscount: 0 }])}
            className="flex items-center gap-1 text-sm text-gold-600 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>

        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <span className="mb-1 block text-xs font-medium text-ink/60">Product</span>
              <select value={item.productId} onChange={(e) => onProductChange(i, e.target.value)} className="input">
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.current_stock} in stock)</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <span className="mb-1 block text-xs font-medium text-ink/60">Qty</span>
              <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} className="input" />
            </div>
            <div className="col-span-2">
              <span className="mb-1 block text-xs font-medium text-ink/60">Unit Price</span>
              <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })} className="input" />
            </div>
            <div className="col-span-2">
              <span className="mb-1 block text-xs font-medium text-ink/60">Discount</span>
              <input type="number" step="0.01" value={item.lineDiscount} onChange={(e) => updateItem(i, { lineDiscount: Number(e.target.value) })} className="input" />
            </div>
            <div className="col-span-1">
              <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-600 p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <div className="border-t border-ink/10 pt-3 flex justify-end">
          <div className="text-sm">
            <span className="text-ink/50 mr-2">Subtotal (before delivery)</span>
            <span className="font-display font-bold text-ink">{formatBDT(subtotal)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Create Order
      </button>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.55rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      {children}
    </label>
  );
}
