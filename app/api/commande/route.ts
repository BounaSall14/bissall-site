import { airtableList, airtableCreate } from "@/lib/airtable";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return Response.json({ error: "Corps de requête invalide." }, { status: 400 });

    const { firstName, lastName, email, phone, address, zip, city, slot, slotId, price } = body;

    // ── Validation ─────────────────────────────────────────────────────────
    const missing: string[] = [];
    if (!firstName?.trim()) missing.push("Prénom");
    if (!lastName?.trim())  missing.push("Nom");
    if (!email?.trim())     missing.push("Email");
    if (!phone?.trim())     missing.push("Téléphone");
    if (!address?.trim())   missing.push("Adresse");
    if (!zip?.trim())       missing.push("Code postal");
    if (!city?.trim())      missing.push("Ville");
    if (!slotId?.trim())    missing.push("Créneau");

    if (missing.length > 0) {
      return Response.json({ error: `Champs manquants : ${missing.join(", ")}.` }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    const emailClean = String(email).trim().toLowerCase();

    // ── 1. Find or create client in "Clients" table ────────────────────────
    const clientsData = await airtableList("Clients", {
      filterByFormula: `{Email}="${emailClean}"`,
      maxRecords: "1",
    });

    let clientId: string;
    if (clientsData.records.length > 0) {
      clientId = clientsData.records[0].id;
    } else {
      const newClient = await airtableCreate("Clients", {
        "Email":       emailClean,
        "Prénom":      String(firstName).trim(),
        "Nom":         String(lastName).trim(),
        "Téléphone":   String(phone).trim(),
        "Adresse":     String(address).trim(),
        "Code postal": String(zip).trim(),
        "Ville":       String(city).trim(),
      });
      clientId = newClient.id;
    }

    // ── 2. Create commande with linked records ─────────────────────────────
    // Quantité is a Single select field with options "2" / "4"
    // Client and Créneau are linked records — pass as array of IDs
    const record = await airtableCreate("Commandes", {
      "Client":   [clientId],
      "Quantité": "2",
      "Créneau":  [String(slotId).trim()],
      "Statut":   "En préparation",
    });

    // ── 3. Send emails (non-blocking) ──────────────────────────────────────
    const emailData = {
      firstName: String(firstName).trim(),
      lastName:  String(lastName).trim(),
      email:     emailClean,
      phone:     String(phone).trim(),
      address:   String(address).trim(),
      zip:       String(zip).trim(),
      city:      String(city).trim(),
      quantity:  2,
      slot:      String(slot ?? slotId).trim(),
      price:     Number(price) || 0,
    };

    Promise.all([
      sendOrderConfirmation(emailData),
      sendAdminNotification(emailData),
    ]).catch((err) => console.error("[api/commande] Email error:", err));

    return Response.json({ success: true, id: record.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/commande]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
