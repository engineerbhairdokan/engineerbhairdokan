"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createInvestment, deleteInvestment } from "./actions";
import { formatBDT } from "@/lib/pricing";
import { Plus } from "lucide-react";

const TYPES = ["initial", "additional", "cash", "bank", "equipment"];

type Investment = { id: string; investment_type: string; amount: number; description: string | null; invested_at: string };

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [form, setForm] = useState({ investmentType: "additional", amount: 0, description: "", investedAt: new Date().toISOString().slice(0, 10) });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("investments").select("*").order("invested_at", { ascending: false });
    setInvestments((data as unknown as Investment[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createInvestment(form);
      if (result?.error) setError(result.error);
      else { setForm({ ...form, amount: 0, description: "" }); load(); }
    });
  }

  const total = investments.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="spec-readout text-xs text-gold-600">Capital</p>
          <h1 className="font-display font-bold text-2xl text-ink">Investments</h1>
        </div>
        <div className="text-right">
          <p className="spec-readout text-[10px] text-ink/40">Total Invested</p>
          <p className="font-display font-bold text-ink">{formatBDT(total)}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Type</span>
          <select value={form.investmentType} onChange={(e) => setForm({ ...form, investmentType: e.target.value })} className="input">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Amount</span>
          <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Date</span>
          <input type="date" value={form.investedAt} onChange={(e) => setForm({ ...form, investedAt: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Description</span>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
        </label>
        <button disabled={isPending} className="sm:col-span-4 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add Investment
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {investments.map((i) => (
              <tr key={i.id} className="border-t border-ink/5">
                <td className="px-4 py-3 capitalize text-ink">{i.investment_type}</td>
                <td className="px-4 py-3 text-ink/60">{i.description ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatBDT(i.amount)}</td>
                <td className="px-4 py-3 text-ink/40">{new Date(i.invested_at).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-red-600 hover:underline" onClick={() => startTransition(async () => { await deleteInvestment(i.id); load(); })}>Delete</button>
                </td>
              </tr>
            ))}
            {investments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/40">No investments recorded yet.</td></tr>}
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
