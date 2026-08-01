"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { formatBDT } from "@/lib/pricing";
import { Loader2, Plus, X } from "lucide-react";
import type { ProductFormInput } from "@/app/admin/(protected)/products/actions";

type Category = { id: string; name: string };

export default function ProductForm({
  categories,
  initial,
  onSubmit,
  submitLabel,
}: {
  categories: Category[];
  initial?: Partial<ProductFormInput>;
  onSubmit: (input: ProductFormInput) => Promise<{ error?: string } | void>;
  submitLabel: string;
}) {
  const [images, setImages] = useState<string[]>(initial?.imageUrls ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch } = useForm<ProductFormInput>({
    defaultValues: {
      sku: "",
      name: "",
      slug: "",
      categoryId: null,
      shortDescription: "",
      description: "",
      status: "draft",
      regularPrice: 0,
      discountType: "none",
      discountValue: 0,
      discountStartDate: null,
      discountEndDate: null,
      purchaseCost: 0,
      shippingCost: 0,
      packagingCost: 0,
      packingCost: 0,
      advertisingCost: 0,
      courierCost: 0,
      otherCost: 0,
      currentStock: 0,
      lowStockThreshold: 5,
      isFeatured: false,
      isNewArrival: false,
      ...initial,
    },
  });

  const values = watch();
  const totalCost = useMemo(
    () =>
      Number(values.purchaseCost || 0) +
      Number(values.shippingCost || 0) +
      Number(values.packagingCost || 0) +
      Number(values.packingCost || 0) +
      Number(values.advertisingCost || 0) +
      Number(values.courierCost || 0) +
      Number(values.otherCost || 0),
    [values]
  );
  const grossProfit = Number(values.regularPrice || 0) - totalCost;
  const profitPercent = values.regularPrice > 0 ? Math.round((grossProfit / values.regularPrice) * 100) : 0;

  async function submit(data: ProductFormInput) {
    setSubmitting(true);
    setServerError(null);
    const finalImages = newImageUrl.trim() ? [...images, newImageUrl.trim()] : images;
    const result = await onSubmit({ ...data, imageUrls: finalImages });
    if (result?.error) {
      setServerError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6 max-w-3xl">
      <Section title="Basic Information">
        <Grid>
          <Field label="Product Name">
            <input {...register("name", { required: true })} className="input" />
          </Field>
          <Field label="SKU">
            <input {...register("sku", { required: true })} className="input font-mono" />
          </Field>
          <Field label="URL Slug">
            <input {...register("slug", { required: true })} className="input font-mono" placeholder="e.g. wireless-earbuds-x1" />
          </Field>
          <Field label="Category">
            <select {...register("categoryId")} className="input">
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select {...register("status")} className="input">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </Grid>
        <Field label="Short Description">
          <input {...register("shortDescription")} className="input" placeholder="One-line summary shown on product cards" />
        </Field>
        <Field label="Full Description">
          <textarea {...register("description")} rows={4} className="input" />
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isFeatured")} /> Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isNewArrival")} /> New arrival
          </label>
        </div>
      </Section>

      <Section title="Images">
        <div className="flex gap-2 mb-3">
          <input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste Supabase Storage image URL"
            className="input"
          />
          <button
            type="button"
            onClick={() => {
              if (newImageUrl.trim()) {
                setImages((prev) => [...prev, newImageUrl.trim()]);
                setNewImageUrl("");
              }
            }}
            className="shrink-0 rounded-xl bg-ink px-4 text-cream"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg border border-ink/10 overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 rounded-full bg-ink/80 p-1 text-cream"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-bold text-ink">Primary</span>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Pricing & Discount">
        <Grid>
          <Field label="Regular Price (৳)">
            <input type="number" step="0.01" {...register("regularPrice", { valueAsNumber: true })} className="input" />
          </Field>
          <Field label="Discount Type">
            <select {...register("discountType")} className="input">
              <option value="none">No Discount</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="flash_sale">Flash Sale</option>
            </select>
          </Field>
          <Field label="Discount Value">
            <input type="number" step="0.01" {...register("discountValue", { valueAsNumber: true })} className="input" />
          </Field>
          <Field label="Discount Start">
            <input type="datetime-local" {...register("discountStartDate")} className="input" />
          </Field>
          <Field label="Discount End">
            <input type="datetime-local" {...register("discountEndDate")} className="input" />
          </Field>
        </Grid>
      </Section>

      <Section title="Cost Breakdown (per unit)">
        <Grid>
          <Field label="Purchase Cost"><input type="number" step="0.01" {...register("purchaseCost", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Shipping Cost"><input type="number" step="0.01" {...register("shippingCost", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Packaging Cost (materials)"><input type="number" step="0.01" {...register("packagingCost", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Packing Cost (labor)"><input type="number" step="0.01" {...register("packingCost", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Advertising Cost"><input type="number" step="0.01" {...register("advertisingCost", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Courier Cost"><input type="number" step="0.01" {...register("courierCost", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Other Cost"><input type="number" step="0.01" {...register("otherCost", { valueAsNumber: true })} className="input" /></Field>
        </Grid>

        <div className="rounded-xl bg-cream p-4 grid grid-cols-3 gap-4 text-sm mt-2">
          <div>
            <p className="spec-readout text-[10px] text-ink/40">Total Cost</p>
            <p className="font-display font-bold text-ink">{formatBDT(totalCost)}</p>
          </div>
          <div>
            <p className="spec-readout text-[10px] text-ink/40">Gross Profit</p>
            <p className={`font-display font-bold ${grossProfit < 0 ? "text-red-600" : "text-gold-600"}`}>{formatBDT(grossProfit)}</p>
          </div>
          <div>
            <p className="spec-readout text-[10px] text-ink/40">Profit %</p>
            <p className={`font-display font-bold ${profitPercent < 0 ? "text-red-600" : "text-ink"}`}>{profitPercent}%</p>
          </div>
        </div>
      </Section>

      <Section title="Stock">
        <Grid>
          <Field label="Current Stock"><input type="number" {...register("currentStock", { valueAsNumber: true })} className="input" /></Field>
          <Field label="Low Stock Threshold"><input type="number" {...register("lowStockThreshold", { valueAsNumber: true })} className="input" /></Field>
        </Grid>
        <p className="text-xs text-ink/40">To change stock on an existing product, use the Inventory page instead — it keeps a full audit trail.</p>
      </Section>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(27, 36, 51, 0.15);
          padding: 0.55rem 0.85rem;
          font-size: 0.9rem;
          background: white;
        }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 space-y-3">
      <h2 className="font-display font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      {children}
    </label>
  );
}
