/**
 * Email sending via Brevo — server-side only.
 * Requires BREVO_API_KEY in env vars.
 */

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// The only verified Brevo sender on this account (contact@bissall.fr, ID 2).
// Used for admin/alert/reminder emails sent as raw HTML.
const VERIFIED_SENDER = { name: "Bissall", email: "contact@bissall.fr" };

function headers() {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error("BREVO_API_KEY is not set");
  return {
    "api-key":      key,
    "Content-Type": "application/json",
    "Accept":       "application/json",
  };
}

async function send(payload: Record<string, unknown>, label: string) {
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const responseBody = await res.text();
  // Always log status + body so we can diagnose errors in Vercel logs.
  if (!res.ok) {
    console.error(`[brevo/${label}] ERREUR ${res.status}:`, responseBody);
    throw new Error(`Brevo ${res.status}: ${responseBody}`);
  }
  console.log(`[brevo/${label}] OK ${res.status}:`, responseBody);
  return JSON.parse(responseBody);
}

// ── HTML base (used for admin/alert emails only) ───────────────────────────────

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

/**
 * Confirmation email sent to the customer.
 * Uses Brevo template #2 — sender, subject and design are defined in the template.
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
  return send({
    to: [{ email: data.email, name: data.firstName }],
    templateId: 2,
    params: {
      PRENOM:   data.firstName,
      QUANTITE: String(data.quantity),
      TOTAL:    data.price.toFixed(2).replace(".", ","),
      CRENEAU:  data.slot,
      ADRESSE:  `${data.address}, ${data.zip} ${data.city}`,
    },
  }, "confirmation");
}

/** Alert email sent to the admin when a critical error occurs. */
export async function sendAdminAlert(subject: string, details: string) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "bounina.sall@gmail.com";

  const content = `
    <div class="card" style="border-left:4px solid #e05a5a;">
      <p style="font-family:Georgia,serif;font-size:16px;color:#e05a5a;margin:0 0 16px;">
        Alerte — action requise
      </p>
      <pre style="font-size:13px;color:#1a0d19;white-space:pre-wrap;margin:0;">${details}</pre>
    </div>`;

  return send({
    sender:      VERIFIED_SENDER,
    to:          [{ email: adminEmail, name: "BISSALL Admin" }],
    subject:     `[BISSALL] ${subject}`,
    htmlContent: baseHtml(content),
  }, "admin-alert");
}

/** Reminder email sent to the customer the day before delivery. */
export async function sendDeliveryReminder(data: {
  firstName: string;
  email:     string;
  slot:      string;
  address:   string;
  zip:       string;
  city:      string;
  quantity:  number;
}) {
  const content = `
    <div class="card">
      <p style="font-family:Georgia,serif;font-size:20px;color:#1a0d19;margin:0 0 24px;font-style:italic;">
        C'est pour demain&nbsp;!
      </p>
      <p style="font-size:13px;color:rgba(26,13,25,0.55);line-height:1.6;margin:0 0 24px;">
        Bonjour ${data.firstName}, votre livraison BISSALL est prévue demain. Voici un récapitulatif.
      </p>

      <hr class="divider" />

      <div class="label">Créneau de livraison</div>
      <div class="value">${data.slot}</div>

      <div class="label">Adresse</div>
      <div class="value">${data.address}, ${data.zip} ${data.city}</div>

      <div class="label">Commande</div>
      <div class="value">BISSALL 50cl × ${data.quantity} bouteille${data.quantity > 1 ? "s" : ""}</div>
    </div>

    <div class="card" style="background:rgba(168,97,162,0.05);border:1px solid rgba(168,97,162,0.15);">
      <p style="font-size:13px;color:rgba(26,13,25,0.55);margin:0;line-height:1.6;">
        Des questions ? Répondez directement à cet email. À demain&nbsp;!
      </p>
    </div>`;

  return send({
    sender:      VERIFIED_SENDER,
    to:          [{ email: data.email, name: data.firstName }],
    replyTo:     VERIFIED_SENDER,
    subject:     "Votre livraison BISSALL est demain",
    htmlContent: baseHtml(content),
  }, "reminder");
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

      <div class="label">Total encaissé</div>
      <div class="total">${data.price.toFixed(2).replace(".", ",")} €</div>
    </div>`;

  return send({
    sender:      VERIFIED_SENDER,
    to:          [{ email: adminEmail, name: "BISSALL Admin" }],
    replyTo:     { email: data.email, name: `${data.firstName} ${data.lastName}` },
    subject:     `Nouvelle commande — ${data.firstName} ${data.lastName} (${data.quantity} btl)`,
    htmlContent: baseHtml(content),
  }, "admin-notification");
}
