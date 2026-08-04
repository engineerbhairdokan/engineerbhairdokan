"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSampleClaimStatus } from "../actions";

const STATUSES = ["pending", "confirmed", "processing", "packed", "handed_to_courier", "in_transit", "delivered", "cancelled"];

export default function StatusUpdateSelect({ claimId, status }: { claimId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await updateSampleClaimStatus(claimId, e.target.value);
          router.refresh();
        })
      }
      className="rounded-full border border-ink/15 bg-white px-2.5 py-1 text-xs capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}
