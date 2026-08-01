"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleInvestorStatus } from "../actions";

export default function StatusToggle({ investorId, status }: { investorId: string; status: "active" | "suspended" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleInvestorStatus(investorId, status === "active" ? "suspended" : "active");
          router.refresh();
        })
      }
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
        status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700" : "bg-red-100 text-red-700 hover:bg-emerald-100 hover:text-emerald-700"
      }`}
    >
      {status} — click to {status === "active" ? "suspend" : "reactivate"}
    </button>
  );
}
