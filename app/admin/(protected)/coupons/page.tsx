"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createCoupon, toggleCouponActive, deleteCoupon } from "./actions";
import { formatBDT } from "@/lib/pricing";
import { Plus, Printer } from "lucide-react";

type Coupon = {
  id: string; code: string; discount_type: string; discount_value: number;
  max_uses: number | null; times_used: number; min_order_amount: number;
  valid_from: string; valid_until: string | null; is_active: boolean; note: string | null;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: "", discountType: "percentage" as "percentage" | "fixed", discountValue: 10,
    maxUses: "" as string | number, minOrderAmount: 0,
    validFrom: new Date().toISOString().slice(0, 10), validUntil: "", note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as unknown as Coupon[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.code.trim()) { setError("Coupon code is required"); return; }
    startTransition(async () => {
      const result = await createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
        minOrderAmount: form.minOrderAmount,
        validFrom: form.validFrom,
        validUntil: form.validUntil || null,
        note: form.note,
      });
      if (result?.error) setError(result.error);
      else {
        setForm({ code: "", discountType: "percentage", discountValue: 10, maxUses: "", minOrderAmount: 0, validFrom: new Date().toISOString().slice(0, 10), validUntil: "", note: "" });
        load();
      }
    });
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Marketing</p>
        <h1 className="font-display font-bold text-2xl text-ink">Discount Coupons</h1>
        <p className="text-sm text-ink/50 mt-1">Create codes for gifts, promotions, or friends & family — usable by anyone at checkout.</p>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-3">
        <Field label="Coupon Code"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input font-mono" placeholder="EID2026" /></Field>
        <Field label="Discount Type">
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="input">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </Field>
        <Field label="Discount Value"><input type="number" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="input" /></Field>
        <Field label="Max Uses (blank = unlimited)"><input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="input" placeholder="e.g. 1 for a single gift code" /></Field>
        <Field label="Min Order Amount"><input type="number" step="0.01" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="input" /></Field>
        <Field label="Valid From"><input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="input" /></Field>
        <Field label="Valid Until (blank = no expiry)"><input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="input" /></Field>
        <div className="sm:col-span-2">
          <Field label="Note (e.g. who this is for)"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input" /></Field>
        </div>
        <button disabled={isPending} className="sm:col-span-3 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Uses</th><th className="px-4 py-3">Valid</th><th className="px-4 py-3">Active</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-mono font-medium text-ink">{c.code}</td>
                <td className="px-4 py-3">{c.discount_type === "percentage" ? `${c.discount_value}%` : formatBDT(c.discount_value)}</td>
                <td className="px-4 py-3 text-ink/60">{c.times_used}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                <td className="px-4 py-3 text-ink/40 text-xs">
                  {new Date(c.valid_from).toLocaleDateString("en-GB")}
                  {c.valid_until ? ` – ${new Date(c.valid_until).toLocaleDateString("en-GB")}` : " – no expiry"}
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" defaultChecked={c.is_active} onChange={(e) => startTransition(() => { toggleCouponActive(c.id, e.target.checked); })} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/coupons/${c.id}/print`} target="_blank" className="text-gold-600 hover:underline mr-3 inline-flex items-center gap-1">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Link>
                  <button className="text-red-600 hover:underline" onClick={() => { if (confirm(`Delete coupon ${c.code}?`)) startTransition(async () => { await deleteCoupon(c.id); load(); }); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/40">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.5rem 0.8rem; font-size: 0.85rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>{children}</label>;
}
