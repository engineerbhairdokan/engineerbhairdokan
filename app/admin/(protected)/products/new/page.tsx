import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name");
  const categories = (categoriesData ?? []) as any[];

  return (
    <div>
      <p className="spec-readout text-xs text-gold-600">Products</p>
      <h1 className="font-display font-bold text-2xl text-ink mb-5">Add Product</h1>
      <ProductForm categories={categories ?? []} onSubmit={createProduct} submitLabel="Create Product" />
    </div>
  );
}
