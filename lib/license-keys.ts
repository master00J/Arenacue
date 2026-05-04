import { z } from "zod";

const licenseKeySchema = z
  .string()
  .trim()
  .min(8, "Ongeldige licentiesleutel.")
  .max(64, "Ongeldige licentiesleutel.")
  .regex(/^[A-Za-z0-9._-]+$/, "Ongeldige licentiesleutel.");

const machineIdSchema = z
  .string()
  .trim()
  .min(8, "Ongeldige machine-id.")
  .max(256, "Ongeldige machine-id.");

export const licenseCheckBodySchema = z.object({
  licenseKey: licenseKeySchema,
  machineId: machineIdSchema,
});

export const licenseActivateBodySchema = z.object({
  licenseKey: licenseKeySchema,
  machineId: machineIdSchema,
  deviceLabel: z.string().trim().max(120).optional(),
});

export type LicenseCheckBody = z.infer<typeof licenseCheckBodySchema>;
export type LicenseActivateBody = z.infer<typeof licenseActivateBodySchema>;

export function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase();
}
