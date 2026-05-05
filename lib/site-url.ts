/**
 * Vaste openbare productiedomein — gebruik dit voor alle absolute URLs (SEO, sitemap, e-mail, magic links).
 * Geen env-override: voorkomt verkeerde hosts (.com, preview-URL’s per ongeluk in klantmails).
 */
export const CANONICAL_SITE_ORIGIN = "https://arenacue.be";

export function getSiteUrl(): string {
  return CANONICAL_SITE_ORIGIN;
}
