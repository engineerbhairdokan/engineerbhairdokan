export default function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <p className="spec-readout text-xs text-gold-600">{eyebrow}</p>
        <h2 className="font-display font-bold text-2xl text-ink">{title}</h2>
      </div>
      {action && (
        <a href={action.href} className="text-sm font-medium text-ink/60 hover:text-gold-600">
          {action.label} →
        </a>
      )}
    </div>
  );
}
