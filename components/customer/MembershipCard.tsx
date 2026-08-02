import { Crown, IdCard, User, CalendarCheck, CalendarClock, BadgeCheck, ShoppingCart, ShieldCheck, Truck, Lock } from "lucide-react";

type MembershipCardProps = {
  cardNumber: string | null;
  holderName: string;
  discountPercent: number;
  joinDate: string | null;
  validUntil: string | null;
  locked?: boolean;
};

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

export default function MembershipCard({
  cardNumber,
  holderName,
  discountPercent,
  joinDate,
  validUntil,
  locked,
}: MembershipCardProps) {
  return (
    <div className="relative w-full max-w-xl rounded-2xl border-4 border-ink bg-cream p-5 sm:p-6 overflow-hidden">
      {/* faint blueprint texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_20%_20%,#1B2433_1px,transparent_1px)] bg-[length:16px_16px]" />

      <div className="relative flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="font-display font-extrabold text-xl sm:text-2xl leading-none">
            <span className="text-ink">Engineer</span> <span className="text-gold-600">Bhai&apos;r</span>{" "}
            <span className="brand-dokan">Dokan</span>
          </p>
          <p className="text-[11px] font-medium text-ink/50 mt-1">
            Engineer Approved, <span className="text-gold-600">Customer Loved!</span> 😊
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Crown className="h-4 w-4 text-gold" />
            <p className="font-display font-extrabold text-lg text-ink">
              Bhai <span className="text-cream bg-ink px-1.5 rounded">Brother</span>
            </p>
          </div>
          <span className="mt-1 inline-block rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold text-ink">
            ★ MEMBERSHIP CARD ★
          </span>
        </div>
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col items-center justify-center rounded-xl bg-ink px-4 py-4 text-center">
          <p className="text-[10px] font-bold text-cream/60">GET</p>
          <p className="font-display font-extrabold text-4xl text-gold leading-none">{discountPercent}%</p>
          <p className="text-xs font-bold text-cream mt-1">DISCOUNT</p>
          <p className="text-[10px] font-medium text-gold-400">ON EVERY ORDER</p>
        </div>

        <div className="rounded-xl border-2 border-ink/80 bg-cream px-4 py-3 space-y-2">
          <DetailRow icon={IdCard} label="Membership ID" value={cardNumber ?? "BHAI-XXXX-XXXX"} />
          <DetailRow icon={User} label="Full Name" value={holderName} />
          <DetailRow icon={CalendarCheck} label="Join Date" value={fmt(joinDate)} />
          <DetailRow icon={CalendarClock} label="Expiry Date" value={fmt(validUntil)} />
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/15 pt-3 text-[10px] font-semibold text-ink/70">
        <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> ENGINEER APPROVED</span>
        <span className="flex items-center gap-1"><ShoppingCart className="h-3.5 w-3.5" /> CUSTOMER LOVED</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> QUALITY ASSURED</span>
        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> FAST DELIVERY</span>
      </div>

      <div className="relative mt-3 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 rounded-b-xl bg-ink px-5 py-2.5 text-center sm:px-6">
        <p className="text-xs text-cream/70">
          Thank you for being our{" "}
          <span className="font-display font-extrabold text-gold">BHAI BROTHER!</span> 😊
        </p>
      </div>

      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-cream/70 backdrop-blur-[1px] text-center px-6">
          <Lock className="h-6 w-6 text-ink/60" />
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-ink/40 shrink-0" />
      <div className="leading-tight">
        <p className="text-[9px] font-semibold uppercase text-ink/40">{label}</p>
        <p className="text-sm font-bold text-ink truncate">{value}</p>
      </div>
    </div>
  );
}
