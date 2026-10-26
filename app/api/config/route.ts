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
    // Return ALL active slots (Actif=1, linked to active drop) including full
    // ones — the frontend applies zone logic to decide which are selectable.
    const creneauxData = await airtableList("Créneaux", {
      "filterByFormula":    "{Actif}=1",
      "sort[0][field]":     "Date",
      "sort[0][direction]": "asc",
    });

    const slots = creneauxData.records
      .filter((r) => {
        const date = r.fields?.Date as string | undefined;
        if (!date?.trim()) return false;
        // Only keep slots linked to the active drop
        if (activeDropId) {
          const dropLinks = r.fields?.Drop as { id: string }[] | undefined;
          if (!dropLinks?.some((d) => d.id === activeDropId)) return false;
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
