import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <p className="spec-readout text-xs text-gold-600">Error 404</p>
      <h1 className="font-display font-bold text-3xl text-ink mt-2">Page Not Found</h1>
      <p className="text-ink/60 mt-2">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-medium text-cream hover:bg-ink-700">
        Back to Home
      </Link>
    </div>
  );
}
