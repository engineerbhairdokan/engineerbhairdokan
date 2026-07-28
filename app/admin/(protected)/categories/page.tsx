"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCategory, toggleCategoryActive, deleteCategory } from "./actions";
import { Plus } from "lucide-react";

type Category = { id: string; name: string; slug: string; is_active: boolean };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("id, name, slug, is_active").order("name");
    setCategories((data as unknown as Category[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("slug", slug);
    startTransition(async () => {
      const result = await createCategory(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setName("");
        setSlug("");
        load();
      }
    });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Catalog</p>
        <h1 className="font-display font-bold text-2xl text-ink">Categories</h1>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 flex gap-2 items-end flex-wrap">
        <label className="flex-1 min-w-[160px]">
          <span className="mb-1 block text-xs font-medium text-ink/60">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Headphones" />
        </label>
        <label className="flex-1 min-w-[160px]">
          <span className="mb-1 block text-xs font-medium text-ink/60">Slug</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input font-mono" placeholder="headphones" />
        </label>
        <button disabled={isPending} className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Active</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">{c.slug}</td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    defaultChecked={c.is_active}
                    onChange={(e) => startTransition(() => { toggleCategoryActive(c.id, e.target.checked); })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => {
                      if (confirm(`Delete category "${c.name}"?`)) {
                        startTransition(async () => {
                          await deleteCategory(c.id);
                          load();
                        });
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-ink/40">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.55rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
