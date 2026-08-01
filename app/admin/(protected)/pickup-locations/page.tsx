"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPickupLocation, updatePickupLocation, togglePickupLocationActive, deletePickupLocation } from "./actions";
import { Plus, MapPin, Pencil, Check, X } from "lucide-react";

type PickupLocation = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  is_active: boolean;
};

const emptyForm = { name: "", address: "", phone: "" };

export default function PickupLocationsPage() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("pickup_locations").select("*").order("name");
    setLocations((data as unknown as PickupLocation[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPickupLocation(form);
      if (result?.error) setError(result.error);
      else { setForm(emptyForm); load(); }
    });
  }

  function startEdit(loc: PickupLocation) {
    setEditingId(loc.id);
    setEditForm({ name: loc.name, address: loc.address, phone: loc.phone ?? "" });
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      const result = await updatePickupLocation(id, editForm);
      if (result?.error) setError(result.error);
      else { setEditingId(null); load(); }
    });
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Delivery</p>
        <h1 className="font-display font-bold text-2xl text-ink">Pickup Locations</h1>
        <p className="text-sm text-ink/50 mt-1">
          Customers who choose &quot;Pickup&quot; at checkout pick one of these — no delivery charge applies.
        </p>
      </div>

      <form onSubmit={handleAdd} className="rounded-2xl border border-ink/10 bg-white p-4 grid gap-3 sm:grid-cols-2">
        <Field label="Location Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Mirpur Shop" required />
        </Field>
        <Field label="Phone (optional)">
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Full Address">
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" rows={2} required />
          </Field>
        </div>
        <button disabled={isPending} className="sm:col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add Pickup Location
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {locations.map((loc) => (
          <div key={loc.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            {editingId === loc.id ? (
              <div className="space-y-2">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input" placeholder="Name" />
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input" placeholder="Phone" />
                <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="input" rows={2} placeholder="Address" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(loc.id)} className="flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-cream hover:bg-ink-700">
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ink">{loc.name}</p>
                    <p className="text-sm text-ink/60">{loc.address}</p>
                    {loc.phone && <p className="text-xs text-ink/40 mt-0.5">{loc.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-ink/50">
                    <input
                      type="checkbox"
                      defaultChecked={loc.is_active}
                      onChange={(e) => startTransition(() => { togglePickupLocationActive(loc.id, e.target.checked); })}
                    />
                    Active
                  </label>
                  <button onClick={() => startEdit(loc)} className="text-ink/40 hover:text-ink">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-600 hover:underline text-xs"
                    onClick={() => { if (confirm(`Delete "${loc.name}"?`)) startTransition(async () => { await deletePickupLocation(loc.id); load(); }); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {locations.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/20 py-10 text-center text-ink/40">
            No pickup locations yet — add one above.
          </p>
        )}
      </div>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.5rem 0.8rem; font-size: 0.85rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>{children}</label>;
}
