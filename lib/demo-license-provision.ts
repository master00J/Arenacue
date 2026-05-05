import {
  WEBSITE_DEMO_LICENSE_NOTE,
  adminCreateLicense,
  adminFindActiveWebsiteDemoLicenseForOwnerEmail,
} from "@/lib/license-admin-data";
import { generateLicenseKey } from "@/lib/license-keygen";
import { getSupabaseAdminHeaders } from "@/lib/supabase-admin";

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Standaard aan als service role geconfigureerd is; zet DEMO_LICENSE_AUTO_PROVISION=false om uit te zetten. */
export function isWebsiteDemoLicenseProvisioningEnabled(): boolean {
  const explicit = process.env.DEMO_LICENSE_AUTO_PROVISION?.trim();
  if (explicit === "false" || explicit === "0") {
    return false;
  }
  return Boolean(getSupabaseAdminHeaders());
}

export type ProvisionWebsiteDemoLicenseResult = {
  licenseKey: string;
  reused: boolean;
};

/**
 * Maakt een tijdelijke trial-licentie aan (of hergebruikt een nog geldige website_demo voor hetzelfde e-mailadres).
 */
export async function provisionWebsiteDemoLicense(params: {
  ownerEmail: string;
  organizationLabel: string;
}): Promise<ProvisionWebsiteDemoLicenseResult | null> {
  if (!isWebsiteDemoLicenseProvisioningEnabled()) {
    return null;
  }

  const email = params.ownerEmail.trim().toLowerCase();
  const existing = await adminFindActiveWebsiteDemoLicenseForOwnerEmail(email);
  if (existing) {
    return { licenseKey: existing.license_key, reused: true };
  }

  const validDays = parsePositiveInt(process.env.DEMO_LICENSE_VALID_DAYS, 14);
  const maxAct = parsePositiveInt(process.env.DEMO_LICENSE_MAX_ACTIVATIONS, 2);
  const cappedActivations = Math.min(500, Math.max(1, maxAct));
  const validUntil = new Date(Date.now() + validDays * 86_400_000).toISOString();
  const label = params.organizationLabel.trim() || "Demo";

  for (let attempt = 0; attempt < 8; attempt++) {
    const license_key = generateLicenseKey();
    const result = await adminCreateLicense({
      license_key,
      organization_label: label,
      owner_email: email,
      max_activations: cappedActivations,
      valid_until: validUntil,
      plan: "trial",
      notes: WEBSITE_DEMO_LICENSE_NOTE,
      download_url: null,
    });
    if (result.ok) {
      return { licenseKey: license_key, reused: false };
    }
    if (result.status !== 409) {
      console.error("provisionWebsiteDemoLicense adminCreateLicense failed", result.status, result.text);
      return null;
    }
  }

  console.error("provisionWebsiteDemoLicense exhausted unique key retries");
  return null;
}
