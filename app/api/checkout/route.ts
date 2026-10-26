import { stripe } from "@/lib/stripe";
import { airtableGet } from "@/lib/airtable";

function isZoneProche(zip: string): boolean {
  const clean = zip.replace(/\s/g, "");
  return clean === "75013" || clean === "75014";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return Response.json({ error: "Corps invalide." }, { status: 400 });

    const { firstName, lastName, email, phone, address, zip, city, quantity, slot, slotId, price, newsletter } = body;

    const VALID_PRICES = [9, 15];
    const numPrice = Number(price);
    if (!VALID_PRICES.includes(numPrice)) {
      return Response.json({ error: "Montant invalide." }, { status: 400 });
    }

    // ── Server-side slot availability check ───────────────────────────────────
    // Zone-proche clients (75013 / 75014) don't count toward capacity, so
    // they can always book any active slot.
    if (slotId && !isZoneProche(String(zip ?? ""))) {
      const slotRecord = await airtableGet("Créneaux", String(slotId));
      const placesRestantes = (slotRecord.fields?.["Places restantes"] as number) ?? 0;
      if (placesRestantes <= 0) {
        return Response.json(
          { error: "Ce créneau est maintenant complet. Veuillez en choisir un autre." },
          { status: 409 },
        );
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numPrice * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: {
        firstName:  String(firstName  ?? "").trim(),
        lastName:   String(lastName   ?? "").trim(),
        email:      String(email      ?? "").trim().toLowerCase(),
        phone:      String(phone      ?? "").trim(),
        address:    String(address    ?? "").trim(),
        zip:        String(zip        ?? "").trim(),
        city:       String(city       ?? "").trim(),
        quantity:   String(quantity   ?? 2),
        slot:       String(slot       ?? "").trim(),
        slotId:     String(slotId     ?? "").trim(),
        price:      String(price),
        newsletter: String(newsletter ?? false),
      },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/checkout]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
