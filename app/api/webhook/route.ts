import { stripe } from "@/lib/stripe";
import { airtableList, airtableCreate, airtableUpdate } from "@/lib/airtable";
import {
  sendOrderConfirmation,
  sendAdminNotification,
  sendAdminAlert,
} from "@/lib/email";

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
    const emailClean = (m.email ?? "").trim().toLowerCase();

    // ── 1. Upsert client ───────────────────────────────────────────────────────
    let clientId: string;
    try {
      const clientsData = await airtableList("Clients", {
        filterByFormula: `{Email}="${emailClean}"`,
        maxRecords: "1",
      });

      const clientFields = {
        "Email":       emailClean,
        "Prénom":      m.firstName,
        "Nom":         m.lastName,
        "Téléphone":   m.phone,
        "Adresse":     m.address,
        "Code postal": m.zip,
        "Ville":       m.city,
      };

      if (clientsData.records.length > 0) {
        clientId = clientsData.records[0].id;
        await airtableUpdate("Clients", clientId, clientFields);
      } else {
        const newClient = await airtableCreate("Clients", clientFields);
        clientId = newClient.id;
      }
    } catch (err) {
      const msg = String(err);
      console.error("[webhook] Erreur client:", msg);
      try {
        await sendAdminAlert(
          `Erreur webhook — client non créé — ${pi.id}`,
          `Client: ${m.firstName} ${m.lastName} (${emailClean})\nMontant: ${m.price} €\nErreur: ${msg}\nPaymentIntent: ${pi.id}`,
        );
      } catch {}
      // Return 200 so Stripe does not retry (the payment is already captured).
      return Response.json({ received: true });
    }

    // ── 2. Idempotency: skip if a commande already exists for this payment ────
    let commandeAlreadyExists = false;
    try {
      const existing = await airtableList("Commandes", {
        filterByFormula: `{ID paiement Stripe}="${pi.id}"`,
        maxRecords: "1",
      });
      if (existing.records.length > 0) {
        console.log("[webhook] Commande déjà enregistrée, skip:", pi.id);
        commandeAlreadyExists = true;
      }
    } catch (err) {
      // Non-fatal: proceed with creation even if the check failed.
      console.error("[webhook] Erreur vérification idempotence:", err);
    }

    // ── 3. Create commande ─────────────────────────────────────────────────────
    if (!commandeAlreadyExists) {
      const commandeFields: Record<string, unknown> = {
        "Client":               [clientId],
        "Quantité":             m.quantity === "4" ? "4" : "2",
        "Statut":               "Payé",
        "ID paiement Stripe":   pi.id,
      };
      // Only link the slot when a valid record ID was passed.
      if (m.slotId && m.slotId.startsWith("rec")) {
        commandeFields["Créneau"] = [m.slotId];
      }

      try {
        await airtableCreate("Commandes", commandeFields);
      } catch (err) {
        const msg = String(err);
        console.error("[webhook] Erreur création commande:", msg);
        try {
          await sendAdminAlert(
            `Erreur webhook — commande non créée — ${pi.id}`,
            `Le paiement a réussi mais la commande n'a pas été enregistrée dans Airtable.\n\nClient: ${m.firstName} ${m.lastName} (${emailClean})\nMontant: ${m.price} €\nCréneau: ${m.slot}\nErreur Airtable: ${msg}\nPaymentIntent: ${pi.id}`,
          );
        } catch {}
        // Continue — still send the confirmation email to the customer.
      }
    }

    // ── 4. Confirmation emails ─────────────────────────────────────────────────
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

    try {
      await Promise.all([
        sendOrderConfirmation(emailData),
        sendAdminNotification(emailData),
      ]);
    } catch (err) {
      console.error("[webhook] Erreur emails:", err);
    }

    // ── 5. Brevo newsletter ────────────────────────────────────────────────────
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
      } catch (err) {
        console.error("[webhook/brevo]", err);
      }
    }
  }

  return Response.json({ received: true });
}
