import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentInvestor } from "@/lib/investor/auth";
import InvestorTopbar from "./InvestorTopbar";

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const investor = await getCurrentInvestor();

  if (!investor) {
    redirect("/invest/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <InvestorTopbar name={investor.name} balance={investor.balance} status={investor.status} />
      <div className="flex gap-2 mb-6 border-b border-ink/10 overflow-x-auto">
        <Link href="/invest" className="px-3 py-2 text-sm font-medium text-ink hover:text-gold-600 whitespace-nowrap">Dashboard</Link>
        <Link href="/invest/deposit" className="px-3 py-2 text-sm font-medium text-ink hover:text-gold-600 whitespace-nowrap">Deposit</Link>
        <Link href="/invest/invest" className="px-3 py-2 text-sm font-medium text-ink hover:text-gold-600 whitespace-nowrap">Invest in a Product</Link>
      </div>
      {children}
    </div>
  );
}
