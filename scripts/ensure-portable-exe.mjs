/**
 * Vult `public/downloads/Stadium-Scoreboard.exe` vóór `next build`.
 * 1) `PORTABLE_EXE_FETCH_URL` — directe HTTPS-URL (aanbevolen op Vercel; .exe >100 MB past niet in Git).
 * 2) Kopie uit monorepo: `../dist/Stadium-Scoreboard.exe` na `npm run electron:build` in de scoreboard-root.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..", "..");
const localPortable = path.join(repoRoot, "dist", "Stadium-Scoreboard.exe");
const destDir = path.join(__dirname, "..", "public", "downloads");
const dest = path.join(destDir, "Stadium-Scoreboard.exe");

const MIN_BYTES = 50 * 1024 * 1024;

async function fetchToFile(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`PORTABLE_EXE_FETCH_URL HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < MIN_BYTES) {
    throw new Error(`Download te klein (${buf.length} bytes); controleer de URL.`);
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(`[ensure-portable] gedownload (${Math.round(buf.length / 1024 / 1024)} MB) → public/downloads/`);
}

function copyIfExists() {
  if (!fs.existsSync(localPortable)) {
    return false;
  }
  const st = fs.statSync(localPortable);
  if (st.size < MIN_BYTES) {
    console.warn("[ensure-portable] lokale .exe lijkt te klein, overslaan.");
    return false;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(localPortable, dest);
  console.log(`[ensure-portable] gekopieerd (${Math.round(st.size / 1024 / 1024)} MB) van dist/`);
  return true;
}

async function main() {
  if (fs.existsSync(dest)) {
    const st = fs.statSync(dest);
    if (st.size >= MIN_BYTES) {
      console.log("[ensure-portable] bestand bestaat al.");
      return;
    }
    try {
      fs.unlinkSync(dest);
    } catch {
      /* ignore */
    }
  }

  const fetchUrl = process.env.PORTABLE_EXE_FETCH_URL?.trim();
  if (fetchUrl) {
    await fetchToFile(fetchUrl);
    return;
  }

  if (copyIfExists()) {
    return;
  }

  console.warn(
    "[ensure-portable] Geen portable .exe: zet PORTABLE_EXE_FETCH_URL op Vercel, of bouw lokaal in de scoreboard-map (`npm run electron:build`) en run `npm run build` opnieuw vanaf Website.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
