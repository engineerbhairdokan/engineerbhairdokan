import { createClient } from "@/lib/supabase/server";
import type { Category, ContactInformation, Product, Banner } from "@/lib/types";

const PRODUCT_SELECT = `
  id, sku, name, slug, category_id, short_description, description, status,
  regular_price, discount_type, discount_value, discount_start_date, discount_end_date,
  current_stock, low_stock_threshold, is_featured, is_new_arrival,
  product_images ( id, product_id, image_url, sort_order, is_primary ),
  categories:category_id ( id, name, slug )
`;

export async function getContactInfo(): Promise<ContactInformation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("contact_information").select("*").eq("id", 1).single();
  return data as unknown as ContactInformation | null;
}

export async function getDeliverySettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("delivery_settings").select("*").eq("id", 1).single();
  return data as unknown as { inside_dhaka_charge: number; outside_dhaka_charge: number } | null;
}

export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as unknown as Banner[]) ?? [];
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as unknown as Category[]) ?? [];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .limit(limit);
  return (data as unknown as Product[]) ?? [];
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Product[]) ?? [];
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  // best_selling_products view is ordered by units_sold already
  const { data: rankedData } = await supabase
    .from("best_selling_products")
    .select("product_id")
    .limit(limit);
  const ranked = (rankedData ?? []) as any[];

  const ids = ranked.map((r) => r.product_id);
  if (ids.length === 0) return [];

  const { data } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids).eq("status", "active");
  return (data as unknown as Product[]) ?? [];
}

export async function getProducts(opts: {
  search?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "price_asc" | "price_desc";
}): Promise<{ products: Product[]; total: number }> {
  const { search, categorySlug, page = 1, pageSize = 12, sort = "newest" } = opts;
  const supabase = await createClient();

  let query = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" }).eq("status", "active");

  if (search) query = query.ilike("name", `%${search}%`);
  if (categorySlug) {
    const { data: catData } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    const cat: any = catData;
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (sort === "price_asc") query = query.order("regular_price", { ascending: true });
  else if (sort === "price_desc") query = query.order("regular_price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const { data, count } = await query.range(from, from + pageSize - 1);

  return { products: (data as unknown as Product[]) ?? [], total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("status", "active").single();
  return (data as unknown as Product) ?? null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).eq("is_active", true).single();
  return (data as unknown as Category) ?? null;
}
