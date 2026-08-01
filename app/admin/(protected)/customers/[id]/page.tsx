import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";
import { Phone, Mail, Award, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const TERMINAL_STATUSES = ["delivered", "returned", "cancelled"];

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [customerResult, ordersResult] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase
      .from("orders")
      .select("id, order_number, status, order_source, grand_total, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const customer: any = customerResult.data;
  const orders = (ordersResult.data ?? []) as any[];

  if (!customer) notFound();

  const totalOrders = orders.length;
  const runningOrders = orders.filter((o) => !TERMINAL_STATUSES.includes(o.status));
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All Customers
      </Link>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">{customer.name}</h1>
          <div className="mt-2 space-y-1 text-sm text-ink/60">
            <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {customer.phone}</p>
            {customer.email && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {customer.email}</p>}
          </div>
          {customer.membership_status !== "none" && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-medium capitalize text-gold-600">
              <Award className="h-3.5 w-3.5" />
              {customer.membership_status} member
              {customer.membership_discount_percent ? ` · ${customer.membership_discount_percent}% discount` : ""}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-ink/40">Loyalty Points</p>
          <p className="font-display font-bold text-xl text-ink">{customer.loyalty_points}</p>
          {customer.membership_card_number && (
            <p className="mt-1 font-mono text-[10px] text-ink/40">Card: {customer.membership_card_number}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Orders" value={totalOrders.toLocaleString("en-BD")} />
        <StatCard
          label="Running Orders"
          value={runningOrders.length.toLocaleString("en-BD")}
          highlight={runningOrders.length > 0}
        />
        <StatCard label="Total Purchase" value={formatBDT(totalSpent)} />
      </div>

      {totalOrders > 0 && (
        <p className="text-xs text-ink/40">Average order value: {formatBDT(avgOrderValue)}</p>
      )}

      <div>
        <h2 className="font-display font-bold text-ink mb-3">Order History</h2>
        <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink/5 hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:text-gold-600">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink/70">{o.order_source?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 font-medium text-ink">{formatBDT(o.grand_total)}</td>
                  <td className="px-4 py-3 text-ink/50">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-amber-300 bg-amber-50" : "border-ink/10 bg-white"}`}>
      <p className="spec-readout text-[10px] text-ink/40">{label}</p>
      <p className="font-display font-bold text-xl text-ink mt-1">{value}</p>
    </div>
  );
}
