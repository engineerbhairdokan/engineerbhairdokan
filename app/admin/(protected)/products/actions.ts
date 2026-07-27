"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProductFormInput = {
  sku: string;
  name: string;
  slug: string;
  categoryId: string | null;
  shortDescription: string;
  description: string;
  status: "draft" | "active" | "inactive" | "archived";
  regularPrice: number;
  discountType: "none" | "percentage" | "fixed" | "flash_sale";
  discountValue: number;
  discountStartDate: string | null;
  discountEndDate: string | null;
  purchaseCost: number;
  shippingCost: number;
  packagingCost: number;
  packingCost: number;
  advertisingCost: number;
  courierCost: number;
  otherCost: number;
  currentStock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  imageUrls: string[];
};

function toRow(input: ProductFormInput) {
  return {
    sku: input.sku,
    name: input.name,
    slug: input.slug,
    category_id: input.categoryId,
    short_description: input.shortDescription || null,
    description: input.description || null,
    status: input.status,
    regular_price: input.regularPrice,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    discount_start_date: input.discountStartDate,
    discount_end_date: input.discountEndDate,
    purchase_cost: input.purchaseCost,
    shipping_cost: input.shippingCost,
    packaging_cost: input.packagingCost,
    packing_cost: input.packingCost,
    advertising_cost: input.advertisingCost,
    courier_cost: input.courierCost,
    other_cost: input.otherCost,
    current_stock: input.currentStock,
    low_stock_threshold: input.lowStockThreshold,
    is_featured: input.isFeatured,
    is_new_arrival: input.isNewArrival,
  };
}

export async function createProduct(input: ProductFormInput) {
  const supabase = await createClient();

  const { data: product, error } = await supabase.from("products").insert(toRow(input)).select("id").single();
  if (error) return { error: error.message };

  if (input.imageUrls.length > 0) {
    await supabase.from("product_images").insert(
      input.imageUrls.map((url, i) => ({
        product_id: product.id,
        image_url: url,
        sort_order: i,
        is_primary: i === 0,
      }))
    );
  }

  // Record the starting stock as an initial_stock movement for a clean audit trail
  if (input.currentStock > 0) {
    await supabase.from("stock_history").insert({
      product_id: product.id,
      change_type: "initial_stock",
      quantity_change: input.currentStock,
      stock_after: input.currentStock,
      note: "Initial stock on product creation",
    });
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, input: ProductFormInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").update(toRow(input)).eq("id", id);
  if (error) return { error: error.message };

  // Replace image list wholesale — simplest correct behaviour for this form
  await supabase.from("product_images").delete().eq("product_id", id);
  if (input.imageUrls.length > 0) {
    await supabase.from("product_images").insert(
      input.imageUrls.map((url, i) => ({
        product_id: id,
        image_url: url,
        sort_order: i,
        is_primary: i === 0,
      }))
    );
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}

export async function adjustStock(productId: string, delta: number, note: string) {
  const supabase = await createClient();

  const { data: product } = await supabase.from("products").select("current_stock").eq("id", productId).single();
  if (!product) return { error: "Product not found" };

  const newStock = product.current_stock + delta;
  if (newStock < 0) return { error: "Stock cannot go below zero" };

  const { error: updateError } = await supabase.from("products").update({ current_stock: newStock }).eq("id", productId);
  if (updateError) return { error: updateError.message };

  await supabase.from("stock_history").insert({
    product_id: productId,
    change_type: "manual_adjustment",
    quantity_change: delta,
    stock_after: newStock,
    note,
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true };
}
