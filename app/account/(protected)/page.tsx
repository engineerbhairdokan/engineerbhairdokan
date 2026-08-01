import { getCurrentCustomer } from "@/lib/customer/auth";
import { createClient } from "@/lib/supabase/server";
import MembershipCard from "@/components/customer/MembershipCard";
import ApplyMembershipButton from "./ApplyMembershipButton";
import ExtendMembershipForm from "./ExtendMembershipForm";
import { formatBDT } from "@/lib/pricing";
import { Coins, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = await createClient();
  const { data: transactionsData } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const transactions = (transactionsData ?? []) as any[];

  const isExpired =
    customer.membership_status === "active" &&
    customer.membership_valid_until &&
    new Date(customer.membership_valid_until) < new Date();

  return (
    <div className="space-y-6">
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
      </div>

      {customer.membership_status === "active" && !isExpired ? (
        <div className="space-y-3">
          <MembershipCard
            cardNumber={customer.membership_card_number}
            holderName={customer.name}
            discountPercent={customer.membership_discount_percent}
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
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="font-display font-bold text-ink mb-1">Bhai Brother Membership</p>
          <p className="text-sm text-ink/60 mb-3">
            Reach 6 points to unlock automatic discounts on every order.
            {isExpired && " Your previous membership has expired — you can apply again."}
          </p>
          {customer.loyalty_points >= 6 ? (
            <ApplyMembershipButton />
          ) : (
            <p className="text-xs text-ink/40">You have {customer.loyalty_points} of 6 points needed.</p>
          )}
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
