export async function GET() {
  const res = await fetch(
    "https://js.stripe.com/v3/apple-pay/m/apple-developer-merchantid-domain-association",
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    return new Response("Not found", { status: 404 });
  }

  const text = await res.text();
  return new Response(text, {
    headers: { "Content-Type": "text/plain" },
  });
}
