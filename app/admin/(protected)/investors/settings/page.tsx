import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function InvestmentSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("investment_settings").select("*").eq("id", 1).single();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <p className="spec-readout text-xs text-gold-600">Investors</p>
        <h1 className="font-display font-bold text-2xl text-ink">Investment Settings</h1>
        <p className="text-sm text-ink/50 mt-1">
          Minimum investment, profit/loss share, payment details, and the rules & policy investors see at signup.
        </p>
      </div>
      <SettingsForm settings={data as any} />
    </div>
  );
}
