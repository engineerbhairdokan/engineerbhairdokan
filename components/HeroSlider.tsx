"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/types";

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = prefersReduced ? null : setInterval(() => emblaApi.scrollNext(), 6000);
    return () => {
      if (id) clearInterval(id);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (banners.length === 0) {
    return (
      <div className="relative aspect-[3/1] rounded-2xl overflow-hidden bg-cream">
        <Image src="/banner.png" alt="Engineer Bhai'r Dokan" fill className="object-contain" priority />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="relative min-w-0 flex-[0_0_100%] aspect-[3/1] bg-cream">
              {b.link_url ? (
                <Link href={b.link_url}>
                  <Image src={b.image_url} alt={b.title ?? "Banner"} fill className="object-contain" priority />
                </Link>
              ) : (
                <Image src={b.image_url} alt={b.title ?? "Banner"} fill className="object-contain" priority />
              )}
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream hover:bg-ink"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream hover:bg-ink"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === selected ? "w-6 bg-gold" : "w-1.5 bg-cream/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
