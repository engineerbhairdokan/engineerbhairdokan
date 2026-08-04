import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function InvestorSiteHeader({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl: string | null;
}) {
  return (
    <header className="sticky top-0 z-50 bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/invest" className="flex items-center gap-2 min-w-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} width={32} height={32} className="rounded-md object-contain shrink-0" />
          ) : (
            <TrendingUp className="h-6 w-6 text-gold shrink-0" />
          )}
          <span className="font-display text-base sm:text-lg font-bold truncate">
            {businessName} <span className="text-gold-400 font-medium">— Investor Portal</span>
          </span>
        </Link>
        <Link href="/" className="text-xs text-cream/60 hover:text-gold shrink-0">
          Back to store
        </Link>
      </div>
    </header>
  );
}
