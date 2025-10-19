export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiUrl = process.env.FASTAPI_URL + "/convert/";
  const apiKey = process.env.FASTAPI_KEY!;

  // Forward the raw stream directly
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      // forward content-type exactly as received
      "Content-Type": req.headers.get("content-type") || "",
    },

    duplex: "half",
    body: req.body, // ← forward the raw multipart stream
  });

  // Relay the response
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
