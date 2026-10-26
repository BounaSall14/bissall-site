import { airtableList } from "@/lib/airtable";

export const dynamic = "force-dynamic";

type Statut = "Ouvert" | "Soldout" | "Attente";

export async function GET() {
  try {
    // ── 1. Fetch all Drops ────────────────────────────────────────────────────
    const dropsData = await airtableList("Drops");
    const drops = dropsData.records;

    let statut: Statut;
    let activeDrop;

    if ((activeDrop = drops.find((r) => r.fields?.Statut === "Ouvert"))) {
      statut = "Ouvert";
    } else if ((activeDrop = drops.find((r) => r.fields?.Statut === "Attente"))) {
      statut = "Attente";
    } else {
      activeDrop = drops[0];
      statut = "Soldout";
    }

    const activeDropId = activeDrop?.id;

    // ── 2. Fetch active delivery slots ────────────────────────────────────────
    // Fetch all créneaux sorted by date; filter in JS to avoid URL-encoding
    // issues with filterByFormula and linked-record field type ambiguity.
    const creneauxData = await airtableList("Créneaux", {
      "sort[0][field]":     "Date",
      "sort[0][direction]": "asc",
    });

    const slots = creneauxData.records
      .filter((r) => {
        // Must have a date
        const date = r.fields?.Date as string | undefined;
        if (!date?.trim()) return false;
        // Must be active (checkbox true; field absent = false)
        if (!r.fields?.Actif) return false;
        // Must be linked to the active drop (REST API returns record IDs as strings)
        if (activeDropId) {
          const dropLinks = r.fields?.Drop as string[] | undefined;
          if (!dropLinks?.includes(activeDropId)) return false;
        }
        return true;
      })
      .map((r) => ({
        id:              r.id,
        date:            (r.fields?.Date as string) ?? "",
        time:            formatHour(r.fields?.["Heure début"]),
        placesRestantes: (r.fields?.["Places restantes"] as number) ?? 0,
      }));

    return Response.json({ statut, slots });
  } catch (err) {
    console.error("[api/config] Error:", err);
    return Response.json(
      { error: "Impossible de charger la configuration." },
      { status: 500 },
    );
  }
}

function formatHour(val: unknown): string {
  if (val == null || val === "") return "";
  const n = Number(val);
  if (!isNaN(n)) return `${n}h00`;
  return String(val);
}
