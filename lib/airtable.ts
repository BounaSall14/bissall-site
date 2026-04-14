/**
 * Airtable REST API helpers — server-side only.
 * Never import this file from client components.
 */

const BASE_URL = "https://api.airtable.com/v0";

function headers() {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) throw new Error("AIRTABLE_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function baseUrl() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!baseId) throw new Error("AIRTABLE_BASE_ID is not set");
  return `${BASE_URL}/${baseId}`;
}

/** Fetch records from a table. */
export async function airtableList(
  table: string,
  params: Record<string, string> = {}
): Promise<AirtableListResponse> {
  const qs = new URLSearchParams(params).toString();
  const url = `${baseUrl()}/${encodeURIComponent(table)}${qs ? "?" + qs : ""}`;

  const res = await fetch(url, {
    headers: headers(),
    // Always read fresh data — no Next.js fetch cache
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable GET "${table}" → ${res.status}: ${body}`);
  }
  return res.json() as Promise<AirtableListResponse>;
}

/** Create a single record in a table. */
export async function airtableCreate(
  table: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord> {
  const res = await fetch(`${baseUrl()}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable POST "${table}" → ${res.status}: ${body}`);
  }
  return res.json() as Promise<AirtableRecord>;
}

// ── Minimal Airtable response types ──────────────────────────────────────────

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}
