import { createClient } from "@/lib/supabase/server";
import ContactInfoForm from "./ContactInfoForm";
import DeliverySettingsForm from "./DeliverySettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const results = await Promise.all([
    supabase.from("contact_information").select("*").eq("id", 1).single(),
    supabase.from("delivery_settings").select("*").eq("id", 1).single(),
  ]);
  const contact: any = results[0].data;
  const delivery: any = results[1].data;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Configuration</p>
        <h1 className="font-display font-bold text-2xl text-ink">Settings</h1>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <h2 className="font-display font-bold text-ink mb-4">Delivery Charges</h2>
        <DeliverySettingsForm initial={{ insideDhaka: delivery?.inside_dhaka_charge ?? 70, outsideDhaka: delivery?.outside_dhaka_charge ?? 130 }} />
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <h2 className="font-display font-bold text-ink mb-4">Contact Information</h2>
        <ContactInfoForm
          initial={{
            businessName: contact?.business_name ?? "",
            logoUrl: contact?.logo_url ?? "",
            phone: contact?.phone ?? "",
            whatsapp: contact?.whatsapp ?? "",
            email: contact?.email ?? "",
            website: contact?.website ?? "",
            facebook: contact?.facebook ?? "",
            instagram: contact?.instagram ?? "",
            youtube: contact?.youtube ?? "",
            address: contact?.address ?? "",
            googleMapEmbed: contact?.google_map_embed ?? "",
          }}
        />
      </div>
    </div>
  );
}
