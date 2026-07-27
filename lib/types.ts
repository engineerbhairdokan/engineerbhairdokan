// Hand-written types matching schema/01-02_schema_*.sql.
// Once your Supabase project is live, replace this file by running:
//   npx supabase gen types typescript --project-id <your-project-ref> > lib/types.ts
// and re-export the pieces below from the generated Database type.

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  status: "draft" | "active" | "inactive" | "archived";
  regular_price: number;
  discount_type: "none" | "percentage" | "fixed" | "flash_sale";
  discount_value: number;
  discount_start_date: string | null;
  discount_end_date: string | null;
  current_stock: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  product_images?: ProductImage[];
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type Banner = {
  id: string;
  image_url: string;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ContactInformation = {
  business_name: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  address: string | null;
  google_map_embed: string | null;
  business_hours: Record<string, string> | null;
};

export type PlaceOrderItem = { product_id: string; quantity: number };

export type PlaceOrderResult = {
  order_id: string;
  order_number: string;
  grand_total: number;
};

// Minimal Database shape — enough for the typed Supabase client to compile.
// Extend with `supabase gen types` once the project is live.
export type Database = {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any }>;
    Views: Record<string, { Row: any }>;
    Functions: {
      place_order: {
        Args: {
          p_customer_name: string;
          p_phone: string;
          p_alt_phone: string | null;
          p_district: string;
          p_full_address: string;
          p_items: PlaceOrderItem[];
          p_notes: string | null;
        };
        Returns: PlaceOrderResult[];
      };
      quote_order_total: {
        Args: { p_district: string; p_items: PlaceOrderItem[] };
        Returns: { subtotal: number; delivery_charge: number; grand_total: number }[];
      };
    };
  };
};
