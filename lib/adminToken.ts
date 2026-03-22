/**
 * HMAC-SHA256 signed admin session tokens.
 *
 * Token format: `payloadB64url.signatureB64url`
 * where payload is JSON { email, iat, exp }.
 *
 * Uses the Web Crypto API so it works in both Node.js and Edge runtimes.
 */

const ALG = { name: "HMAC", hash: "SHA-256" };

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), ALG, false, ["sign", "verify"]);
}

function b64url(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlToUint8(s: string): Uint8Array<ArrayBuffer> {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad    = padded.length % 4;
  const base64 = pad ? padded + "=".repeat(4 - pad) : padded;
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Create a signed session token that expires after `ttlSeconds`. */
export async function createAdminToken(email: string, ttlSeconds = 60 * 60 * 24 * 7): Promise<string> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET not set");

  const enc     = new TextEncoder();
  const now     = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ email, iat: now, exp: now + ttlSeconds });

  const payloadB64 = b64url(enc.encode(payload));
  const key        = await importKey(secret);
  const sigBuffer  = await crypto.subtle.sign(ALG, key, enc.encode(payloadB64));
  const sigB64     = b64url(new Uint8Array(sigBuffer));

  return `${payloadB64}.${sigB64}`;
}

/** Verify a token; returns the payload or null if invalid/expired. */
export async function verifyAdminToken(
  token: string
): Promise<{ email: string; iat: number; exp: number } | null> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  try {
    const enc   = new TextEncoder();
    const key   = await importKey(secret);
    const valid = await crypto.subtle.verify(
      ALG,
      key,
      b64urlToUint8(sigB64),
      enc.encode(payloadB64)
    );
    if (!valid) return null;

    const rawPayload = new TextDecoder().decode(b64urlToUint8(payloadB64));
    const payload    = JSON.parse(rawPayload) as {
      email: string;
      iat:   number;
      exp:   number;
    };

    if (Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
