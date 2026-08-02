"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/lib/cart/CartContext";
import { createClient } from "@/lib/supabase/client";
import { BANGLADESH_DISTRICTS } from "@/lib/districts";
import { formatBDT } from "@/lib/pricing";
import { Loader2, Minus, Plus, Trash2, CheckCircle2, Tag, X, MapPin, Truck, Award } from "lucide-react";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
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

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [insideDhaka, setInsideDhaka] = useState(70);
  const [outsideDhaka, setOutsideDhaka] = useState(130);
  const [loadedSettings, setLoadedSettings] = useState(false);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryMethod: "delivery" },
  });
  const district = watch("district");
  const deliveryMethod = watch("deliveryMethod");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("pickup_locations").select("id, name, address, phone").eq("is_active", true).order("name");
      setPickupLocations((data as unknown as PickupLocation[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("delivery_settings").select("*").eq("id", 1).single();
      const d = data as any;
      if (d) {
        setInsideDhaka(d.inside_dhaka_charge);
        setOutsideDhaka(d.outside_dhaka_charge);
      }
      setLoadedSettings(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (!user) return;

      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, phone, email")
        .eq("auth_user_id", user.id)
        .single();
      if (!customer) return;

      setValue("name", (customer as any).name ?? "");
      setValue("phone", (customer as any).phone ?? "");
      setCustomerEmail((customer as any).email ?? null);

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
    return district === "Dhaka" ? insideDhaka : outsideDhaka;
  }, [deliveryMethod, district, insideDhaka, outsideDhaka]);

  const discount = couponApplied?.discount ?? 0;
  const grandTotal = subtotal - discount + (deliveryCharge ?? 0);

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
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
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
    clearCart();

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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold-600" />
        <p className="font-display font-bold text-2xl text-ink mt-4">Order Confirmed!</p>
        <p className="text-ink/60 mt-2">
          Order <span className="font-mono font-semibold">{state.orderNumber}</span> — Cash on Delivery,{" "}
          {formatBDT(state.grandTotal)} due on arrival.
        </p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-medium text-cream hover:bg-ink-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display font-bold text-xl text-ink">Your cart is empty</p>
        <p className="text-ink/50 mt-1">Add some products to get started.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-medium text-cream hover:bg-ink-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="spec-readout text-xs text-gold-600">Checkout</p>
      <h1 className="font-display font-bold text-2xl text-ink mb-6">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-4">
              <div className="relative h-20 w-20 shrink-0 rounded-xl bg-cream overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-ink/30">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="text-sm font-medium text-ink hover:text-gold-600 line-clamp-2">
                  {item.name}
                </Link>
                <p className="font-display font-bold text-ink mt-1">{formatBDT(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-ink/15 hover:bg-cream"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-ink/15 hover:bg-cream disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button onClick={() => removeItem(item.productId)} className="ml-2 text-red-600 text-xs flex items-center gap-1 hover:underline">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
              <p className="font-display font-bold text-ink shrink-0">{formatBDT(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-ink/10 bg-white p-5 space-y-3">
            {isLoggedIn === false && (
              <a
                href="/account/register"
                className="flex items-center gap-2 rounded-xl bg-gold-100 border border-gold px-3 py-2.5 text-xs font-medium text-ink hover:bg-gold-200 transition-colors"
              >
                <Award className="h-4 w-4 text-gold-600 shrink-0" />
                Sign up and order to earn reward points, claim your Bhai Brother Membership Card, and create your own discount coupons!
              </a>
            )}
            <p className="spec-readout text-xs text-gold-600">Delivery Details</p>

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

            <Field label="Full Name" error={errors.name?.message}>
              <input {...register("name")} className="input" />
            </Field>
            <Field label="Mobile Number" error={errors.phone?.message}>
              <input {...register("phone")} className="input" placeholder="01XXXXXXXXX" inputMode="numeric" />
            </Field>
            <Field label="Alternative Phone (optional)">
              <input {...register("altPhone")} className="input" />
            </Field>
            {deliveryMethod === "delivery" ? (
              <>
                <Field label="District" error={errors.district?.message}>
                  <select {...register("district")} className="input">
                    <option value="">Select district</option>
                    {BANGLADESH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Full Delivery Address" error={errors.address?.message}>
                  <textarea {...register("address")} rows={2} className="input" />
                </Field>
              </>
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
              <textarea {...register("notes")} rows={2} className="input" />
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
              {discount > 0 && <Row label="Discount" value={`- ${formatBDT(discount)}`} />}
              <Row label="Delivery Charge" value={deliveryMethod === "pickup" ? formatBDT(0) : deliveryCharge === null ? "Select district" : formatBDT(deliveryCharge)} />
              <div className="border-t border-ink/10 pt-1.5 mt-1.5">
                <Row label="Grand Total" value={formatBDT(grandTotal)} bold />
              </div>
            </div>

            {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

            <button
              type="submit"
              disabled={state.status === "submitting"}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
            >
              {state.status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
              Place Order — Cash on Delivery
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.55rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
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
