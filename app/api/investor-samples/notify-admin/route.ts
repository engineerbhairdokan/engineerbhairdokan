import { NextRequest, NextResponse } from "next/server";
import { notifyAdminsOfSampleClaim } from "@/lib/email/notifyAdminNewOrder";

export async function POST(req: NextRequest) {
  try {
    const { claimId } = await req.json();
    if (!claimId) return NextResponse.json({ ok: false }, { status: 400 });
    await notifyAdminsOfSampleClaim(claimId);
  } catch (err) {
    console.error("Failed to notify admins of sample claim", err);
  }
  return NextResponse.json({ ok: true });
}
