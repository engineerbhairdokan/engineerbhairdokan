"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateInvoice } from "../actions";
import { FileText } from "lucide-react";

export default function InvoiceButton({ orderId, existingInvoiceNumber }: { orderId: string; existingInvoiceNumber: string | null }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (existingInvoiceNumber) {
    return (
      <Link
        href={`/admin/orders/${orderId}/invoice`}
        target="_blank"
        className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cream"
      >
        <FileText className="h-4 w-4" /> View Invoice ({existingInvoiceNumber})
      </Link>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await generateInvoice(orderId);
          router.refresh();
        })
      }
      className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
    >
      <FileText className="h-4 w-4" /> Generate Invoice
    </button>
  );
}
