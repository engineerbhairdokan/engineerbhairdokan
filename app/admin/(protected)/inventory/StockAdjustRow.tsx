"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "../products/actions";
import { Minus, Plus } from "lucide-react";

type Product = { id: string; name: string; sku: string; current_stock: number; low_stock_threshold: number };

export default function StockAdjustRow({ product }: { product: Product }) {
  const [amount, setAmount] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(delta: number) {
    setError(null);
    startTransition(async () => {
      const result = await adjustStock(product.id, delta, delta > 0 ? "Manual stock added" : "Manual stock adjustment");
      if (result?.error) setError(result.error);
    });
  }

  return (
    <tr className="border-t border-ink/5">
      <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-ink/50">{product.sku}</td>
      <td className="px-4 py-3">
        <span className={product.current_stock <= product.low_stock_threshold ? "font-medium text-red-600" : "text-ink"}>
          {product.current_stock}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button disabled={isPending} onClick={() => apply(-amount)} className="h-7 w-7 flex items-center justify-center rounded-full border border-ink/15 hover:bg-cream">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-14 rounded-lg border border-ink/15 px-2 py-1 text-center text-sm"
          />
          <button disabled={isPending} onClick={() => apply(amount)} className="h-7 w-7 flex items-center justify-center rounded-full border border-ink/15 hover:bg-cream">
            <Plus className="h-3.5 w-3.5" />
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  );
}
