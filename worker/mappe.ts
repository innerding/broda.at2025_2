// Die Mappe — der geschlossene Teil von broda.at.
// Nichts hiervon liegt im ausgelieferten Verzeichnis; es existiert nur in
// diesem Worker und wird ausschließlich gegen einen gültigen Schlüssel
// herausgegeben. Wer keinen hat, sieht die Mappe nicht einmal als Tür.

export const LEBENSLAUF = `
<h2>Lebenslauf</h2>
<p class="hinweis">Noch nicht hinterlegt. Der Inhalt gehört in
<code>worker/mappe.ts</code> — er reist nur über einen Schlüssel und wird
von keiner Suchmaschine gefunden.</p>
`;

export const WERK = `
<h2>Das Werk</h2>
<p>Ein Betriebssystem für Destinationen, entworfen als fünf trennbare Häuser:
Pforte (Ausweise und Sperren), Kontor (Gespräch, Ablage, Identität),
Werkbank (der Kunde baut sein Revier), Auslieferung (die App im Feld),
Werk &amp; Markt (Fertigung, Bücher, Verkauf). Daneben ein Leitstand, der
sieht, <em>dass</em> etwas fährt — nie, <em>was</em> darin transportiert
wird.</p>
<p class="hinweis">Gebaut und in Betrieb: aart.studio · aargh.club ·
diesen.app</p>
`;

// Was in der Mappe liegt. Reihenfolge = Reihenfolge auf der Seite.
export const BLAETTER: { id: string; titel: string; inhalt: string }[] = [
  { id: "lebenslauf", titel: "Lebenslauf", inhalt: LEBENSLAUF },
  { id: "werk", titel: "Das Werk", inhalt: WERK },
];

export function mappeSeite(empfaenger: string | null): string {
  const gruss = empfaenger ? `<p class="gruss">Für ${empfaenger}.</p>` : "";
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Mappe · Dietmar Broda</title>
<style>
  @font-face { font-family: 'Polarstern'; font-weight: 400; src: url('/Polarstern-Regular.ttf') format('truetype'); }
  @font-face { font-family: 'Polarstern'; font-weight: 600; src: url('/Polarstern-SemiBold.ttf') format('truetype'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f5f2ea; color: #26221b;
    font-family: 'Polarstern', Georgia, serif;
    line-height: 1.7; padding: 4.5rem 1.5rem 6rem;
  }
  main { max-width: 34rem; margin: 0 auto; }
  h1 { font-size: 1.6rem; font-weight: 600; letter-spacing: .04em; margin-bottom: .3rem; }
  .gruss { color: #7a7361; margin-bottom: 2.6rem; }
  section { margin-bottom: 2.8rem; }
  h2 { font-size: 1.05rem; font-weight: 600; margin-bottom: .6rem; }
  p { margin-bottom: .9rem; }
  .hinweis { color: #7a7361; font-size: .9rem; }
  code { font-family: ui-monospace, Menlo, monospace; font-size: .85em; }
  footer { color: #a8a091; font-size: .8rem; margin-top: 3.5rem; }
</style>
</head>
<body>
<main>
  <h1>Dietmar Broda</h1>
  ${gruss}
  ${BLAETTER.map((b) => `<section id="${b.id}">${b.inhalt}</section>`).join("\n")}
  <footer>Dieser Zugang gehört Ihnen allein und kann jederzeit geschlossen werden.</footer>
</main>
</body>
</html>`;
}
