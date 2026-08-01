"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";

export default function InvestorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const meta = data.user?.user_metadata ?? {};

    const { data: existing } = await supabase.from("investors").select("id").maybeSingle();

    if (!existing) {
      if (meta.role !== "investor") {
        setError("This account isn't registered as an investor.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      const { error: profileError } = await supabase.rpc("register_investor", {
        p_name: meta.name ?? "",
        p_phone: meta.phone ?? "",
        p_email: email,
      });
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/invest");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold">
        <TrendingUp className="h-5 w-5 text-ink" />
      </div>
      <h1 className="text-center font-display font-bold text-xl text-ink">Investor Login</h1>
      <p className="text-center text-sm text-ink/50 mt-1 mb-6">Access your investment dashboard</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Password</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </label>
        <p className="text-right text-xs">
          <Link href="/account/forgot-password" className="text-gold-600 hover:underline">Forgot password?</Link>
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log In
        </button>

        <p className="text-center text-sm text-ink/50">
          New investor? <Link href="/invest/register" className="text-gold-600 hover:underline">Create an account</Link>
        </p>
      </form>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
