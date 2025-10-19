import { NextRequest, NextResponse } from "next/server";

// Server-side proxy route. Forwards requests to the real backend and injects X-API-Key
// Usage: /api/proxy/convert -> forwards to ${BACKEND_BASE}/convert

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

export async function GET(req: NextRequest) {
  return await handle(req);
}
export async function POST(req: NextRequest) {
  return await handle(req);
}
export async function PUT(req: NextRequest) {
  return await handle(req);
}
export async function DELETE(req: NextRequest) {
  return await handle(req);
}
export async function PATCH(req: NextRequest) {
  return await handle(req);
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  // Build CORS headers from env with sensible defaults
  const allowOrigins = process.env.ALLOW_ORIGINS ?? "*";
  const allowCredentials = process.env.ALLOW_CREDENTIALS ?? "false";
  const allowMethods =
    process.env.ALLOW_METHODS ?? "GET,POST,PUT,PATCH,DELETE,OPTIONS";
  const allowHeaders = process.env.ALLOW_HEADERS ?? "*";

  // When credentials are allowed, browsers require a concrete origin (can't be '*').
  // If ALLOW_ORIGINS='*' and credentials=true, echo the request Origin header.
  const reqOrigin = req.headers.get("origin") || "*";
  const originToSet =
    allowOrigins === "*" && String(allowCredentials).toLowerCase() === "true"
      ? reqOrigin
      : allowOrigins;

  // If ALLOW_HEADERS is '*', echo requested headers from preflight so browsers accept custom headers.
  const reqHeaders = req.headers.get("access-control-request-headers") || "*";
  const headersToSet = allowHeaders === "*" ? reqHeaders : allowHeaders;

  // If ALLOW_METHODS is '*', echo requested method from preflight if present.
  const reqMethod = req.headers.get("access-control-request-method") || "";
  const methodsToSet =
    allowMethods === "*"
      ? reqMethod || "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      : allowMethods;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": originToSet,
    "Access-Control-Allow-Credentials": String(allowCredentials),
    "Access-Control-Allow-Methods": methodsToSet,
    "Access-Control-Allow-Headers": headersToSet,
    // Allow caching of preflight for 1 hour
    "Access-Control-Max-Age": "3600",
  };
  // Indicate that preflight responses may vary by Origin when we echo it
  headers["Vary"] = "Origin";

  return new NextResponse(null, { status: 204, headers });
}

async function handle(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/^\/api\/proxy/, "");
  const backendBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_BASE ||
    "http://localhost:8000";
  const target = `${backendBase.replace(/\/$/, "")}${path}${
    req.nextUrl.search
  }`;

  // Build headers: copy incoming headers except hop-by-hop, and set X-API-Key from server env var
  const outHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) outHeaders[key] = value;
  });

  // Inject server-side API key (server-only env)
  if (process.env.API_KEY) {
    outHeaders["X-API-Key"] = process.env.API_KEY;
  }

  // Forward the request body if present
  const body = ["GET", "HEAD"].includes(req.method || "")
    ? undefined
    : await req.arrayBuffer();

  try {
    const res = await fetch(target, {
      method: req.method,
      headers: outHeaders,
      body: body ? Buffer.from(body) : undefined,
    });

    // Build response headers, excluding hop-by-hop
    const headers = new Headers();
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) headers.set(key, value);
    });

    // Attach CORS response headers so browser clients receive them
    const allowOrigins = process.env.ALLOW_ORIGINS ?? "*";
    const allowCredentials = process.env.ALLOW_CREDENTIALS ?? "false";
    const exposeHeaders =
      process.env.EXPOSE_HEADERS ?? "Content-Disposition,Content-Type";
    const reqOrigin = req.headers.get("origin") || "*";
    const originToSet =
      allowOrigins === "*" && String(allowCredentials).toLowerCase() === "true"
        ? reqOrigin
        : allowOrigins;
    headers.set("Access-Control-Allow-Origin", originToSet);
    headers.set("Access-Control-Allow-Credentials", String(allowCredentials));
    headers.set("Access-Control-Expose-Headers", exposeHeaders);
    // Signal that responses may vary by Origin when we echo it
    headers.set("Vary", "Origin");

    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: res.status,
      headers,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
