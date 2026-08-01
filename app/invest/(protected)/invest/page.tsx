"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/pricing";
import { Loader2, CheckCircle2 } from "lucide-react";

type Product = { id: string; name: string; current_stock: number; regular_price: number };

export default function InvestInProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [minAmount, setMinAmount] = useState(0);
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, current_stock, regular_price")
      .eq("status", "active")
      .order("name")
      .then(({ data }) => setProducts((data as unknown as Product[]) ?? []));

    supabase.rpc("get_investment_signup_info").then(({ data }) => {
      setMinAmount((data as any[])?.[0]?.min_investment_amount ?? 0);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("create_product_investment", {
      p_product_id: productId,
      p_amount: Number(amount),
    });

    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    fetch("/api/investor-notifications/flush", { method: "POST" }).catch(() => {});
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-gold bg-gold-100 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold-600" />
        <p className="font-display font-bold text-lg text-ink mt-3">Investment Placed</p>
        <p className="text-sm text-ink/70 mt-1">Your investment is now active — track its progress on your dashboard.</p>
        <button onClick={() => router.push("/invest")} className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="spec-readout text-xs text-gold-600">Grow Your Balance</p>
        <h2 className="font-display font-bold text-xl text-ink">Invest in a Product</h2>
        <p className="text-sm text-ink/50 mt-1">Minimum investment: {formatBDT(minAmount)}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Product</span>
          <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="input">
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.current_stock} in stock</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Amount</span>
          <input required type="number" min={minAmount} value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Invest Now
        </button>
        <p className="text-xs text-ink/40">
          Your balance is checked automatically — deposit funds first if needed.
        </p>
      </form>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
