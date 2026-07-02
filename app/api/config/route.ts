import { airtableList } from "@/lib/airtable";

export const dynamic = "force-dynamic";

/**
 * GET /api/config
 *
 * Reads all Drops from Airtable and applies priority logic:
 *   - If at least one Drop is "Ouvert"  → statut = "Ouvert"
 *   - Else if at least one is "Attente" → statut = "Attente"
 *   - Otherwise                         → statut = "Soldout"
 *
 * stock comes from the winning drop (first "Ouvert", or first "Attente").
 *
 * Airtable table: "Drops"
 *   Fields: Statut (single select), Stock (number)
 *
 * Airtable table: "Créneaux"
 *   Fields: Date (text), Horaire (text), Statut (single select)
 *   Statut values: "Disponible" | "Bientôt complet" | "Complet"
 */
type Statut = "Ouvert" | "Soldout" | "Attente";

export async function GET() {
  try {
    // ── 1. Fetch all Drops ─────────────────────────────────────────────────
    // No sort needed — priority logic (Ouvert > Attente > Soldout) is applied below.
    const dropsData = await airtableList("Drops");

    console.log("[api/config] Raw Drops response:", JSON.stringify(dropsData, null, 2));

    const drops = dropsData.records;
    const statuts = drops.map((r) => r.fields?.Statut as string | undefined);
    console.log("[api/config] All Statut values:", statuts);

    // ── Priority logic ─────────────────────────────────────────────────────
    // "Ouvert" > "Attente" > "Soldout"
    let statut: Statut;
    let activeDrop;

    if ((activeDrop = drops.find((r) => r.fields?.Statut === "Ouvert"))) {
      statut = "Ouvert";
    } else if ((activeDrop = drops.find((r) => r.fields?.Statut === "Attente"))) {
      statut = "Attente";
    } else {
      activeDrop = drops[0]; // most recent, for stock value
      statut = "Soldout";
    }

    console.log("[api/config] Resolved statut:", statut, "| activeDrop id:", activeDrop?.id);

    const stock = (activeDrop?.fields?.Stock as number) ?? 0;

    // ── 2. Fetch delivery slots ────────────────────────────────────────────
    const creneauxData = await airtableList("Créneaux", {
      "sort[0][field]":     "Date",
      "sort[0][direction]": "asc",
    });

    console.log("[api/config] Raw Créneaux response:", JSON.stringify(creneauxData, null, 2));

    const slots = creneauxData.records
      .filter((r) => {
        const statut = r.fields?.Statut as string | undefined;
        const date   = r.fields?.Date   as string | undefined;
        // Exclude only explicitly "Complet" slots and entries with no date
        return statut !== "Complet" && date?.trim();
      })
      .map((r) => ({
        id:     r.id,
        date:   (r.fields?.Date    as string) ?? "",
        time:   formatHour(r.fields?.["Heure début"] ?? r.fields?.Horaire),
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

function formatHour(val: unknown): string {
  if (val == null || val === "") return "";
  const n = Number(val);
  if (!isNaN(n)) return `${n}h00`;
  return String(val);
}
