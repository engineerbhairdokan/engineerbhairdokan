"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { BANGLADESH_DISTRICTS } from "@/lib/districts";
import { formatBDT } from "@/lib/pricing";
import { CheckCircle2, Loader2, Minus, Plus } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (e.g. 01712345678)"),
  altPhone: z.string().optional().or(z.literal("")),
  district: z.string().min(1, "Select your district"),
  address: z.string().min(10, "Enter your full delivery address"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OrderForm({
  productId,
  unitPrice,
  insideDhakaCharge,
  outsideDhakaCharge,
}: {
  productId: string;
  unitPrice: number;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "success"; orderNumber: string; grandTotal: number }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const district = watch("district");

  const deliveryCharge = useMemo(() => {
    if (!district) return null;
    return district === "Dhaka" ? insideDhakaCharge : outsideDhakaCharge;
  }, [district, insideDhakaCharge, outsideDhakaCharge]);

  const subtotal = unitPrice * quantity;
  const grandTotal = subtotal + (deliveryCharge ?? 0);

  async function onSubmit(values: FormValues) {
    setState({ status: "submitting" });
    const supabase = createClient();

    const { data: rawData, error } = await supabase.rpc("place_order", {
      p_customer_name: values.name,
      p_phone: values.phone,
      p_alt_phone: values.altPhone || null,
      p_district: values.district,
      p_full_address: values.address,
      p_items: [{ product_id: productId, quantity }],
      p_notes: values.notes || null,
    });
    const data = rawData as any[] | null;

    if (error || !data || data.length === 0) {
      setState({ status: "error", message: error?.message ?? "Something went wrong placing your order." });
      return;
    }

    const result = data[0];
    setState({ status: "success", orderNumber: result.order_number, grandTotal: result.grand_total });
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-gold bg-gold-100 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold-600" />
        <p className="font-display font-bold text-xl text-ink mt-3">Order Confirmed!</p>
        <p className="text-sm text-ink/70 mt-1">
          Order <span className="font-mono font-semibold">{state.orderNumber}</span> — Cash on Delivery,{" "}
          {formatBDT(state.grandTotal)} due on arrival.
        </p>
        <p className="text-xs text-ink/50 mt-3">We&apos;ll call you shortly to confirm delivery details.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-ink/10 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="spec-readout text-xs text-gold-600">Order Now — Cash on Delivery</p>
        <div className="flex items-center gap-3 rounded-full border border-ink/15 px-1.5 py-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full Name" error={errors.name?.message}>
          <input {...register("name")} className="input" placeholder="Your name" />
        </Field>
        <Field label="Mobile Number" error={errors.phone?.message}>
          <input {...register("phone")} className="input" placeholder="01XXXXXXXXX" inputMode="numeric" />
        </Field>
        <Field label="Alternative Phone (optional)">
          <input {...register("altPhone")} className="input" placeholder="Optional" inputMode="numeric" />
        </Field>
        <Field label="District" error={errors.district?.message}>
          <select {...register("district")} className="input">
            <option value="">Select district</option>
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Full Delivery Address" error={errors.address?.message}>
        <textarea {...register("address")} rows={2} className="input" placeholder="House, road, area, city" />
      </Field>

      <Field label="Notes (optional)">
        <textarea {...register("notes")} rows={2} className="input" placeholder="Any special instructions" />
      </Field>

      <div className="rounded-xl bg-cream p-4 space-y-1.5 text-sm">
        <Row label="Subtotal" value={formatBDT(subtotal)} />
        <Row label="Delivery Charge" value={deliveryCharge === null ? "Select district" : formatBDT(deliveryCharge)} />
        <div className="border-t border-ink/10 pt-1.5 mt-1.5">
          <Row label="Grand Total" value={formatBDT(grandTotal)} bold />
        </div>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-display font-bold text-ink hover:bg-gold-600 transition-colors disabled:opacity-60"
      >
        {state.status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        Place Order — Cash on Delivery
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(27, 36, 51, 0.15);
          padding: 0.6rem 0.85rem;
          font-size: 0.9rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #f3a93b;
        }
      `}</style>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink/60">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-display font-bold text-ink" : "text-ink/60"}>{label}</span>
      <span className={bold ? "font-display font-bold text-ink" : "font-medium text-ink"}>{value}</span>
    </div>
  );
}
