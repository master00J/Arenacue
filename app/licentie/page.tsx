import type { Metadata } from "next";
import Link from "next/link";
import { LicentiePortalClient } from "@/components/licentie-portal-client";
import { LegalFooter } from "@/components/legal-footer";
import { SeoBreadcrumbJsonLd } from "@/components/seo-breadcrumb-json-ld";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    segmentTitle: "Licentie",
    description:
      "Controleer de status van je ArenaCue-licentie, download links en geactiveerde installaties.",
    path: "/licentie",
    keywordsExtra: ["licentie activeren", "ArenaCue download"],
  }),
  robots: { index: true, follow: true },
};

export default function LicentiePage() {
  return (
    <main className="app-shell">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Licentie", path: "/licentie" },
        ]}
      />
      <div className="app-shell-inner">
        <nav className="app-nav" style={{ marginBottom: 22 }}>
          <strong>ArenaCue</strong>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/">Home</Link>
            <Link href="/#contact">Demo</Link>
          </div>
        </nav>
        <LicentiePortalClient />
        <LegalFooter />
      </div>
    </main>
  );
}
