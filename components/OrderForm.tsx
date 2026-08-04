"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { BANGLADESH_DISTRICTS } from "@/lib/districts";
import { formatBDT } from "@/lib/pricing";
import { CheckCircle2, Loader2, Minus, Plus, Tag, X, MapPin, Truck, Award } from "lucide-react";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    phone: z
      .string()
      .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (e.g. 01712345678)"),
    altPhone: z.string().optional().or(z.literal("")),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    district: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    pickupLocationId: z.string().optional().or(z.literal("")),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.deliveryMethod === "delivery") {
      if (!values.district) ctx.addIssue({ code: "custom", path: ["district"], message: "Select your district" });
      if (!values.address || values.address.length < 10)
        ctx.addIssue({ code: "custom", path: ["address"], message: "Enter your full delivery address" });
    } else {
      if (!values.pickupLocationId) ctx.addIssue({ code: "custom", path: ["pickupLocationId"], message: "Select a pickup location" });
    }
  });

type FormValues = z.infer<typeof schema>;
type PickupLocation = { id: string; name: string; address: string; phone: string | null };

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
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [membershipDiscountPercent, setMembershipDiscountPercent] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

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
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryMethod: "delivery" },
  });

  const district = watch("district");
  const deliveryMethod = watch("deliveryMethod");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("pickup_locations")
      .select("id, name, address, phone")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setPickupLocations((data as unknown as PickupLocation[]) ?? []));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (!user) return;

      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, phone, email, membership_status, membership_discount_percent, membership_valid_until")
        .eq("auth_user_id", user.id)
        .single();
      if (!customer) return;

      setValue("name", (customer as any).name ?? "");
      setValue("phone", (customer as any).phone ?? "");
      setCustomerEmail((customer as any).email ?? null);

      const c = customer as any;
      const membershipValid = c.membership_status === "active" && (!c.membership_valid_until || c.membership_valid_until >= new Date().toISOString().slice(0, 10));
      if (membershipValid) setMembershipDiscountPercent(c.membership_discount_percent ?? 0);

      const { data: address } = await supabase
        .from("customer_addresses")
        .select("district, full_address")
        .eq("customer_id", (customer as any).id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (address) {
        setValue("district", (address as any).district ?? "");
        setValue("address", (address as any).full_address ?? "");
      }
    })();
  }, [setValue]);

  const deliveryCharge = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (!district) return null;
    return district === "Dhaka" ? insideDhakaCharge : outsideDhakaCharge;
  }, [deliveryMethod, district, insideDhakaCharge, outsideDhakaCharge]);

  const subtotal = unitPrice * quantity;
  const membershipDiscount = Math.round((subtotal * membershipDiscountPercent) / 100);
  const couponDiscount = couponApplied?.discount ?? 0;
  const discount = membershipDiscount + couponDiscount;
  const grandTotal = Math.max(subtotal - discount, 0) + (deliveryCharge ?? 0);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("validate_coupon", { p_code: couponCode.trim(), p_subtotal: subtotal });
    const result = (data as any[] | null)?.[0];
    setCheckingCoupon(false);

    if (error || !result || !result.valid) {
      setCouponError(result?.message ?? error?.message ?? "Could not validate coupon");
      setCouponApplied(null);
      return;
    }
    setCouponApplied({ code: couponCode.trim(), discount: result.discount_amount });
  }

  async function onSubmit(values: FormValues) {
    setState({ status: "submitting" });
    const supabase = createClient();

    const { data: rawData, error } = await supabase.rpc("place_order", {
      p_customer_name: values.name,
      p_phone: values.phone,
      p_alt_phone: values.altPhone || null,
      p_district: values.deliveryMethod === "delivery" ? values.district : null,
      p_full_address: values.deliveryMethod === "delivery" ? values.address : null,
      p_items: [{ product_id: productId, quantity }],
      p_notes: values.notes || null,
      p_coupon_code: couponApplied?.code || null,
      p_delivery_method: values.deliveryMethod,
      p_pickup_location_id: values.deliveryMethod === "pickup" ? values.pickupLocationId : null,
    });
    const data = rawData as any[] | null;

    if (error || !data || data.length === 0) {
      setState({ status: "error", message: error?.message ?? "Something went wrong placing your order." });
      return;
    }

    const result = data[0];

    fetch("/api/orders/notify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: result.order_id }),
    }).catch(() => {});

    if (customerEmail) {
      fetch("/api/orders/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.order_id }),
      }).catch(() => {});
    }

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
      {isLoggedIn === false && (
        <a
          href="/account/register"
          className="flex items-center gap-2 rounded-xl bg-gold-100 border border-gold px-3 py-2.5 text-xs font-medium text-ink hover:bg-gold-200 transition-colors"
        >
          <Award className="h-4 w-4 text-gold-600 shrink-0" />
          Sign up and order to earn reward points, claim your Bhai Brother Membership Card, and create your own discount coupons!
        </a>
      )}
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

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setValue("deliveryMethod", "delivery")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
            deliveryMethod === "delivery" ? "border-gold bg-gold-100 text-ink" : "border-ink/15 text-ink/50 hover:bg-cream"
          }`}
        >
          <Truck className="h-4 w-4" /> Home Delivery
        </button>
        <button
          type="button"
          onClick={() => setValue("deliveryMethod", "pickup")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
            deliveryMethod === "pickup" ? "border-gold bg-gold-100 text-ink" : "border-ink/15 text-ink/50 hover:bg-cream"
          }`}
        >
          <MapPin className="h-4 w-4" /> Store Pickup
        </button>
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

        {deliveryMethod === "delivery" && (
          <Field label="District" error={errors.district?.message}>
            <select {...register("district")} className="input">
              <option value="">Select district</option>
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {deliveryMethod === "delivery" ? (
        <Field label="Full Delivery Address" error={errors.address?.message}>
          <textarea {...register("address")} rows={2} className="input" placeholder="House, road, area, city" />
        </Field>
      ) : (
        <Field label="Pickup Location" error={errors.pickupLocationId?.message}>
          <select {...register("pickupLocationId")} className="input">
            <option value="">Select a location</option>
            {pickupLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          {pickupLocations.length === 0 && (
            <p className="mt-1 text-xs text-ink/40">No pickup locations available right now.</p>
          )}
        </Field>
      )}

      <Field label="Notes (optional)">
        <textarea {...register("notes")} rows={2} className="input" placeholder="Any special instructions" />
      </Field>

      <div>
        <span className="mb-1 block text-xs font-medium text-ink/60">Coupon Code</span>
        {couponApplied ? (
          <div className="flex items-center justify-between rounded-xl bg-gold-100 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 text-gold-600 font-medium">
              <Tag className="h-3.5 w-3.5" /> {couponApplied.code} applied
            </span>
            <button type="button" onClick={() => { setCouponApplied(null); setCouponCode(""); }} className="text-ink/40 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input" placeholder="Enter code" />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={checkingCoupon}
              className="shrink-0 rounded-xl border border-ink/15 px-4 text-sm font-medium text-ink hover:bg-cream"
            >
              {checkingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
      </div>

      <div className="rounded-xl bg-cream p-4 space-y-1.5 text-sm">
        <Row label="Subtotal" value={formatBDT(subtotal)} />
        {membershipDiscount > 0 && (
          <Row label={`Bhai Brother Discount (${membershipDiscountPercent}%)`} value={`- ${formatBDT(membershipDiscount)}`} />
        )}
        {couponDiscount > 0 && <Row label="Coupon Discount" value={`- ${formatBDT(couponDiscount)}`} />}
        <Row
          label="Delivery Charge"
          value={deliveryMethod === "pickup" ? formatBDT(0) : deliveryCharge === null ? "Select district" : formatBDT(deliveryCharge)}
        />
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
