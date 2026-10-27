import { airtableList, airtableGet } from "@/lib/airtable";
import { sendDeliveryReminder } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Secured by CRON_SECRET — Vercel sends this automatically for cron jobs.
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── 1. Compute tomorrow's date string (YYYY-MM-DD) ─────────────────────────
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // ── 2. Fetch active Créneaux for tomorrow ──────────────────────────────────
    const creneauxData = await airtableList("Créneaux", {
      filterByFormula: `AND({Actif}=1, IS_SAME({Date}, '${tomorrowStr}', 'day'))`,
    });

    const creneaux = creneauxData.records;
    if (creneaux.length === 0) {
      return Response.json({ sent: 0, message: "Aucun créneau demain." });
    }

    // ── 3. Collect all Commande IDs linked to tomorrow's créneaux ──────────────
    const commandeIds: string[] = [];
    for (const c of creneaux) {
      const linked = c.fields?.["Commandes"] as string[] | undefined;
      if (linked) commandeIds.push(...linked);
    }

    if (commandeIds.length === 0) {
      return Response.json({ sent: 0, message: "Aucune commande pour ces créneaux." });
    }

    // ── 4. Fetch commandes in batch ────────────────────────────────────────────
    // Airtable filterByFormula: OR(RECORD_ID()="rec1", RECORD_ID()="rec2", ...)
    const idFilter = commandeIds
      .map((id) => `RECORD_ID()="${id}"`)
      .join(",");
    const commandesData = await airtableList("Commandes", {
      filterByFormula: `AND(OR(${idFilter}), {Statut}="Payée")`,
    });

    const commandes = commandesData.records;
    if (commandes.length === 0) {
      return Response.json({ sent: 0, message: "Aucune commande Payée pour ces créneaux." });
    }

    // ── 5. Collect unique Client IDs and Créneau IDs ──────────────────────────
    const clientIds = new Set<string>();
    const creneauIdMap = new Map<string, string>(); // créneau record id → nom (primary)

    for (const cmd of commandes) {
      const clientLinks = cmd.fields?.["Client"] as string[] | undefined;
      if (clientLinks?.[0]) clientIds.add(clientLinks[0]);
    }

    // Build créneau name map from fetched créneaux records
    for (const c of creneaux) {
      creneauIdMap.set(c.id, (c.fields?.["Nom"] as string) ?? "");
    }

    // ── 6. Fetch client records ────────────────────────────────────────────────
    const clientIdList = [...clientIds];
    const clientFilter = clientIdList
      .map((id) => `RECORD_ID()="${id}"`)
      .join(",");
    const clientsData = await airtableList("Clients", {
      filterByFormula: `OR(${clientFilter})`,
    });

    const clientMap = new Map(clientsData.records.map((r) => [r.id, r.fields]));

    // ── 7. Send reminder emails ────────────────────────────────────────────────
    let sent = 0;
    const errors: string[] = [];

    for (const cmd of commandes) {
      try {
        const clientLinks = cmd.fields?.["Client"] as string[] | undefined;
        const clientId = clientLinks?.[0];
        if (!clientId) continue;

        const client = clientMap.get(clientId);
        if (!client) continue;

        const email     = (client["Email"]        as string) ?? "";
        const firstName = (client["Prénom"]        as string) ?? "";
        const address   = (client["Adresse"]       as string) ?? "";
        const zip       = (client["Code postal"]   as string) ?? "";
        const city      = (client["Ville"]         as string) ?? "";
        const quantity  = Number(cmd.fields?.["Quantité nb"]) || 2;

        // Get slot name from the linked Créneau
        const slotLinks = cmd.fields?.["Créneau"] as string[] | undefined;
        const slotId    = slotLinks?.[0] ?? "";
        let   slotName  = creneauIdMap.get(slotId) ?? "";
        if (!slotName && slotId) {
          // Fallback: fetch the slot if not in tomorrow's batch (shouldn't happen)
          const slotRecord = await airtableGet("Créneaux", slotId);
          slotName = (slotRecord.fields?.["Nom"] as string) ?? "";
        }

        if (!email) continue;

        await sendDeliveryReminder({ firstName, email, slot: slotName, address, zip, city, quantity });
        sent++;
      } catch (err) {
        errors.push(String(err));
        console.error("[send-reminders] commande error:", err);
      }
    }

    return Response.json({ sent, errors: errors.length > 0 ? errors : undefined });
  } catch (err) {
    console.error("[send-reminders]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
