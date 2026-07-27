import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

const STATUSES = ["pending","confirmed","processing","packed","handed_to_courier","in_transit","delivered","returned","cancelled"];
const SOURCES = ["website","facebook","messenger","whatsapp","phone_call","walk_in"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; q?: string }>;
}) {
  const { status, source, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, status, order_source, grand_total, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("order_source", source);
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);

  const { data: orders } = await query;

  const filterLink = (params: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    const merged = { status, source, q, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) usp.set(k, v); });
    return `/admin/orders?${usp.toString()}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="spec-readout text-xs text-gold-600">Sales</p>
          <h1 className="font-display font-bold text-2xl text-ink">Orders</h1>
        </div>
        <form action="/admin/orders" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          {source && <input type="hidden" name="source" value={source} />}
          <input name="q" defaultValue={q} placeholder="Search order#, name, phone" className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm" />
        </form>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={filterLink({ status: undefined })} className={`rounded-full px-3 py-1.5 ${!status ? "bg-ink text-cream" : "bg-white border border-ink/15"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={filterLink({ status: s })} className={`rounded-full px-3 py-1.5 capitalize ${status === s ? "bg-ink text-cream" : "bg-white border border-ink/15"}`}>
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={filterLink({ source: undefined })} className={`rounded-full px-3 py-1.5 ${!source ? "bg-ink text-cream" : "bg-white border border-ink/15"}`}>All Sources</Link>
        {SOURCES.map((s) => (
          <Link key={s} href={filterLink({ source: s })} className={`rounded-full px-3 py-1.5 capitalize ${source === s ? "bg-ink text-cream" : "bg-white border border-ink/15"}`}>
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-ink/5 hover:bg-cream/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:text-gold-600">{o.order_number}</Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-ink">{o.customer_name}</p>
                  <p className="text-ink/40 text-xs">{o.customer_phone}</p>
                </td>
                <td className="px-4 py-3 capitalize text-ink/70">{o.order_source.replace(/_/g, " ")}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 font-medium text-ink">{formatBDT(o.grand_total)}</td>
                <td className="px-4 py-3 text-ink/50">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/40">No orders match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
