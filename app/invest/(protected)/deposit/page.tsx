"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/pricing";
import { Loader2, Upload, CheckCircle2, Copy } from "lucide-react";

type BankInfo = {
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_branch: string | null;
  bank_routing_number: string | null;
  bkash_number: string | null;
  nagad_number: string | null;
};

export default function DepositPage() {
  const router = useRouter();
  const [bank, setBank] = useState<BankInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("investment_settings")
      .select("bank_name, bank_account_name, bank_account_number, bank_branch, bank_routing_number, bkash_number, nagad_number")
      .eq("id", 1)
      .single()
      .then(({ data }) => setBank(data as unknown as BankInfo));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please attach a payment screenshot.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired, please log in again.");
      setLoading(false);
      return;
    }

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("investor-deposits").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("submit_investor_deposit", {
      p_amount: Number(amount),
      p_screenshot_url: path,
      p_note: note || null,
    });

    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    fetch("/api/investor-notifications/flush", { method: "POST" }).catch(() => {});
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-gold bg-gold-100 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold-600" />
        <p className="font-display font-bold text-lg text-ink mt-3">Deposit Submitted</p>
        <p className="text-sm text-ink/70 mt-1">
          We&apos;ll review your payment and credit your balance shortly. You&apos;ll get a notification once approved.
        </p>
        <button onClick={() => router.push("/invest")} className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="spec-readout text-xs text-gold-600">Add Funds</p>
        <h2 className="font-display font-bold text-xl text-ink">Deposit Money</h2>
      </div>

      {bank && (
        <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-2 text-sm">
          <p className="text-xs text-ink/50 mb-1">Send payment to one of these, then upload proof below:</p>
          {bank.bank_name && <BankRow label="Bank" value={`${bank.bank_name} — ${bank.bank_account_name} — ${bank.bank_account_number}${bank.bank_branch ? ` (${bank.bank_branch})` : ""}`} />}
          {bank.bkash_number && <BankRow label="bKash" value={bank.bkash_number} />}
          {bank.nagad_number && <BankRow label="Nagad" value={bank.nagad_number} />}
          {!bank.bank_name && !bank.bkash_number && !bank.nagad_number && (
            <p className="text-ink/40 text-xs">Payment details haven&apos;t been set up yet — contact admin directly.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Amount Sent</span>
          <input required type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Transaction Note (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="e.g. bKash TrxID" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Payment Screenshot</span>
          <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 py-6 cursor-pointer hover:border-gold text-sm text-ink/50">
            <Upload className="h-4 w-4" />
            {file ? file.name : "Click to upload screenshot"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Deposit
        </button>
      </form>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <span className="text-ink/40 text-xs">{label}: </span>
        <span className="font-medium text-ink">{value}</span>
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        className="text-ink/30 hover:text-ink"
        title="Copy"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
