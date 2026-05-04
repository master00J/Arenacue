"use client";

import { useState } from "react";

type PortalLicense = {
  organizationLabel: string;
  plan: string;
  validUntil: string | null;
  status: "active" | "revoked" | "expired";
  maxActivations: number;
  usedActivations: number;
  installations: {
    deviceLabel: string;
    machinePreview: string;
    activatedAt: string;
    lastSeenAt: string;
  }[];
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return "—";
  }
  return d.toLocaleString("nl-BE", { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(s: PortalLicense["status"]): { text: string; cls: string } {
  if (s === "active") {
    return { text: "Actief", cls: "badge-ok" };
  }
  if (s === "revoked") {
    return { text: "Ingetrokken", cls: "badge-bad" };
  }
  return { text: "Verlopen", cls: "badge-warn" };
}

export function LicensePortalForm() {
  const [licenseKey, setLicenseKey] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortalLicense | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);
    try {
      const res = await fetch("/api/license/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          ownerEmail: ownerEmail.trim(),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; license?: PortalLicense };
      if (!json.ok || !json.license) {
        setError(json.message ?? "Kon status niet ophalen.");
        return;
      }
      setData(json.license);
    } catch {
      setError("Netwerkfout. Probeer later opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="data-card">
        <h1 style={{ margin: "0 0 8px", fontSize: "1.55rem", letterSpacing: "-0.03em" }}>Licentiestatus</h1>
        <p className="form-hint" style={{ marginBottom: 22 }}>
          Vul de licentiesleutel en het e-mailadres in dat bij je licentie hoort (zoals door ArenaCue
          meegedeeld).
        </p>
        <form className="form-stack" onSubmit={(e) => void onSubmit(e)} style={{ maxWidth: 480 }}>
          <label>
            Licentiesleutel
            <input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              autoComplete="off"
              placeholder="ARENA-…"
              required
            />
          </label>
          <label>
            E-mailadres
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Bezig…" : "Toon status"}
          </button>
        </form>
      </div>

      {data && (
        <div className="portal-result data-card">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{data.organizationLabel || "—"}</h2>
            <span className={`badge ${statusLabel(data.status).cls}`}>{statusLabel(data.status).text}</span>
          </div>
          <p className="form-hint" style={{ marginBottom: 16 }}>
            Plan: <strong style={{ color: "var(--text)" }}>{data.plan}</strong>
            {" · "}
            Installaties:{" "}
            <strong style={{ color: "var(--text)" }}>
              {data.usedActivations}/{data.maxActivations}
            </strong>
            {data.validUntil ? (
              <>
                {" · "}
                Geldig tot:{" "}
                <strong style={{ color: "var(--text)" }}>{fmtDate(data.validUntil)}</strong>
              </>
            ) : (
              <>
                {" · "}
                Geldigheid: <strong style={{ color: "var(--text)" }}>onbeperkt</strong>
              </>
            )}
          </p>

          {data.status !== "active" && (
            <p className="form-error" style={{ marginBottom: 16 }}>
              {data.status === "revoked"
                ? "Deze licentie is ingetrokken. Neem contact op met ArenaCue."
                : "Deze licentie is verlopen. Neem contact op met ArenaCue om te verlengen."}
            </p>
          )}

          <h3 style={{ margin: "18px 0 10px", fontSize: "0.95rem", color: "var(--muted)" }}>Geactiveerde machines</h3>
          {data.installations.length === 0 ? (
            <p className="form-hint">Nog geen installaties geregistreerd.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Apparaat</th>
                    <th>Machine</th>
                    <th>Laatst actief</th>
                  </tr>
                </thead>
                <tbody>
                  {data.installations.map((i, idx) => (
                    <tr key={`${i.machinePreview}-${idx}`}>
                      <td>{i.deviceLabel}</td>
                      <td style={{ fontFamily: "ui-monospace, monospace" }}>{i.machinePreview}</td>
                      <td>{fmtDate(i.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
