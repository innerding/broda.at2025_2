// Legt das ausgelieferte Verzeichnis an: nur was öffentlich sein darf.
// Was in der Mappe liegt, kommt hier bewusst NICHT vor — es lebt im Worker.
import { mkdirSync, copyFileSync, rmSync } from "node:fs";

const OEFFENTLICH = [
  "index.html",
  "visitenkarte.html",
  "kon_takt.html",
  "cdi_paket.html",
  "login.html",
  "flimmer.css",
  "logo.svg",
  "robots.txt",
  "sitemap.xml",
  "Polarstern-Regular.ttf",
  "Polarstern-Medium.ttf",
  "Polarstern-SemiBold.ttf",
];

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
for (const datei of OEFFENTLICH) copyFileSync(datei, `dist/${datei}`);
console.log(`${OEFFENTLICH.length} Dateien ausgeliefert.`);
