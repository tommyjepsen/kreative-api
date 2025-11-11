export function sanitizeUrl(input: string): string {
  // Ensure it has a protocol for parsing
  let url = input.startsWith("http") ? input : `https://${input}`;
  const parsed = new URL(url);

  // Extract hostname
  let hostname = parsed.hostname;

  // Keep only root domain (remove subdomains)
  const parts = hostname.split(".");
  if (parts.length > 2) {
    hostname = parts.slice(-2).join(".");
  }

  return `https://${hostname}`;
}
