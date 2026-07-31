"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { ShoppingCart, Check, Plus } from "lucide-react";

export default function AddToCartButton({
  productId,
  name,
  slug,
  image,
  price,
  maxStock,
  quantity = 1,
  variant = "full",
}: {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  maxStock: number;
  quantity?: number;
  variant?: "full" | "icon";
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productId, name, slug, image, price, maxStock }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={maxStock <= 0}
        aria-label="Add to cart"
        className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream shadow-md hover:bg-ink-700 disabled:opacity-40 transition-colors"
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={maxStock <= 0}
      className="flex items-center justify-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-display font-bold text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {added ? "Added!" : "Add to Cart"}
    </button>
  );
}
