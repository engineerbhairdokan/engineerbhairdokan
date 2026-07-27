"use client";

import { useState, useTransition } from "react";
import { updateContactInfo } from "./actions";

type ContactInfo = {
  businessName: string; logoUrl: string; phone: string; whatsapp: string; email: string;
  website: string; facebook: string; instagram: string; youtube: string; address: string; googleMapEmbed: string;
};

export default function ContactInfoForm({ initial }: { initial: ContactInfo }) {
  const [form, setForm] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ContactInfo>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Business Name"><input value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className="input" /></Field>
      <Field label="Logo URL"><input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className="input" /></Field>
      <Field label="Phone"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" /></Field>
      <Field label="WhatsApp (with country code)"><input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="input" placeholder="8801XXXXXXXXX" /></Field>
      <Field label="Email"><input value={form.email} onChange={(e) => set("email", e.target.value)} className="input" /></Field>
      <Field label="Website"><input value={form.website} onChange={(e) => set("website", e.target.value)} className="input" /></Field>
      <Field label="Facebook URL"><input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className="input" /></Field>
      <Field label="Instagram URL"><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="input" /></Field>
      <Field label="YouTube URL"><input value={form.youtube} onChange={(e) => set("youtube", e.target.value)} className="input" /></Field>
      <Field label="Address"><input value={form.address} onChange={(e) => set("address", e.target.value)} className="input" /></Field>
      <div className="sm:col-span-2">
        <Field label="Google Map Embed URL"><input value={form.googleMapEmbed} onChange={(e) => set("googleMapEmbed", e.target.value)} className="input" /></Field>
      </div>

      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}

      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await updateContactInfo(form);
            if (result?.error) setError(result.error);
            else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
          })
        }
        className="sm:col-span-2 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
      >
        {saved ? "Saved ✓" : "Save Contact Info"}
      </button>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.55rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>{children}</label>;
}
