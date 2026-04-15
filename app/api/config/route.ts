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
const VALID_STATUTS = ["Ouvert", "Soldout", "Attente"] as const;
type Statut = (typeof VALID_STATUTS)[number];

export async function GET() {
  try {
    // ── 1. Fetch the most recent Drop ──────────────────────────────────────
    // createdTime is Airtable's built-in system field, always available.
    const dropsData = await airtableList("Drops", {
      maxRecords: "1",
      "sort[0][field]":     "createdTime",
      "sort[0][direction]": "desc",
    });

    // 🔍 Debug — visible in Next.js server logs
    console.log("[api/config] Raw Drops response:", JSON.stringify(dropsData, null, 2));

    const drop      = dropsData.records[0];
    const rawStatut = drop?.fields?.Statut;

    console.log("[api/config] drop.fields:", drop?.fields);
    console.log("[api/config] Statut raw value:", rawStatut, "| type:", typeof rawStatut);

    // Strict validation — warn if the value is unexpected
    let statut: Statut;
    if (VALID_STATUTS.includes(rawStatut as Statut)) {
      statut = rawStatut as Statut;
    } else {
      console.warn(
        `[api/config] Unexpected Statut value: "${rawStatut}" — defaulting to "Attente".` +
        ` Expected one of: ${VALID_STATUTS.join(", ")}`
      );
      statut = "Attente";
    }

    const stock = (drop?.fields?.Stock as number) ?? 0;

    // ── 2. Fetch delivery slots ────────────────────────────────────────────
    const creneauxData = await airtableList("Créneaux", {
      "sort[0][field]":     "Date",
      "sort[0][direction]": "asc",
    });

    console.log("[api/config] Raw Créneaux response:", JSON.stringify(creneauxData, null, 2));

    const slots = creneauxData.records
      .filter((r) => (r.fields?.Statut as string) !== "Complet")
      .map((r) => ({
        id:     r.id,
        date:   (r.fields?.Date    as string) ?? "",
        time:   (r.fields?.Horaire as string) ?? "",
        status: mapSlotStatus(r.fields?.Statut as string | undefined),
      }));

    console.log("[api/config] Returning →", { statut, stock, slotsCount: slots.length });

    return Response.json({ statut, stock, slots });
  } catch (err) {
    console.error("[api/config] Error:", err);
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
