"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="text-red-600 hover:underline disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Delete "${name}"? This cannot be undone.`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
    >
      Delete
    </button>
  );
}
