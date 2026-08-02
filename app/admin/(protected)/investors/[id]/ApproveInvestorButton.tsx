"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveInvestor } from "../actions";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ApproveInvestorButton({ investorId }: { investorId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await approveInvestor(investorId);
          router.refresh();
        })
      }
      className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      Approve Investor
    </button>
  );
}
