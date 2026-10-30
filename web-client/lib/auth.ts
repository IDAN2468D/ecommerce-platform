import crypto from "crypto";

const DEFAULT_HMAC_SECRET = "order-service-default-secret-key-32-bytes!!";

export function generateServiceJwt(customerId: string = "usr_demo"): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: customerId,
    iat: now,
    exp: now + 86400,
  };

  const base64url = (input: Buffer | string) =>
    (Buffer.isBuffer(input) ? input.toString("base64") : Buffer.from(input).toString("base64"))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const token = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", DEFAULT_HMAC_SECRET)
    .update(token)
    .digest();

  return `${token}.${base64url(signature)}`;
}
