"use client";

import { useState } from "react";
import { getSignedInvestorDocUrl } from "../actions";
import { FileText, Loader2, ExternalLink } from "lucide-react";

export default function InvestorDocLink({ path, label }: { path: string | null; label: string }) {
  const [loading, setLoading] = useState(false);

  if (!path) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink/30">
        <FileText className="h-4 w-4" /> {label}: not uploaded
      </div>
    );
  }

  async function open() {
    setLoading(true);
    const url = await getSignedInvestorDocUrl(path!);
    setLoading(false);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={open}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-ink hover:text-gold-600"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      {label}
      <ExternalLink className="h-3 w-3" />
    </button>
  );
}
