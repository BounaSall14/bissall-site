import { airtableList, airtableGet } from "@/lib/airtable";
import { sendOrderConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

// One-shot endpoint: re-sends Brevo confirmation to all "Payé" commandes
// that have a Stripe payment ID (= placed via the new checkout flow).
//
// Protected by CRON_SECRET (same as /api/send-reminders).
// curl -X POST https://<site>/api/admin/resend-confirmations \
//      -H "Authorization: Bearer <CRON_SECRET>"

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log: { email: string; firstName: string; slot: string; status: "ok" | "error"; detail?: string }[] = [];

  try {
    // 1. Fetch Payé commandes that have a Stripe payment ID
    const commandesData = await airtableList("Commandes", {
      filterByFormula: `AND({Statut}="Payé", {ID paiement Stripe}!="")`,
    });

    if (commandesData.records.length === 0) {
      return Response.json({ sent: 0, message: "Aucune commande éligible." });
    }

    // 2. Collect unique client IDs
    const clientIds = new Set<string>();
    for (const cmd of commandesData.records) {
      const linked = cmd.fields?.["Client"] as string[] | undefined;
      if (linked?.[0]) clientIds.add(linked[0]);
    }

    // 3. Batch-fetch clients
    const idFilter   = [...clientIds].map((id) => `RECORD_ID()="${id}"`).join(",");
    const clientsData = await airtableList("Clients", {
      filterByFormula: `OR(${idFilter})`,
    });
    const clientMap = new Map(clientsData.records.map((r) => [r.id, r.fields]));

    // 4. Send one confirmation per commande
    for (const cmd of commandesData.records) {
      const fields     = cmd.fields ?? {};
      const clientLinks = fields["Client"] as string[] | undefined;
      const clientId   = clientLinks?.[0];
      if (!clientId) continue;

      const client = clientMap.get(clientId);
      if (!client) continue;

      const email     = (client["Email"]      as string) ?? "";
      const firstName = (client["Prénom"]      as string) ?? "";
      const lastName  = (client["Nom"]         as string) ?? "";
      const phone     = (client["Téléphone"]   as string) ?? "";
      const address   = (client["Adresse"]     as string) ?? "";
      const zip       = (client["Code postal"] as string) ?? "";
      const city      = (client["Ville"]       as string) ?? "";

      // Quantité: singleSelect returns the option name as a plain string ("2" or "4")
      const quantity = Number(fields["Quantité"] ?? 2);

      // Price: 2btl → 9€, 4btl → 15€ (current drop pricing)
      const price = quantity === 4 ? 15 : 9;

      // Slot name from the linked Créneau record
      const slotLinks  = fields["Créneau"] as string[] | undefined;
      const slotId     = slotLinks?.[0];
      let   slot       = "";
      if (slotId) {
        try {
          const slotRecord = await airtableGet("Créneaux", slotId);
          slot = (slotRecord.fields?.["Nom"] as string) ?? "";
        } catch {
          // Non-fatal: slot name stays empty
        }
      }

      if (!email) continue;

      try {
        await sendOrderConfirmation({
          firstName, lastName, email, phone, address, zip, city,
          quantity, slot, price,
        });
        log.push({ email, firstName, slot, status: "ok" });
        console.log(`[resend] OK → ${email} (${firstName}, ${slot})`);
      } catch (err) {
        const detail = String(err);
        log.push({ email, firstName, slot, status: "error", detail });
        console.error(`[resend] ERREUR → ${email}: ${detail}`);
      }
    }
  } catch (err) {
    return Response.json({ error: String(err), log }, { status: 500 });
  }

  const sent   = log.filter((l) => l.status === "ok").length;
  const errors = log.filter((l) => l.status === "error");
  return Response.json({ sent, errors: errors.length > 0 ? errors : undefined, log });
}
