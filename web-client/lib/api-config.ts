export function getGatewayUrl(): string {
  return (
    process.env.GATEWAY_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    "http://localhost:8080"
  );
}
