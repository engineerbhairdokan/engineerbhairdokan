"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The Supabase JS client auto-detects the access_token in the URL hash
  // (detectSessionInUrl is on by default) and turns it into a real session.
  // We just need to wait a tick for that to happen before showing the form.
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else if (!window.location.hash.includes("access_token")) {
        setInvalidLink(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/account/login");
    }, 2000);
  }

  if (invalidLink) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <p className="font-display font-bold text-xl text-ink">Link expired or invalid</p>
        <p className="text-sm text-ink/60 mt-2">
          This password reset link is no longer valid. Please request a new one.
        </p>
        <a
          href="/account/login"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-medium text-cream hover:bg-ink-700"
        >
          Back to Login
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <p className="font-display font-bold text-xl text-ink">Password updated</p>
        <p className="text-sm text-ink/60 mt-2">Redirecting you to log in&hellip;</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold">
        <KeyRound className="h-5 w-5 text-ink" />
      </div>
      <h1 className="text-center font-display font-bold text-xl text-ink">Set a New Password</h1>
      <p className="text-center text-sm text-ink/50 mt-1 mb-6">
        Choose a new password for your account
      </p>

      {!ready ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">New Password</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">Confirm Password</span>
            <input
              required
              type="password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            Update Password
          </button>
        </form>
      )}

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.6rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
