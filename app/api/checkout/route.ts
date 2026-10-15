import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return Response.json({ error: "Corps invalide." }, { status: 400 });

    const { firstName, lastName, email, phone, address, zip, city, quantity, slot, slotId, price } = body;

    const VALID_PRICES = [9, 15];
    const numPrice = Number(price);
    if (!VALID_PRICES.includes(numPrice)) {
      return Response.json({ error: "Montant invalide." }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(price) * 100), // centimes
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
      },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/checkout]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
