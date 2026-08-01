"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/pricing";
import { Loader2, TrendingUp } from "lucide-react";

type SignupInfo = {
  min_investment_amount: number;
  default_profit_percent: number;
  default_loss_percent: number;
  policy_text: string;
};

export default function InvestorRegisterPage() {
  const router = useRouter();
  const [info, setInfo] = useState<SignupInfo | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_investment_signup_info").then(({ data }) => {
      const row = (data as any[])?.[0];
      if (row) setInfo(row);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the investment rules & policy to continue.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/invest/login`,
        data: { name, phone, role: "investor" },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.rpc("register_investor", {
      p_name: name,
      p_phone: phone,
      p_email: email,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/invest");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <p className="font-display font-bold text-xl text-ink">Check your email</p>
        <p className="text-sm text-ink/60 mt-2">
          We sent a confirmation link to {email}. Click it, then come back and log in.
        </p>
        <Link href="/invest/login" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-medium text-cream hover:bg-ink-700">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold">
        <TrendingUp className="h-5 w-5 text-ink" />
      </div>
      <h1 className="text-center font-display font-bold text-xl text-ink">Become an Investor</h1>
      <p className="text-center text-sm text-ink/50 mt-1 mb-6">
        Invest in specific products and share the profit
      </p>

      {info && (
        <div className="mb-5 rounded-2xl border border-ink/10 bg-cream p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/60">Minimum Investment</span>
            <span className="font-medium text-ink">{formatBDT(info.min_investment_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Your Profit Share</span>
            <span className="font-medium text-ink">{info.default_profit_percent}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/60">Your Loss Share</span>
            <span className="font-medium text-ink">{info.default_loss_percent}%</span>
          </div>
          <div className="pt-2 border-t border-ink/10">
            <p className="text-ink/60 text-xs mb-1">Rules & Policy</p>
            <p className="text-ink/80 whitespace-pre-wrap text-xs leading-relaxed max-h-40 overflow-y-auto">
              {info.policy_text}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Full Name"><input required value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>
        <Field label="Mobile Number"><input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="01XXXXXXXXX" /></Field>
        <Field label="Email"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></Field>
        <Field label="Password"><input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></Field>

        <label className="flex items-start gap-2 text-xs text-ink/60">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
          I have read and agree to the investment rules & policy above.
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Investor Account
        </button>

        <p className="text-center text-sm text-ink/50">
          Already an investor? <Link href="/invest/login" className="text-gold-600 hover:underline">Log in</Link>
        </p>
      </form>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
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
