"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createExpense, deleteExpense } from "./actions";
import { formatBDT } from "@/lib/pricing";
import { Plus } from "lucide-react";

const CATEGORIES = ["facebook_ads","google_ads","packaging","courier_charges","office_rent","salary","internet","electricity","transport","domain","hosting","software_subscription","miscellaneous"];
const AD_CATEGORIES = ["facebook_ads", "google_ads"];

type Expense = { id: string; category: string; amount: number; description: string | null; expense_date: string; product_id: string | null; products?: { name: string } | null };
type Product = { id: string; name: string };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ category: "miscellaneous", amount: 0, description: "", expenseDate: new Date().toISOString().slice(0, 10), productId: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const [{ data: exp }, { data: prod }] = await Promise.all([
      supabase.from("expenses").select("*, products(name)").order("expense_date", { ascending: false }).limit(100),
      supabase.from("products").select("id, name").order("name"),
    ]);
    setExpenses((exp as unknown as Expense[]) ?? []);
    setProducts((prod as unknown as Product[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  const isAdCategory = AD_CATEGORIES.includes(form.category);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createExpense({ ...form, productId: form.productId || null });
      if (result?.error) setError(result.error);
      else { setForm({ ...form, amount: 0, description: "" }); load(); }
    });
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="spec-readout text-xs text-gold-600">Accounting</p>
          <h1 className="font-display font-bold text-2xl text-ink">Expenses</h1>
        </div>
        <div className="text-right">
          <p className="spec-readout text-[10px] text-ink/40">Total</p>
          <p className="font-display font-bold text-ink">{formatBDT(total)}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Category</span>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, productId: AD_CATEGORIES.includes(e.target.value) ? form.productId : "" })} className="input">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Amount</span>
          <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Date</span>
          <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Description</span>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
        </label>

        {isAdCategory && (
          <label className="block sm:col-span-4">
            <span className="mb-1 block text-xs font-medium text-ink/60">Which product is this ad spend for?</span>
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required className="input">
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        )}

        <button disabled={isPending} className="sm:col-span-4 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-ink/5">
                <td className="px-4 py-3 capitalize text-ink">{e.category.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-ink/60">{e.products?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/60">{e.description ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-ink">{formatBDT(e.amount)}</td>
                <td className="px-4 py-3 text-ink/40">{new Date(e.expense_date).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-red-600 hover:underline" onClick={() => startTransition(async () => { await deleteExpense(e.id); load(); })}>Delete</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/40">No expenses recorded yet.</td></tr>}
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
