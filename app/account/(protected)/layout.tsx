import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer/auth";
import AccountTopbar from "./AccountTopbar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/account/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <AccountTopbar name={customer.name} />
      <div className="flex gap-2 mb-6 border-b border-ink/10">
        <Link href="/account" className="px-3 py-2 text-sm font-medium text-ink hover:text-gold-600">Dashboard</Link>
        <Link href="/account/orders" className="px-3 py-2 text-sm font-medium text-ink hover:text-gold-600">Order History</Link>
      </div>
      {children}
    </div>
  );
}
