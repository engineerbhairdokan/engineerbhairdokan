"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Ticket, Copy, Check } from "lucide-react";

export default function CreateCouponForm({ availablePoints }: { availablePoints: number }) {
  const router = useRouter();
  const maxPoints = Math.min(5, availablePoints);
  const [points, setPoints] = useState(Math.min(5, Math.max(1, availablePoints)));
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("create_customer_coupon", {
      p_points: points,
      p_valid_until: validUntil,
    });

    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setCreatedCode(data as string);
    router.refresh();
  }

  function copyCode() {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (createdCode) {
    return (
      <div className="rounded-2xl border border-gold bg-gold-100 p-4 text-center">
        <p className="text-sm text-ink/60 mb-1">Your coupon is ready — use it yourself or share it with someone</p>
        <div className="flex items-center justify-center gap-2">
          <p className="font-mono font-bold text-lg text-ink tracking-wider">{createdCode}</p>
          <button onClick={copyCode} className="text-ink/40 hover:text-ink">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-ink/40 mt-1">One-time use only, valid until {new Date(validUntil).toLocaleDateString("en-GB")}</p>
        <button onClick={() => setCreatedCode(null)} className="mt-3 text-xs text-gold-600 hover:underline">
          Create another
        </button>
      </div>
    );
  }

  if (availablePoints < 1) {
    return (
      <p className="text-sm text-ink/40 rounded-2xl border border-dashed border-ink/20 p-4 text-center">
        Earn points from delivered orders to create your own discount coupon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-gold-600" />
        <p className="font-display font-bold text-sm text-ink">Create Your Own Coupon</p>
      </div>
      <p className="text-xs text-ink/50">1 point = 1% discount, up to 5%. Use it yourself or gift the code to someone — one-time use only.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Discount % (points to use)</span>
          <select value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm">
            {Array.from({ length: maxPoints }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>{p}% ({p} point{p > 1 ? "s" : ""})</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Valid Until</span>
          <input
            type="date"
            min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-sm font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Create Coupon ({points} point{points > 1 ? "s" : ""})
      </button>
    </form>
  );
}
