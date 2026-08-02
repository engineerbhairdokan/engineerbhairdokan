import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const results = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("product_images").select("image_url, sort_order").eq("product_id", id).order("sort_order"),
  ]);
  const product: any = results[0].data;
  const categories = (results[1].data ?? []) as any[];
  const images = (results[2].data ?? []) as any[];

  if (!product) notFound();

  const initial = {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id,
    shortDescription: product.short_description ?? "",
    description: product.description ?? "",
    status: product.status,
    regularPrice: product.regular_price,
    discountType: product.discount_type,
    discountValue: product.discount_value,
    discountStartDate: product.discount_start_date,
    discountEndDate: product.discount_end_date,
    purchaseCost: product.purchase_cost,
    shippingCost: product.shipping_cost,
    packagingCost: product.packaging_cost,
    packingCost: product.packing_cost,
    advertisingCost: product.advertising_cost,
    courierCost: product.courier_cost,
    otherCost: product.other_cost,
    currentStock: product.current_stock,
    lowStockThreshold: product.low_stock_threshold,
    isFeatured: product.is_featured,
    isNewArrival: product.is_new_arrival,
    imageUrls: (images ?? []).map((i) => i.image_url),
    videoUrl: product.video_url,
  };

  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <div>
      <p className="spec-readout text-xs text-gold-600">Products</p>
      <h1 className="font-display font-bold text-2xl text-ink mb-5">Edit Product</h1>
      <ProductForm categories={categories ?? []} initial={initial} onSubmit={updateProductWithId} submitLabel="Save Changes" />
    </div>
  );
}
