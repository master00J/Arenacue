const FALLBACK_SITE_URL = "https://arenacue.be";

/**
 * Canonieke origin voor absolute URLs (metadata, sitemap, e-mails, magic links).
 * Volgorde: `SITE_URL` → `NEXT_PUBLIC_SITE_URL` → arenacue.be.
 * Gebruik een domein met geldige DNS; anders krijg je in de browser NXDOMAIN.
 */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
