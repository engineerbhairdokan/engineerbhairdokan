"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-700"
    >
      <Printer className="h-4 w-4" /> Print / Save PDF
    </button>
  );
}
