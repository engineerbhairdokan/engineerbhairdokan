import { CreditCard } from "lucide-react";

export default function MembershipCard({
  cardNumber,
  holderName,
  discountPercent,
  validUntil,
}: {
  cardNumber: string | null;
  holderName: string;
  discountPercent: number;
  validUntil: string | null;
}) {
  return (
    <div className="relative aspect-[1.586/1] w-full max-w-sm rounded-2xl bg-gradient-to-br from-ink to-ink-700 p-6 text-cream shadow-lg overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/10" />
      <div className="absolute -right-4 top-16 h-20 w-20 rounded-full bg-gold/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-display font-bold text-sm">
            <span className="text-cream">Engineer</span> <span className="text-gold">Bhai&apos;r</span>
          </p>
          <p className="spec-readout text-[9px] text-cream/50 mt-0.5">Bhai Brother Membership</p>
        </div>
        <CreditCard className="h-6 w-6 text-gold" />
      </div>

      <p className="relative font-mono text-lg tracking-widest mt-8">
        {cardNumber ?? "•••• •••• ••••"}
      </p>

      <div className="relative flex items-end justify-between mt-6">
        <div>
          <p className="spec-readout text-[8px] text-cream/40">Card Holder</p>
          <p className="text-sm font-medium uppercase">{holderName}</p>
        </div>
        <div className="text-right">
          <p className="spec-readout text-[8px] text-cream/40">Valid Until</p>
          <p className="text-sm font-medium">
            {validUntil ? new Date(validUntil).toLocaleDateString("en-GB", { month: "2-digit", year: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      <span className="absolute bottom-4 left-6 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-ink">
        {discountPercent}% OFF every order
      </span>
    </div>
  );
}
