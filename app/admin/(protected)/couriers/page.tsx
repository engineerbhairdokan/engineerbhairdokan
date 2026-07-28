"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCourier, toggleCourierActive, deleteCourier } from "./actions";
import { formatBDT } from "@/lib/pricing";
import { Plus } from "lucide-react";

type Courier = {
  id: string; name: string; merchant_code: string | null; charge_inside_dhaka: number;
  charge_outside_dhaka: number; return_charge: number; phone: string | null; is_active: boolean;
};

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [form, setForm] = useState({ name: "", merchantCode: "", insideDhaka: 70, outsideDhaka: 130, returnCharge: 60, phone: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("couriers").select("*").order("name");
    setCouriers((data as unknown as Courier[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCourier(form);
      if (result?.error) setError(result.error);
      else { setForm({ name: "", merchantCode: "", insideDhaka: 70, outsideDhaka: 130, returnCharge: 60, phone: "", website: "" }); load(); }
    });
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Delivery</p>
        <h1 className="font-display font-bold text-2xl text-ink">Couriers</h1>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-3">
        <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
        <Field label="Merchant Code"><input value={form.merchantCode} onChange={(e) => setForm({ ...form, merchantCode: e.target.value })} className="input" /></Field>
        <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></Field>
        <Field label="Inside Dhaka Charge"><input type="number" value={form.insideDhaka} onChange={(e) => setForm({ ...form, insideDhaka: Number(e.target.value) })} className="input" /></Field>
        <Field label="Outside Dhaka Charge"><input type="number" value={form.outsideDhaka} onChange={(e) => setForm({ ...form, outsideDhaka: Number(e.target.value) })} className="input" /></Field>
        <Field label="Return Charge (loss on failed/returned parcel)"><input type="number" value={form.returnCharge} onChange={(e) => setForm({ ...form, returnCharge: Number(e.target.value) })} className="input" /></Field>
        <Field label="Website"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input" /></Field>
        <button disabled={isPending} className="sm:col-span-3 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add Courier
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Inside Dhaka</th><th className="px-4 py-3">Outside Dhaka</th><th className="px-4 py-3">Return Charge</th><th className="px-4 py-3">Active</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {couriers.map((c) => (
              <tr key={c.id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-3">{formatBDT(c.charge_inside_dhaka)}</td>
                <td className="px-4 py-3">{formatBDT(c.charge_outside_dhaka)}</td>
                <td className="px-4 py-3 text-red-600">{formatBDT(c.return_charge)}</td>
                <td className="px-4 py-3">
                  <input type="checkbox" defaultChecked={c.is_active} onChange={(e) => startTransition(() => { toggleCourierActive(c.id, e.target.checked); })} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-red-600 hover:underline" onClick={() => { if (confirm(`Delete ${c.name}?`)) startTransition(async () => { await deleteCourier(c.id); load(); }); }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {couriers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/40">No couriers yet.</td></tr>}
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
