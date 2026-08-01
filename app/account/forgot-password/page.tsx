"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold">
        <Mail className="h-5 w-5 text-ink" />
      </div>
      <h1 className="text-center font-display font-bold text-xl text-ink">Reset Your Password</h1>
      <p className="text-center text-sm text-ink/50 mt-1 mb-6">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Reset Link
        </button>

        <p className="text-center text-sm text-ink/50">
          <Link href="/account/login" className="text-gold-600 hover:underline">Back to Login</Link>
        </p>
      </form>

      {sent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
              <CheckCircle2 className="h-6 w-6 text-gold-600" />
            </div>
            <p className="font-display font-bold text-lg text-ink">Check your email</p>
            <p className="text-sm text-ink/60 mt-2">
              A password reset link has been sent to <span className="font-medium text-ink">{email}</span>.
              Open it and click the link to set a new password.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/account/login"
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream hover:bg-ink-700"
              >
                Back to Login
              </Link>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-ink/40 hover:text-ink/60"
              >
                Didn&apos;t get it? Try a different email
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
