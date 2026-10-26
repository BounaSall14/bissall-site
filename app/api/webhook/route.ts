import { stripe } from "@/lib/stripe";
import { airtableList, airtableCreate, airtableUpdate } from "@/lib/airtable";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const sig  = request.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Signature invalide:", msg);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const m  = pi.metadata;

    try {
      const emailClean = m.email.trim().toLowerCase();

      // Find or create client
      const clientsData = await airtableList("Clients", {
        filterByFormula: `{Email}="${emailClean}"`,
        maxRecords: "1",
      });

      // Address fields to write — including zip so Airtable can compute
      // "Zone proche (13e/14e)" correctly before the Commande is created.
      const clientFields = {
        "Email":       emailClean,
        "Prénom":      m.firstName,
        "Nom":         m.lastName,
        "Téléphone":   m.phone,
        "Adresse":     m.address,
        "Code postal": m.zip,
        "Ville":       m.city,
      };

      let clientId: string;
      if (clientsData.records.length > 0) {
        clientId = clientsData.records[0].id;
        // Update address in case it changed (zip drives the zone formula)
        await airtableUpdate("Clients", clientId, clientFields);
      } else {
        const newClient = await airtableCreate("Clients", clientFields);
        clientId = newClient.id;
      }

      await airtableCreate("Commandes", {
        "Client":   [clientId],
        "Quantité": m.quantity === "4" ? "4" : "2",
        "Créneau":  [m.slotId],
        "Statut":   "Payée",
      });

      const emailData = {
        firstName: m.firstName,
        lastName:  m.lastName,
        email:     emailClean,
        phone:     m.phone,
        address:   m.address,
        zip:       m.zip,
        city:      m.city,
        quantity:  Number(m.quantity) || 2,
        slot:      m.slot,
        price:     Number(m.price)    || 0,
      };

      await Promise.all([
        sendOrderConfirmation(emailData),
        sendAdminNotification(emailData),
      ]);

      if (m.newsletter === "true") {
        try {
          const brevoKey = process.env.BREVO_API_KEY;
          if (brevoKey) {
            const r = await fetch("https://api.brevo.com/v3/contacts", {
              method: "POST",
              headers: { "api-key": brevoKey, "Content-Type": "application/json" },
              body: JSON.stringify({
                email: emailClean,
                attributes: { PRENOM: m.firstName, NOM: m.lastName },
                listIds: [2],
                updateEnabled: true,
              }),
            });
            if (!r.ok) console.error("[webhook/brevo]", await r.text());
          }
        } catch (err) { console.error("[webhook/brevo]", err); }
      }
    } catch (err) {
      console.error("[webhook] Erreur traitement commande:", err);
    }
  }

  return Response.json({ received: true });
}
