"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export default function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream/10" aria-label="View cart">
      <ShoppingCart className="h-5 w-5 text-cream" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
