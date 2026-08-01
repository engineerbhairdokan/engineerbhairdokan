import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryPills({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categories/${c.slug}`}
          className="shrink-0 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-gold hover:bg-gold-100 transition-colors"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
