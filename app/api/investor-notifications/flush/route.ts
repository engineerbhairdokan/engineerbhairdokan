import { NextResponse } from "next/server";
import { flushInvestorNotificationEmails } from "@/lib/email/flushInvestorNotifications";

export async function POST() {
  try {
    await flushInvestorNotificationEmails();
  } catch (err) {
    // Never fail the caller's flow over an email hiccup — just log server-side.
    console.error("Failed to flush investor notification emails", err);
  }
  return NextResponse.json({ ok: true });
}
