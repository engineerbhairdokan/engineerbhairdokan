import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";

export default function HeroCTAButtons({ whatsapp }: { whatsapp: string | null }) {
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : null;

  return (
    <div className="flex flex-wrap gap-3 -mt-2">
      <Link
        href="/products"
        className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display font-bold text-cream hover:bg-ink-700 transition-colors"
      >
        <ShoppingBag className="h-4 w-4" />
        Shop All Products
      </Link>

      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-display font-bold text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contact Us
        </a>
      ) : (
        <Link
          href="/#contact"
          className="flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-display font-bold text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contact Us
        </Link>
      )}
    </div>
  );
}
