import { airtableCreate } from "@/lib/airtable";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

/**
 * POST /api/commande
 *
 * Body (JSON):
 *   firstName, lastName, email, phone,
 *   address, zip, city,
 *   quantity (number), slot (string — créneau label), price (number)
 *
 * Creates a record in the Airtable "Commandes" table.
 * Returns { success: true, id } on success.
 *
 * Airtable table: "Commandes"
 *   Fields: Prénom, Nom, Email, Téléphone, Adresse,
 *           Code postal, Ville, Quantité, Créneau, Prix
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const { firstName, lastName, email, phone, address, zip, city, quantity, slot, price } = body;

    // ── Validation ─────────────────────────────────────────────────────────
    const missing: string[] = [];
    if (!firstName?.trim()) missing.push("Prénom");
    if (!lastName?.trim())  missing.push("Nom");
    if (!email?.trim())     missing.push("Email");
    if (!phone?.trim())     missing.push("Téléphone");
    if (!address?.trim())   missing.push("Adresse");
    if (!zip?.trim())       missing.push("Code postal");
    if (!city?.trim())      missing.push("Ville");
    if (!quantity)          missing.push("Quantité");
    if (!slot?.trim())      missing.push("Créneau");

    if (missing.length > 0) {
      return Response.json(
        { error: `Champs manquants : ${missing.join(", ")}.` },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    // ── Create Airtable record ─────────────────────────────────────────────
    const record = await airtableCreate("Commandes", {
      "Prénom":       String(firstName).trim(),
      "Nom":          String(lastName).trim(),
      "Email":        String(email).trim().toLowerCase(),
      "Téléphone":    String(phone).trim(),
      "Adresse":      String(address).trim(),
      "Code postal":  String(zip).trim(),
      "Ville":        String(city).trim(),
      "Quantité":     Number(quantity),
      "Créneau":      String(slot).trim(),
      "Prix":         Number(price) || 0,
    });

    // ── Send emails (non-blocking — order is confirmed even if email fails) ──
    const emailData = {
      firstName: String(firstName).trim(),
      lastName:  String(lastName).trim(),
      email:     String(email).trim().toLowerCase(),
      phone:     String(phone).trim(),
      address:   String(address).trim(),
      zip:       String(zip).trim(),
      city:      String(city).trim(),
      quantity:  Number(quantity),
      slot:      String(slot).trim(),
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
