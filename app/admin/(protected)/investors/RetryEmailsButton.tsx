"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { retryFailedInvestorEmails } from "./actions";
import { Loader2, RefreshCw } from "lucide-react";

export default function RetryEmailsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await retryFailedInvestorEmails();
          setDone(true);
          router.refresh();
        })
      }
      className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      {done ? "Retried — check below" : "Retry Now"}
    </button>
  );
}
