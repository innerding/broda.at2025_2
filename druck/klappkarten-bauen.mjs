#!/usr/bin/env node
/**
 * DIE KLAPPKARTE FÜR DEN SCHWARZWEISS-DRUCKER — vier Seiten, fünf Karten je A4-Blatt.
 *
 * Offen misst eine Karte 170 × 55 mm, gefaltet 85 × 55 mm; der Falz steht in der Blattmitte. Seite 1 des Blatts ist
 * die Aussenseite (links die Rückseite mit der Anschrift, rechts die Vorderseite), Seite 2 die Innenseite (links der
 * Bildschirm mit dem Zeichen von o-o-o-o und darunter die Adresse der Einladung, rechts das Handy mit dem QR der
 * Ziel-App, daneben „Wandern mit Lastsimulation"). Beidseitig gedruckt wird mit Wenden an der langen Kante; der Block steht mittig, darum trifft die
 * Innenseite auf die Aussenseite. Geschnitten wird an den Marken im Rand, gefalzt an der gestrichelten Marke; auf
 * den Karten selbst steht keine Linie. Alles ist reines Schwarz — das Gelb kommt von Hand.
 *
 * ⚠ DIE EINLADUNG TRÄGT KEINEN QR, UND DAS IST ABSICHT (sein Wort vom 10.10.2026: „Wozu ein qr-code für die
 * Einladung, wenn es am desktop angesehen werden soll."). Ein QR führt aufs Handy, und dort ist die Vorführung nicht
 * zu Hause. Darum steht ein Bildschirm da, darin das Zeichen, darunter die Adresse zum Tippen. Der QR von Komfort
 * Wandern steht dagegen in einem Handy: Das wird gescannt. Die zwei Geräte sagen, wo was hingehört.
 *
 * ⚠ JEDE KARTE TRÄGT IHRE EIGENE EINLADUNG. Der Bestand einer Vorführung hängt an der Einladung: Mit einem Code für
 * alle sähe jeder, was die anderen hingelegt haben. Darum ist jedes Blatt ein Einzelstück, und darum liegt es nicht
 * im Repo — das Repo ist öffentlich, und ein Code ist eine Tür. Liste und Blatt stehen in `druck/einzeln/`, und der
 * Ordner ist in `.gitignore` ausgenommen.
 *
 * DIE LISTE, je Zeile eine Karte: `Code; Name; Branche` — dieselbe Form, die Secart unter „mehrere auf einmal"
 * nimmt. Dieselbe Datei geht also in Secart und in dieses Skript. Die Nummer auf der Karte ist die Zahl am Ende des
 * Namens („Karte 07" → 07), sonst die Stelle in der Liste. Eine Zeile `ziel: <Adresse>` gibt die Adresse, die der QR
 * von Komfort Wandern trägt; fehlt sie, bleibt die rechte Innenseite leer.
 *
 *   node druck/klappkarten-bauen.mjs [liste] [blatt]                       # das Blatt aus der Liste bauen
 *   node druck/klappkarten-bauen.mjs wuerfeln <anzahl> <namensanfang>    # eine neue Liste mit Codes würfeln
 *
 * ⚠ DIE CODES WERDEN GETIPPT, NICHT GESCANNT. Darum würfelt dieses Skript aus den Zeichen, die sich in der Polarstern
 * nicht verwechseln lassen, und nicht aus allen, die Secart nimmt: Ihr p liest sich wie ein n mit Unterlänge, q wie
 * ein a, r wie ein t, c trägt einen Haken; 5 steht nah am s, 6 am b, 9 am g, z an der 2, v am u (am Bild der Schrift
 * angesehen, 10.10.2026). Es bleiben 21 Zeichen, acht je Code. Das Würfeln schreibt zwei Dateien nach
 * `druck/einzeln/`: `karten.txt` für dieses Skript und `secart-zeilen.txt` zum Einfügen in Secart — erst dort werden
 * aus Codes Einladungen. Eine Liste, die schon Karten trägt, wird vorher unter ihrem Datum beiseitegelegt.
 *
 * Als PDF: Chrome ohne Fenster, siehe druck/LIES-MICH.txt.
 *
 * Der QR wird mit dem Paket `qrcode` gerechnet, das im Repo von Secart schon liegt; hier wird nichts eingerichtet.
 */
import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));

// ── Codes würfeln ──
const ZUM_TIPPEN = "abdefghkmnstuwxy23478";
if (process.argv[2] === "wuerfeln") {
  const anzahl = Number(process.argv[3]);
  const anfang = (process.argv[4] ?? "").trim();
  const wohin = resolve(process.argv[5] ?? `${hier}/einzeln/karten.txt`);
  if (!Number.isInteger(anzahl) || anzahl < 1 || anzahl > 200 || !anfang || anfang.includes(";")) { console.error("So: wuerfeln <anzahl 1–200> <namensanfang ohne Strichpunkt> [liste]"); process.exit(1); }
  mkdirSync(dirname(wohin), { recursive: true });
  // Die Adresse der Ziel-App wandert mit; eine Liste mit Karten wird beiseitegelegt, nicht überschrieben.
  let zielZeile = "";
  if (existsSync(wohin)) {
    const alt = readFileSync(wohin, "utf8").split("\n").map((z) => z.trim());
    zielZeile = alt.find((z) => /^ziel\s*:/i.test(z)) ?? "";
    if (alt.some((z) => z && !z.startsWith("#") && !/^ziel\s*:/i.test(z))) {
      const weg = wohin.replace(/\.txt$/, `-bis-${statSync(wohin).mtime.toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`);
      renameSync(wohin, weg);
      console.log(`Die alte Liste liegt jetzt in ${weg}`);
    }
  }
  const codes = new Set();
  while (codes.size < anzahl) codes.add(Array.from({ length: 8 }, () => ZUM_TIPPEN[randomInt(ZUM_TIPPEN.length)]).join(""));
  const zeilen = [...codes].map((c, i) => `${c}; ${anfang} ${String(i + 1).padStart(2, "0")}`);
  const kopf = `# Gewürfelt am ${new Date().toISOString().slice(0, 10)}: ${anzahl} Karten. Dieselben Zeilen stehen in secart-zeilen.txt; erst in Secart eingefügt, gelten sie.`;
  writeFileSync(wohin, [kopf, ...(zielZeile ? [zielZeile] : []), ...zeilen, ""].join("\n"));
  writeFileSync(`${dirname(wohin)}/secart-zeilen.txt`, zeilen.join("\n") + "\n");
  console.log(`${anzahl} Codes gewürfelt → ${wohin} und secart-zeilen.txt daneben${zielZeile ? "" : " (ohne Zeile ziel: — die rechte Innenseite bliebe leer)"}`);
  process.exit(0);
}

const liste = resolve(process.argv[2] ?? `${hier}/einzeln/karten.txt`);
const blatt = resolve(process.argv[3] ?? `${hier}/einzeln/klappkarten-a4.html`);
const QR = createRequire(import.meta.url)(process.env.QRCODE ?? `${homedir()}/SCIM3ClaudeMax/scim_source/node_modules/qrcode`);

const SHOW = "show.o-o-o-o.app/e/";
const JE_BLATT = 5;

// Die Liste lesen. Der Code wird gesäubert wie in Secart: klein, nur Buchstaben und Ziffern, 6 bis 32 Zeichen.
let ziel = "";
const karten = [];
for (const roh of readFileSync(liste, "utf8").split("\n")) {
  const z = roh.trim();
  if (!z || z.startsWith("#")) continue;
  if (/^ziel\s*:/i.test(z)) { ziel = z.replace(/^ziel\s*:/i, "").trim(); continue; }
  const [c, n] = z.split(";").map((t) => t.trim());
  const code = (c ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (code.length < 6 || code.length > 32 || !n) { console.error(`Nicht genommen: ${z} (Code mit 6–32 Zeichen und ein Name)`); process.exit(1); }
  karten.push({ code, nr: (n.match(/(\d+)\s*$/) ?? [])[1] ?? String(karten.length + 1).padStart(2, "0") });
}
if (!karten.length) { console.error(`Keine Karte in ${liste}`); process.exit(1); }

/** Ein QR als Zeichnung aus Rechtecken, an die Stelle `wo` gesetzt. Die Ruhezone ist das Weisse rundum, sie wird nicht mitgezeichnet. */
function qr(text, wo) {
  const { modules } = QR.create(text, { errorCorrectionLevel: "M" });
  const n = modules.size;
  let d = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (!modules.data[y * n + x]) continue;
      let w = 1;
      while (x + w < n && modules.data[y * n + x + w]) w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w - 1;
    }
  return `<svg ${wo} viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path fill="#000" stroke="none" d="${d}"/></svg>`;
}

// Die Bildmarke von broda.at — derselbe Pfad wie auf der Karte im Netz (visitenkarte.html).
const BILDMARKE = `<svg class="bildmarke" xmlns="http://www.w3.org/2000/svg" viewBox="4 3 16 16.6"><path d="M4.689,17.189l-.108-6.447c-.008-.456.198-.887.551-1.153l6.353-4.781c.22-.166.528-.087.652.166l2.084,4.268c.108.221.032.493-.173.617l-5.202,3.149c-.16.097-.245.289-.215.48.03.178.154.321.318.368.043.017.089.026.136.028l4.934.945c.212.041.365.236.364.462l-.027,3.973c-.002.297-.265.517-.54.452l-8.78-2.081c-.199-.047-.342-.232-.346-.447ZM15.262,15.148l-.024,3.466c-.003.41.442.647.754.401l3.043-2.391c.11-.087.179-.22.188-.365l.194-3.054c.014-.228-.21-.387-.405-.287l-3.485,1.786c-.161.083-.264.254-.265.443ZM13.037,4.793l2.049,4.195c.076.155.247.23.405.178l3.151-1.048c.2-.066.295-.305.201-.502l-1.501-3.128c-.058-.12-.174-.196-.302-.196l-3.699-.019c-.255-.001-.421.282-.304.521Z"/></svg>`;

// Das Zeichen des Hauses, o-o-o-o — die Masse aus `prompt/src/app/zeichen.ts`. Jedes o trägt seinen Kern: So steht
// es in der Anwendung, wenn das Haus wach ist — gefüllt heisst, da ist etwas (sein Wort vom 10.10.2026: „die Brand
// sollte die typische Punktdarstellung wie in der Anwendung tragen"). Die Pille ist weiss ausgespart, damit das
// Zeichen auf dem Raster des Bildschirms klar steht. Der letzte Punkt sieht anders aus, wie in der Anwendung, wo er hell
// ist statt blau — das ist der Graph: Seine Scheibe ist gefüllt und sein Kern weiss (sein Wort vom 10.10.2026).
const ORTE = [16.5, 38.5, 60.5, 82.5];
const zeichen = (wo) => `<svg ${wo} viewBox="0 0 99 24"><rect x="2.4" y="0.4" width="94.2" height="23.2" rx="11.6" fill="#fff" stroke-width="0.6"/>${ORTE.slice(0, 3).map((cx) => `<line x1="${cx + 8.6}" y1="12" x2="${cx + 13.4}" y2="12" stroke-width="1.2"/>`).join("")}${ORTE.map((cx, i) => `<circle cx="${cx}" cy="12" r="4" stroke-width="1" fill="${i === 3 ? "#000" : "none"}"/><circle cx="${cx}" cy="12" r="1.9" fill="${i === 3 ? "#fff" : "#000"}" stroke="none"/>`).join("")}</svg>`;

// Die zwei Geräte, in Millimetern gezeichnet, alles aus Strichen.
// Der Bildschirm hat rundum denselben Rahmen und das Zeichen in der Mitte. Sein Fuss ist der von Apple: senkrecht,
// und ganz unten zeigt er die Stärke des Aluminiums — wie die Wand einer Schuhschachtel oder einer Ablage (sein Wort
// vom 10.10.2026). Er steht auf einem Mac Studio. Die Fläche des Bildschirms trägt ein Raster aus schwarzen Punkten
// (0,2 mm, knapp zwölf von hundert Deckung): Das druckt der Schwarzweiss-Drucker scharf, und das Auge liest es als
// Grau — ein Grau des Druckers selbst wäre grob und fleckig.
// Das Handy hat das Seitenverhältnis eines heutigen (1 zu 2,05) und trägt den QR mit gut vier Feldern Weiss rundum.
const RASTER = `<svg width="0" height="0" style="position:absolute" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="raster" width="0.56" height="0.97" patternUnits="userSpaceOnUse"><circle cx="0.14" cy="0.2425" r="0.1" fill="#000"/><circle cx="0.42" cy="0.7275" r="0.1" fill="#000"/></pattern></defs></svg>`;
const schirm = `<svg class="geraet" style="width:46mm;height:35.2mm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 35.2" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.4"><rect x="0.2" y="0.2" width="45.6" height="25" rx="1.8"/><rect x="1.5" y="1.5" width="43" height="22.4" rx="0.6" fill="url(#raster)" stroke="none"/><path d="M17.8 25.2v3.2M28.2 25.2v3.2M17.8 27.7h10.4M17.8 28.4h10.4"/><rect x="16" y="28.4" width="14" height="6.6" rx="0.5"/><path d="M18.1 33.5h.7M19.8 33.5h.7" stroke-width="0.36"/><path d="M21.8 33.5h2.1" stroke-width="0.2"/><circle cx="28.5" cy="33.5" r="0.18" fill="#000" stroke="none"/>${zeichen('x="6" y="8.58" width="34" height="8.24"')}</svg>`;
const handy = (adresse) => `<svg class="geraet" style="width:20.5mm;height:42mm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20.5 42" fill="none" stroke="#000" stroke-linecap="round" stroke-width="0.4"><rect x="0.2" y="0.2" width="20.1" height="41.6" rx="3"/><path d="M8.6 2.9h3.3" stroke-width="0.9"/>${qr(adresse, 'x="2.5" y="13.25" width="15.5" height="15.5"')}</svg>`;

const vorn = `<div class="seite vorn">${BILDMARKE}<div class="name">Reflective Operating Systems</div><div class="titel">human-centered design</div><div class="kontakt">kontakt<span class="at">@</span><b>broda.at</b></div></div>`;
const hinten = `<div class="seite hinten"><div class="links"><b>Dietmar Broda</b><br>Founder</div><div class="rechts">Weigelsdorf 26<br>4115 Kleinzell i.<span class="im">M.</span><br>Upper Austria<br>+43 681 1038 3810</div></div>`;
const schau = (k) => `<div class="seite innen">${schirm}<div class="erste">${SHOW}${k.code}</div><div class="nr">${k.nr}</div></div>`;
const wander = ziel ? `<div class="seite innen quer">${handy(ziel)}<div class="neben"><div class="erste">Wandern mit Lastsimulation</div></div></div>` : `<div class="seite"></div>`;
const leer = `<div class="seite"></div>`;

// Marken im Rand: Schnitt durchgezogen, Falz gestrichelt. 2 mm vom Block entfernt, auf beiden Seiten des Blatts.
let marken = "";
for (const x of [20, 190]) marken += `<div class="marke s" style="left:${x - 0.1}mm;top:5mm"></div><div class="marke s" style="left:${x - 0.1}mm;top:288mm"></div>`;
for (const y of [11, 66, 121, 176, 231, 286]) marken += `<div class="marke w" style="top:${y - 0.1}mm;left:14mm"></div><div class="marke w" style="top:${y - 0.1}mm;left:192mm"></div>`;
marken += `<div class="falz" style="left:104.9mm;top:5mm"></div><div class="falz" style="left:104.9mm;top:288mm"></div>`;

let seiten = "";
for (let i = 0; i < karten.length; i += JE_BLATT) {
  const teil = karten.slice(i, i + JE_BLATT);
  const fehlt = JE_BLATT - teil.length;
  seiten += `<div class="blatt">${marken}<div class="nutzen">${teil.map(() => hinten + vorn).join("")}${(leer + leer).repeat(fehlt)}</div></div>`;
  seiten += `<div class="blatt">${marken}<div class="nutzen">${teil.map((k) => schau(k) + wander).join("")}${(leer + leer).repeat(fehlt)}</div></div>`;
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Klappkarten – Nutzen A4</title>
  <!-- Gebaut von druck/klappkarten-bauen.mjs. Nicht von Hand ändern, nicht ins Repo: Jede Karte trägt ihre Einladung. -->
  <style>
    @font-face { font-family: 'Polarstern'; font-weight: 400; src: url('../../Polarstern-Regular.ttf') format('truetype'); }
    @font-face { font-family: 'Polarstern'; font-weight: 500; src: url('../../Polarstern-Medium.ttf') format('truetype'); }
    @page { size: 210mm 297mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; font-family: 'Polarstern', sans-serif; font-weight: 400; }
    b { font-weight: 500; }
    .blatt { position: relative; width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; break-after: page; }
    .blatt:last-child { page-break-after: auto; break-after: auto; }
    .nutzen { position: absolute; left: 20mm; top: 11mm; width: 170mm; height: 275mm; display: grid; grid-template-columns: 85mm 85mm; grid-template-rows: repeat(5, 55mm); }
    .seite { position: relative; width: 85mm; height: 55mm; padding: 7.5mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; }
    /* Aussen vorne — die Masse der Karte auf broda.at, auf 85 mm Breite umgerechnet (450 px → 85 mm) */
    .bildmarke { width: 10.85mm; height: auto; margin-bottom: 3.18mm; }
    .name { font-weight: 500; font-size: 5.4mm; line-height: 1.2; white-space: nowrap; }
    .titel { font-size: 4.85mm; line-height: 1.25; margin-bottom: 4.94mm; white-space: nowrap; }
    .kontakt { font-size: 3.74mm; line-height: 1.3; }
    /* Das @ steht frei: vor und nach ihm etwas Luft (sein Wort vom 10.10.2026). */
    .at { margin: 0 0.12em; }
    /* Aussen hinten — zwei Blöcke am Fuss (seine Wahl vom 10.10.2026): links, wer; rechts, wo. Beide hängen an derselben
       Linie, der linke steht am linken Rand, der rechte am rechten, mit demselben Abstand von 7,5 mm. Eine Schriftgrösse,
       zwei Gewichte, ein Zeilenabstand. Die letzte Grundlinie steht 7,5 mm über der Kante (die Zeile reicht 1,38 mm
       unter ihre Grundlinie). Darüber bleibt die Seite weiss. */
    .hinten { display: block; padding: 0; white-space: nowrap; font-size: 3.3mm; line-height: 4.4mm; }
    .hinten .links, .hinten .rechts { position: absolute; bottom: 6.12mm; height: 17.6mm; }
    /* Gemessen an der Tinte, nicht am Kasten: Die Buchstaben tragen links und rechts verschieden viel Luft in sich. */
    .hinten .links { left: 7.59mm; text-align: left; }
    .hinten .rechts { right: 7.33mm; text-align: right; }
    .im { margin-left: 0.14em; }
    /* Innen — links der Bildschirm mit der Adresse darunter, rechts das Handy mit dem Text daneben */
    .innen { padding: 6mm; }
    .geraet { display: block; flex: none; }
    .erste { font-size: 3.6mm; line-height: 1.2; margin-top: 2.4mm; white-space: nowrap; }
    .zweite { font-size: 2.9mm; line-height: 1.2; margin-top: 0.9mm; white-space: nowrap; }
    /* rechts steht der Text neben dem Handy */
    .quer { flex-direction: row; gap: 5mm; }
    .neben { text-align: left; }
    .neben .erste { margin-top: 0; }
    .nr { position: absolute; left: 4mm; bottom: 3.4mm; font-size: 2.2mm; line-height: 1; }
    /* Marken im Rand */
    .marke { position: absolute; background: #000; }
    .marke.s { width: 0.2mm; height: 4mm; }
    .marke.w { width: 4mm; height: 0.2mm; }
    .falz { position: absolute; width: 0; height: 4mm; border-left: 0.2mm dashed #000; }
  </style>
</head>
<body>
${RASTER}
${seiten}
</body>
</html>
`;

mkdirSync(dirname(blatt), { recursive: true });
writeFileSync(blatt, html);
console.log(`${karten.length} Karten auf ${Math.ceil(karten.length / JE_BLATT)} Blatt${ziel ? ", mit Ziel-App" : ""} → ${blatt}`);
