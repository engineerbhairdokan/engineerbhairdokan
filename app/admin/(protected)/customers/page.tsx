import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";

const TERMINAL_STATUSES = ["delivered", "returned", "cancelled"];

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  loyalty_points: number;
  membership_status: string;
  created_at?: string;
};

type OrderRow = {
  customer_id: string | null;
  status: string;
  grand_total: number;
  created_at: string;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let customerQuery = supabase
    .from("customers")
    .select("id, name, phone, email, loyalty_points, membership_status, created_at")
    .order("created_at", { ascending: false });

  if (q) {
    customerQuery = customerQuery.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const [customersResult, ordersResult] = await Promise.all([
    customerQuery,
    supabase.from("orders").select("customer_id, status, grand_total, created_at").not("customer_id", "is", null),
  ]);

  const customers = (customersResult.data ?? []) as CustomerRow[];
  const orders = (ordersResult.data ?? []) as OrderRow[];

  const statsByCustomer = new Map<
    string,
    { totalOrders: number; runningOrders: number; totalSpent: number; lastOrderAt: string | null }
  >();

  for (const o of orders) {
    if (!o.customer_id) continue;
    const existing = statsByCustomer.get(o.customer_id) ?? {
      totalOrders: 0,
      runningOrders: 0,
      totalSpent: 0,
      lastOrderAt: null,
    };
    existing.totalOrders += 1;
    if (!TERMINAL_STATUSES.includes(o.status)) existing.runningOrders += 1;
    if (o.status !== "cancelled") existing.totalSpent += Number(o.grand_total) || 0;
    if (!existing.lastOrderAt || o.created_at > existing.lastOrderAt) existing.lastOrderAt = o.created_at;
    statsByCustomer.set(o.customer_id, existing);
  }

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + (statsByCustomer.get(c.id)?.totalSpent ?? 0), 0);
  const totalRunning = customers.reduce((sum, c) => sum + (statsByCustomer.get(c.id)?.runningOrders ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="spec-readout text-xs text-gold-600">People</p>
          <h1 className="font-display font-bold text-2xl text-ink">Customers</h1>
        </div>
        <form action="/admin/customers" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, email"
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm w-64"
          />
        </form>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Customers" value={totalCustomers.toLocaleString("en-BD")} />
        <StatCard label="Running Orders" value={totalRunning.toLocaleString("en-BD")} />
        <StatCard label="Lifetime Revenue" value={formatBDT(totalRevenue)} />
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Membership</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Running</th>
              <th className="px-4 py-3">Total Purchase</th>
              <th className="px-4 py-3">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const stats = statsByCustomer.get(c.id);
              return (
                <tr key={c.id} className="border-t border-ink/5 hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-ink hover:text-gold-600">
                      {c.name}
                    </Link>
                    <p className="text-ink/40 text-xs">{c.phone}{c.email ? ` · ${c.email}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.membership_status !== "none" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gold-600">
                        <Award className="h-3 w-3" /> {c.membership_status}
                      </span>
                    ) : (
                      <span className="text-ink/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{stats?.totalOrders ?? 0}</td>
                  <td className="px-4 py-3">
                    {stats?.runningOrders ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        {stats.runningOrders} running
                      </span>
                    ) : (
                      <span className="text-ink/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{formatBDT(stats?.totalSpent ?? 0)}</td>
                  <td className="px-4 py-3 text-ink/50">
                    {stats?.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleDateString("en-GB") : "—"}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/40">
                  {q ? "No customers match your search." : "No registered customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="spec-readout text-[10px] text-ink/40">{label}</p>
      <p className="font-display font-bold text-xl text-ink mt-1">{value}</p>
    </div>
  );
}
