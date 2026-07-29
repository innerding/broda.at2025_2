import { mappeSeite } from "./mappe";

export interface Env {
  ASSETS: Fetcher;
  // Schlüssel für die Mappe. Format: "wort:Empfänger,wort2:Empfänger2"
  // Ein Schlüssel je Empfänger — dann lässt sich einer schließen, ohne die
  // anderen zu schließen. Der Empfängername steht nur zur Anrede; nichts
  // davon wird gespeichert oder protokolliert.
  MAPPE_SCHLUESSEL?: string;
}

interface Schluessel {
  wort: string;
  empfaenger: string | null;
}

function schluessel(env: Env): Schluessel[] {
  return (env.MAPPE_SCHLUESSEL ?? "")
    .split(",")
    .map((eintrag) => eintrag.trim())
    .filter(Boolean)
    .map((eintrag) => {
      const trenner = eintrag.indexOf(":");
      return trenner === -1
        ? { wort: eintrag, empfaenger: null }
        : { wort: eintrag.slice(0, trenner).trim(), empfaenger: eintrag.slice(trenner + 1).trim() || null };
    });
}

// Vergleich in konstanter Zeit, damit sich ein Schlüssel nicht Zeichen für
// Zeichen erraten lässt.
function gleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let unterschied = 0;
  for (let i = 0; i < a.length; i++) unterschied |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return unterschied === 0;
}

function pruefe(env: Env, wort: string | null): Schluessel | null {
  if (!wort) return null;
  for (const s of schluessel(env)) if (gleich(s.wort, wort)) return s;
  return null;
}

// Antworten erst im Handler bauen — im globalen Bereich ist das nicht erlaubt.
const keinZutritt = (): Response =>
  new Response("Kein Zutritt.", {
    status: 401,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Die Tür: prüft ein Wort, sagt nur ja oder nein. Von login.html benutzt.
    if (url.pathname === "/api/tuer") {
      const gefunden = pruefe(env, url.searchParams.get("k"));
      return new Response(JSON.stringify({ offen: Boolean(gefunden) }), {
        status: gefunden ? 200 : 401,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // Die Mappe: existiert nur hier, nie im ausgelieferten Verzeichnis.
    if (url.pathname === "/mappe" || url.pathname === "/mappe/") {
      const gefunden = pruefe(env, url.searchParams.get("k"));
      if (!gefunden) return keinZutritt();
      return new Response(mappeSeite(gefunden.empfaenger), {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-robots-tag": "noindex, nofollow",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
