import { getCurrentCustomer } from "@/lib/customer/auth";
import { createClient } from "@/lib/supabase/server";
import MembershipCard from "@/components/customer/MembershipCard";
import ApplyMembershipButton from "./ApplyMembershipButton";
import ExtendMembershipForm from "./ExtendMembershipForm";
import CreateCouponForm from "./CreateCouponForm";
import { formatBDT } from "@/lib/pricing";
import { Coins, Clock, PiggyBank, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = await createClient();
  const [{ data: transactionsData }, { data: pendingOrdersData }, { data: deliveredOrdersData }, { data: myCouponsData }] = await Promise.all([
    supabase
      .from("point_transactions")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("orders")
      .select("grand_total")
      .eq("customer_id", customer.id)
      .not("status", "in", "(delivered,cancelled,returned)"),
    supabase
      .from("orders")
      .select("discount_amount")
      .eq("customer_id", customer.id)
      .eq("status", "delivered"),
    supabase
      .from("coupons")
      .select("code, discount_value, times_used, max_uses, valid_until, is_active")
      .eq("created_by_customer_id", customer.id)
      .order("created_at", { ascending: false }),
  ]);
  const transactions = (transactionsData ?? []) as any[];
  const myCoupons = (myCouponsData ?? []) as any[];
  const totalSaved = ((deliveredOrdersData ?? []) as any[]).reduce(
    (sum, o) => sum + (Number(o.discount_amount) || 0),
    0
  );
  const pendingPoints = ((pendingOrdersData ?? []) as any[]).reduce(
    (sum, o) => sum + Math.floor(Number(o.grand_total) / 100),
    0
  );

  const isExpired =
    customer.membership_status === "active" &&
    customer.membership_valid_until &&
    new Date(customer.membership_valid_until) < new Date();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="spec-readout text-[10px] text-ink/40">Available Balance</p>
              <p className="font-display font-bold text-3xl text-ink flex items-center gap-2">
                <Coins className="h-6 w-6 text-gold-600" />
                {customer.loyalty_points} <span className="text-base font-medium text-ink/50">points</span>
              </p>
            </div>
            <p className="text-xs text-ink/40 text-right">Earn 1 point per ৳100 spent<br />on delivered orders</p>
          </div>
          {pendingPoints > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-bold">+{pendingPoints} points</span> pending — will be added after delivery
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5 flex flex-col justify-center">
          <p className="spec-readout text-[10px] text-ink/40 flex items-center gap-1.5">
            <PiggyBank className="h-3.5 w-3.5" /> Total Saved
          </p>
          <p className="font-display font-bold text-3xl text-emerald-600">{formatBDT(totalSaved)}</p>
          <p className="text-xs text-ink/40 mt-1">From membership discounts &amp; coupons on delivered orders</p>
        </div>
      </div>

      {customer.membership_status === "active" && !isExpired ? (
        <div className="space-y-3">
          <MembershipCard
            cardNumber={customer.membership_card_number}
            holderName={customer.name}
            discountPercent={customer.membership_discount_percent}
            joinDate={customer.membership_started_at}
            validUntil={customer.membership_valid_until}
          />
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs font-medium text-ink/60 mb-2">Extend your membership using points (1 point = 1 month)</p>
            <ExtendMembershipForm availablePoints={customer.loyalty_points} />
          </div>
        </div>
      ) : customer.membership_status === "pending" ? (
        <div className="rounded-2xl border border-gold bg-gold-100 p-5 flex items-center gap-3">
          <Clock className="h-5 w-5 text-gold-600 shrink-0" />
          <div>
            <p className="font-display font-bold text-ink">Application Pending</p>
            <p className="text-sm text-ink/60">We&apos;ll review your Bhai Brother membership application shortly.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <div className="pointer-events-none select-none opacity-50 grayscale">
              <MembershipCard
                cardNumber="BHAI-XXXX-XXXX"
                holderName="Your Full Name"
                discountPercent={5}
                joinDate={null}
                validUntil={null}
                locked
              />
            </div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-4 text-center">
            <p className="font-display font-bold text-ink mb-1">Unlock Your Bhai Brother Card</p>
            <p className="text-sm text-ink/60 mb-3">
              Reach 6 points to unlock automatic discounts on every order.
              {isExpired && " Your previous membership has expired — you can apply again."}
            </p>
            {customer.loyalty_points >= 6 ? (
              <ApplyMembershipButton />
            ) : (
              <p className="text-xs text-ink/50 font-medium">You have {customer.loyalty_points} of 6 points needed.</p>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="font-display font-bold text-ink mb-3 flex items-center gap-1.5">
          <Ticket className="h-4 w-4 text-gold-600" /> Create Your Own Coupon
        </p>
        <CreateCouponForm availablePoints={customer.loyalty_points} />
      </div>

      {myCoupons.length > 0 && (
        <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-ink/10">
            <p className="font-display font-bold text-ink">My Coupons</p>
          </div>
          <div className="divide-y divide-ink/5">
            {myCoupons.map((c) => {
              const used = c.times_used >= (c.max_uses ?? 1);
              const expired = c.valid_until && new Date(c.valid_until) < new Date();
              return (
                <div key={c.code} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-mono font-semibold text-ink">{c.code}</p>
                    <p className="text-xs text-ink/40">
                      {c.discount_value}% off · valid until {c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-GB") : "—"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    used ? "bg-ink/10 text-ink/40" : expired ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {used ? "Used" : expired ? "Expired" : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-ink/10">
          <p className="font-display font-bold text-ink">Points History</p>
        </div>
        <div className="divide-y divide-ink/5">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="text-ink">{t.note ?? t.reason.replace(/_/g, " ")}</p>
                <p className="text-xs text-ink/40">{new Date(t.created_at).toLocaleDateString("en-GB")}</p>
              </div>
              <span className={`font-medium ${t.points_change > 0 ? "text-green-700" : "text-red-600"}`}>
                {t.points_change > 0 ? "+" : ""}{t.points_change}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink/40">No points activity yet — place an order to start earning.</p>
          )}
        </div>
      </div>
    </div>
  );
}
