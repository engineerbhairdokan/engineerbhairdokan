"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordInvestment } from "../actions";
import { Loader2, PiggyBank } from "lucide-react";

type Product = { id: string; name: string; current_stock: number };

export default function RecordInvestmentForm({ investorId }: { investorId: string }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, current_stock")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setProducts((data as unknown as Product[]) ?? []));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await recordInvestment({ investorId, productId, amount: Number(amount), note });
      if (result?.error) setError(result.error);
      else {
        setProductId("");
        setAmount("");
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="spec-readout text-xs text-gold-600 mb-2 flex items-center gap-1.5">
        <PiggyBank className="h-3.5 w-3.5" /> Record Investment
      </p>
      <p className="text-xs text-ink/40 mb-3">
        Use this when the investor hands you money directly — it credits their balance and allocates it to a product in one step.
      </p>
      <div className="grid gap-2 sm:grid-cols-[1fr_140px_1fr_auto]">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required className="rounded-xl border border-ink/15 px-3 py-2 text-sm">
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.current_stock} in stock</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
        />
        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
        />
        <button
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Record
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
