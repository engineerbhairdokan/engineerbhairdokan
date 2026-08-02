"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInvestmentSettings } from "../actions";
import { Loader2, Check } from "lucide-react";

export default function SettingsForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    minInvestmentAmount: settings?.min_investment_amount ?? 5000,
    defaultProfitPercent: settings?.default_profit_percent ?? 10,
    defaultLossPercent: settings?.default_loss_percent ?? 100,
    policyText: settings?.policy_text ?? "",
    dealInstructionsText: settings?.deal_instructions_text ?? "",
    bankName: settings?.bank_name ?? "",
    bankAccountName: settings?.bank_account_name ?? "",
    bankAccountNumber: settings?.bank_account_number ?? "",
    bankBranch: settings?.bank_branch ?? "",
    bankRoutingNumber: settings?.bank_routing_number ?? "",
    bkashNumber: settings?.bkash_number ?? "",
    nagadNumber: settings?.nagad_number ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateInvestmentSettings(form);
      if (result?.error) setError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-3">
        <Field label="Minimum Investment (৳)">
          <input type="number" min={0} value={form.minInvestmentAmount} onChange={(e) => set("minInvestmentAmount", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Investor Profit Share (%)">
          <input type="number" min={0} max={100} value={form.defaultProfitPercent} onChange={(e) => set("defaultProfitPercent", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Investor Loss Share (%)">
          <input type="number" min={0} max={100} value={form.defaultLossPercent} onChange={(e) => set("defaultLossPercent", Number(e.target.value))} className="input" />
        </Field>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <p className="text-xs font-medium text-ink/60 mb-2">Payment Details (shown to logged-in investors when depositing)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bank Name"><input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className="input" /></Field>
          <Field label="Account Name"><input value={form.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} className="input" /></Field>
          <Field label="Account Number"><input value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} className="input" /></Field>
          <Field label="Branch"><input value={form.bankBranch} onChange={(e) => set("bankBranch", e.target.value)} className="input" /></Field>
          <Field label="Routing Number"><input value={form.bankRoutingNumber} onChange={(e) => set("bankRoutingNumber", e.target.value)} className="input" /></Field>
          <Field label="bKash Number"><input value={form.bkashNumber} onChange={(e) => set("bkashNumber", e.target.value)} className="input" /></Field>
          <Field label="Nagad Number"><input value={form.nagadNumber} onChange={(e) => set("nagadNumber", e.target.value)} className="input" /></Field>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <Field label="Investment Rules & Policy (shown at investor signup)">
          <textarea rows={8} value={form.policyText} onChange={(e) => set("policyText", e.target.value)} className="input" />
        </Field>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-4">
        <Field label="Deal Document Instructions (tells investors what to write/sign in their agreement PDF)">
          <textarea rows={5} value={form.dealInstructionsText} onChange={(e) => set("dealInstructionsText", e.target.value)} className="input" />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
        {saved ? "Saved" : "Save Settings"}
      </button>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.55rem 0.8rem; font-size: 0.85rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      {children}
    </label>
  );
}
