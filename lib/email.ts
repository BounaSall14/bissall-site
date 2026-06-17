/**
 * Email sending via Resend — server-side only.
 * Requires RESEND_API_KEY in env vars.
 * Requires RESEND_FROM in env vars (e.g. "BISSALL <commandes@bissall.fr>").
 */

const RESEND_URL = "https://api.resend.com/emails";

function headers() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function from() {
  return process.env.RESEND_FROM ?? "BISSALL <commandes@bissall.fr>";
}

async function send(payload: Record<string, unknown>) {
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Templates ─────────────────────────────────────────────────────────────────

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #F5EFE6; font-family: system-ui, sans-serif; }
    .wrap { max-width: 520px; margin: 0 auto; padding: 48px 24px; }
    .logo { font-family: Georgia, serif; font-size: 28px; letter-spacing: 10px; color: #1a0d19; margin-bottom: 40px; }
    .card { background: #fff; border-radius: 4px; padding: 32px; margin-bottom: 24px; }
    .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(168,97,162,0.6); margin-bottom: 4px; }
    .value { font-size: 15px; color: #1a0d19; margin-bottom: 18px; }
    .divider { border: none; border-top: 1px solid rgba(168,97,162,0.12); margin: 20px 0; }
    .total { font-family: Georgia, serif; font-size: 22px; color: #1a0d19; }
    .footer { font-size: 11px; color: rgba(26,13,25,0.35); text-align: center; margin-top: 32px; line-height: 1.6; }
    .footer a { color: rgba(168,97,162,0.5); text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">BISSALL</div>
    ${content}
    <div class="footer">
      Bissap artisanal · Paris<br />
      <a href="https://instagram.com/bissall.drink">@bissall.drink</a>
    </div>
  </div>
</body>
</html>`;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface OrderEmailData {
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  address:    string;
  zip:        string;
  city:       string;
  quantity:   number;
  slot:       string;
  price:      number;
}

/** Confirmation email sent to the customer. */
export async function sendOrderConfirmation(data: OrderEmailData) {
  const content = `
    <div class="card">
      <p style="font-family:Georgia,serif;font-size:20px;color:#1a0d19;margin:0 0 24px;font-style:italic;">
        Merci ${data.firstName}&nbsp;!
      </p>
      <p style="font-size:13px;color:rgba(26,13,25,0.55);line-height:1.6;margin:0 0 24px;">
        Votre commande a bien été reçue. Nous vous contacterons avant la livraison pour confirmer les détails.
      </p>

      <hr class="divider" />

      <div class="label">Produit</div>
      <div class="value">BISSALL 50cl × ${data.quantity} bouteille${data.quantity > 1 ? "s" : ""}</div>

      <div class="label">Créneau de livraison</div>
      <div class="value">${data.slot}</div>

      <div class="label">Adresse de livraison</div>
      <div class="value">${data.address}, ${data.zip} ${data.city}</div>

      <hr class="divider" />

      <div class="label">Total à régler à la livraison</div>
      <div class="total">${data.price.toFixed(2).replace(".", ",")} €</div>
    </div>

    <div class="card" style="background:rgba(168,97,162,0.05);border:1px solid rgba(168,97,162,0.15);">
      <p style="font-size:13px;color:rgba(26,13,25,0.55);margin:0;line-height:1.6;">
        <strong style="color:#1a0d19;">Paiement à la livraison</strong> — espèces ou virement.<br />
        Des questions ? Répondez directement à cet email.
      </p>
    </div>`;

  return send({
    from:    from(),
    to:      [data.email],
    subject: `Commande confirmée — BISSALL × ${data.quantity} bouteille${data.quantity > 1 ? "s" : ""}`,
    html:    baseHtml(content),
  });
}

/** Notification email sent to the seller when a new order arrives. */
export async function sendAdminNotification(data: OrderEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "bounina.sall@gmail.com";

  const content = `
    <div class="card">
      <p style="font-family:Georgia,serif;font-size:18px;color:#a861a2;margin:0 0 20px;">
        Nouvelle commande reçue
      </p>

      <div class="label">Client</div>
      <div class="value">${data.firstName} ${data.lastName}</div>

      <div class="label">Email</div>
      <div class="value"><a href="mailto:${data.email}" style="color:#a861a2;">${data.email}</a></div>

      <div class="label">Téléphone</div>
      <div class="value">${data.phone}</div>

      <div class="label">Adresse</div>
      <div class="value">${data.address}, ${data.zip} ${data.city}</div>

      <hr class="divider" />

      <div class="label">Commande</div>
      <div class="value">${data.quantity} bouteille${data.quantity > 1 ? "s" : ""} × BISSALL 50cl</div>

      <div class="label">Créneau</div>
      <div class="value">${data.slot}</div>

      <div class="label">Total à encaisser</div>
      <div class="total">${data.price.toFixed(2).replace(".", ",")} €</div>
    </div>`;

  return send({
    from:    from(),
    to:      [adminEmail],
    subject: `🛍 Nouvelle commande — ${data.firstName} ${data.lastName} (${data.quantity} btl)`,
    html:    baseHtml(content),
  });
}
