import { stripe } from "@/lib/stripe";
import { airtableList, airtableCreate } from "@/lib/airtable";
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

      let clientId: string;
      if (clientsData.records.length > 0) {
        clientId = clientsData.records[0].id;
      } else {
        const newClient = await airtableCreate("Clients", {
          "Email":       emailClean,
          "Prénom":      m.firstName,
          "Nom":         m.lastName,
          "Téléphone":   m.phone,
          "Adresse":     m.address,
          "Code postal": m.zip,
          "Ville":       m.city,
        });
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
    } catch (err) {
      console.error("[webhook] Erreur traitement commande:", err);
    }
  }

  return Response.json({ received: true });
}
