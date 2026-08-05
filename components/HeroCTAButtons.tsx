import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";

export default function HeroCTAButtons({ whatsapp }: { whatsapp: string | null }) {
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : null;

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 -mt-3 sm:-mt-2">
      <Link
        href="/products"
        className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-ink px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-display font-bold text-cream hover:bg-ink-700 transition-colors"
      >
        <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Shop All Products
      </Link>

      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-display font-bold text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Contact Us
        </a>
      ) : (
        <Link
          href="/#contact"
          className="flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-display font-bold text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Contact Us
        </Link>
      )}
    </div>
  );
}
