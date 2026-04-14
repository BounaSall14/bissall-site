import { airtableCreate } from "@/lib/airtable";

/**
 * POST /api/notification
 *
 * Body (JSON): { email: string }
 *
 * Adds the email to the Airtable "Clients" table with Note = "Liste attente".
 * Returns { success: true } on success.
 *
 * Airtable table: "Clients"
 *   Fields: Email, Note
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const { email } = body;

    if (!email?.trim()) {
      return Response.json({ error: "Email requis." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return Response.json({ error: "Format d'email invalide." }, { status: 400 });
    }

    await airtableCreate("Clients", {
      Email: String(email).trim().toLowerCase(),
      Note:  "Liste attente",
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[api/notification]", err);
    return Response.json(
      { error: "Erreur lors de l'inscription. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
