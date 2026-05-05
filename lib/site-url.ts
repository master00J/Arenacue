const FALLBACK_SITE_URL = "https://arenacue.be";

/** `arenacue.com` heeft geen DNS; links uitmail enz. moeten altijd `.be` gebruiken. */
function normalizeArenaCueOrigin(origin: string): string {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (host === "arenacue.com" || host === "www.arenacue.com") {
      return FALLBACK_SITE_URL;
    }
    return origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

/**
 * Canonieke origin voor absolute URLs (metadata, sitemap, e-mails, magic links).
 * Volgorde: `SITE_URL` → `NEXT_PUBLIC_SITE_URL` → arenacue.be.
 * `arenacue.com` wordt automatisch naar `https://arenacue.be` omgezet.
 */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return normalizeArenaCueOrigin(new URL(withProtocol).origin);
  } catch {
    return FALLBACK_SITE_URL;
  }
}