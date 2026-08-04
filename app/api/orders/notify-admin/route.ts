import { NextRequest, NextResponse } from "next/server";
import { notifyAdminsOfNewOrder } from "@/lib/email/notifyAdminNewOrder";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ ok: false }, { status: 400 });
    await notifyAdminsOfNewOrder(orderId);
  } catch (err) {
    console.error("Failed to notify admins of new order", err);
  }
  return NextResponse.json({ ok: true });
}
