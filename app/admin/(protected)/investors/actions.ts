"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { flushInvestorNotificationEmails } from "@/lib/email/flushInvestorNotifications";

export async function reviewDeposit(id: string, status: "approved" | "rejected", adminNote?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("admin_users").select("id").eq("auth_user_id", user!.id).single();

  const { error } = await supabase
    .from("investor_deposits")
    .update({ status, admin_note: adminNote || null, reviewed_by: (admin as any)?.id, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/investors/deposits");
  revalidatePath("/admin/investors");
  flushInvestorNotificationEmails().catch((e) => console.error("Email flush failed", e));
  return { success: true };
}

export async function resolveWithdrawal(id: string, status: "approved" | "rejected" | "paid", adminNote?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("admin_users").select("id").eq("auth_user_id", user!.id).single();

  const { error } = await supabase
    .from("investor_withdrawal_requests")
    .update({ status, admin_note: adminNote || null, resolved_by: (admin as any)?.id, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/investors/withdrawals");
  revalidatePath("/admin/investors");
  flushInvestorNotificationEmails().catch((e) => console.error("Email flush failed", e));
  return { success: true };
}

export async function updateInvestmentSettings(input: {
  minInvestmentAmount: number;
  defaultProfitPercent: number;
  defaultLossPercent: number;
  policyText: string;
  dealInstructionsText: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankRoutingNumber: string;
  bkashNumber: string;
  nagadNumber: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("investment_settings")
    .update({
      min_investment_amount: input.minInvestmentAmount,
      default_profit_percent: input.defaultProfitPercent,
      default_loss_percent: input.defaultLossPercent,
      policy_text: input.policyText,
      deal_instructions_text: input.dealInstructionsText,
      bank_name: input.bankName || null,
      bank_account_name: input.bankAccountName || null,
      bank_account_number: input.bankAccountNumber || null,
      bank_branch: input.bankBranch || null,
      bank_routing_number: input.bankRoutingNumber || null,
      bkash_number: input.bkashNumber || null,
      nagad_number: input.nagadNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  revalidatePath("/admin/investors/settings");
  return { success: true };
}

export async function adjustInvestorBalance(investorId: string, amount: number, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("admin_users").select("id").eq("auth_user_id", user!.id).single();

  const { error } = await supabase.from("investor_ledger").insert({
    investor_id: investorId,
    entry_type: "adjustment",
    amount,
    note,
    created_by: (admin as any)?.id,
  });

  if (error) return { error: error.message };

  await supabase.from("investor_notifications").insert({
    investor_id: investorId,
    title: "Balance Adjusted",
    body: `An adjustment of ${amount} was made to your balance: ${note}`,
    notif_type: "adjustment",
  });

  revalidatePath(`/admin/investors/${investorId}`);
  return { success: true };
}

export async function retryFailedInvestorEmails() {
  await flushInvestorNotificationEmails(50);
  revalidatePath("/admin/investors");
  return { success: true };
}

export async function approveInvestor(investorId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_approve_investor", { p_investor_id: investorId });
  if (error) return { error: error.message };
  revalidatePath("/admin/investors");
  revalidatePath(`/admin/investors/${investorId}`);
  flushInvestorNotificationEmails().catch((e) => console.error("Email flush failed", e));
  return { success: true };
}

export async function recordInvestment(input: {
  investorId: string;
  productId: string;
  amount: number;
  note?: string;
  profitPercent?: number;
  lossPercent?: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_record_investment", {
    p_investor_id: input.investorId,
    p_product_id: input.productId,
    p_amount: input.amount,
    p_note: input.note || null,
    p_profit_percent: input.profitPercent ?? null,
    p_loss_percent: input.lossPercent ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/investors/${input.investorId}`);
  flushInvestorNotificationEmails().catch((e) => console.error("Email flush failed", e));
  return { success: true };
}

export async function getSignedInvestorDocUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("investor-documents").createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function updateSampleClaimStatus(claimId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("investor_sample_claims").update({ status }).eq("id", claimId);
  if (error) return { error: error.message };
  revalidatePath("/admin/investors/samples");
  flushInvestorNotificationEmails().catch((e) => console.error("Email flush failed", e));
  return { success: true };
}

export async function toggleInvestorStatus(investorId: string, status: "active" | "suspended") {
  const supabase = await createClient();
  await supabase.from("investors").update({ status }).eq("id", investorId);
  revalidatePath(`/admin/investors/${investorId}`);
  revalidatePath("/admin/investors");
}

export async function getSignedDepositScreenshotUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("investor-deposits").createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}
