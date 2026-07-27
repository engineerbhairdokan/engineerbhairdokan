"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBanner, toggleBannerActive, deleteBanner } from "./actions";
import { Plus } from "lucide-react";

type Banner = { id: string; image_url: string; title: string | null; link_url: string | null; sort_order: number; is_active: boolean };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState({ imageUrl: "", title: "", linkUrl: "", sortOrder: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners((data as Banner[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.imageUrl.trim()) { setError("Image URL is required"); return; }
    startTransition(async () => {
      const result = await createBanner(form);
      if (result?.error) setError(result.error);
      else { setForm({ imageUrl: "", title: "", linkUrl: "", sortOrder: banners.length }); load(); }
    });
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Storefront</p>
        <h1 className="font-display font-bold text-2xl text-ink">Banners</h1>
        <p className="text-sm text-ink/50 mt-1">Upload banner images to your Supabase Storage bucket first, then paste the public URL here.</p>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-ink/60">Image URL</span>
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://...supabase.co/storage/v1/object/public/banners/..." />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Title (optional)</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/60">Link URL (optional)</span>
          <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="input" />
        </label>
        <button disabled={isPending} className="sm:col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.image_url} alt={b.title ?? ""} className="w-full aspect-[3/1] object-cover" />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{b.title ?? "Untitled"}</p>
                <label className="flex items-center gap-1.5 text-xs text-ink/50 mt-1">
                  <input type="checkbox" defaultChecked={b.is_active} onChange={(e) => startTransition(() => { toggleBannerActive(b.id, e.target.checked); })} />
                  Active
                </label>
              </div>
              <button className="text-red-600 hover:underline text-sm" onClick={() => startTransition(async () => { await deleteBanner(b.id); load(); })}>Delete</button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-sm text-ink/40 sm:col-span-2 text-center py-8">No banners yet.</p>}
      </div>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.5rem 0.8rem; font-size: 0.85rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
