import { airtableList } from "@/lib/airtable";

export const dynamic = "force-dynamic";

/**
 * GET /api/config
 *
 * Reads the latest active Drop from Airtable and returns:
 *   - statut  : "Ouvert" | "Soldout" | "Attente"
 *   - stock   : remaining stock (number)
 *   - slots   : available delivery slots from "Créneaux" table
 *
 * Airtable table: "Drops"
 *   Fields: Statut (single select), Stock (number)
 *
 * Airtable table: "Créneaux"
 *   Fields: Date (text), Horaire (text), Statut (single select)
 *   Statut values: "Disponible" | "Bientôt complet" | "Complet"
 */
export async function GET() {
  try {
    // ── 1. Fetch the most recent Drop ──────────────────────────────────────
    const dropsData = await airtableList("Drops", {
      maxRecords: "1",
      "sort[0][field]": "Created",
      "sort[0][direction]": "desc",
    });

    const drop = dropsData.records[0];
    const statut = (drop?.fields?.Statut as string) ?? "Attente";
    const stock  = (drop?.fields?.Stock  as number) ?? 0;

    // ── 2. Fetch delivery slots ────────────────────────────────────────────
    const creneauxData = await airtableList("Créneaux", {
      "sort[0][field]": "Date",
      "sort[0][direction]": "asc",
    });

    const slots = creneauxData.records
      .filter((r) => (r.fields?.Statut as string) !== "Complet")
      .map((r) => ({
        id:     r.id,
        date:   (r.fields?.Date    as string) ?? "",
        time:   (r.fields?.Horaire as string) ?? "",
        status: mapSlotStatus(r.fields?.Statut as string | undefined),
      }));

    return Response.json({ statut, stock, slots });
  } catch (err) {
    console.error("[api/config]", err);
    return Response.json(
      { error: "Impossible de charger la configuration." },
      { status: 500 }
    );
  }
}

function mapSlotStatus(s: string | undefined): "available" | "filling" {
  if (s === "Bientôt complet") return "filling";
  return "available";
}
