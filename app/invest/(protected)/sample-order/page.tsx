import { Suspense } from "react";
import SampleOrderForm from "./SampleOrderForm";

export default function SampleOrderPage() {
  return (
    <Suspense fallback={<div className="max-w-lg text-sm text-ink/40">Loading…</div>}>
      <SampleOrderForm />
    </Suspense>
  );
}
