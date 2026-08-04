import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { getCurrentInvestor } from "@/lib/investor/auth";
import InvestorTopbar from "./InvestorTopbar";
import InvestorNav from "./InvestorNav";

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const investor = await getCurrentInvestor();

  if (!investor) {
    redirect("/invest/login");
  }

  if (investor.status === "pending_approval") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <p className="font-display font-bold text-xl text-ink">Account Pending Approval</p>
        <p className="text-sm text-ink/60 mt-2">
          Thanks for signing up, {investor.name}. Your account is being reviewed by our team — you&apos;ll
          get an email once it&apos;s approved and your dashboard is unlocked.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <InvestorTopbar name={investor.name} balance={investor.balance} status={investor.status} />
      <InvestorNav />
      {children}
    </div>
  );
}
