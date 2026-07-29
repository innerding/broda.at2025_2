# broda.at — die Karte und die Mappe

Die Visitenkarte, jetzt von einem Cloudflare Worker ausgeliefert statt von
GitHub Pages. Der sichtbare Teil ist unverändert; dazugekommen ist ein
geschlossener Teil: **die Mappe**.

## Warum der Umzug

Auf statischen Seiten kann niemand prüfen. Der alte `login.html` trug die
Passwörter im Quelltext — für jeden lesbar, der die Seite ansieht. Jetzt
prüft der Worker (`/api/tuer`), und die Mappe (`/mappe`) existiert
ausschließlich im Worker: Sie liegt in keinem ausgelieferten Verzeichnis und
ist ohne gültigen Schlüssel nicht einmal als Datei vorhanden.

⚠ Die alten Wörter (`takt`, `verstandtiefe`, `echoantwort`) standen jahrelang
öffentlich im Quelltext. Sie dürfen nirgendwo mehr verwendet werden.

## Die Mappe

Ein Legitimierungsportal: Lebenslauf, Referenzen, Nachweise. **Wer sie
braucht, bekommt einen Link** — kein Konto, keine Anmeldung, keine
Registrierung. Dieselbe Grundfigur wie überall im Werk: Zugang ohne
Zugehörigkeit.

Inhalt bearbeiten: [`worker/mappe.ts`](worker/mappe.ts).

### Schlüssel setzen

```
npx wrangler secret put MAPPE_SCHLUESSEL
```

Format — **ein Schlüssel je Empfänger**, damit sich einer schließen lässt,
ohne die anderen zu schließen:

```
wortA:Frau Mayr, wortB:TVB Salzkammergut, wortC:
```

Der Name hinter dem Doppelpunkt dient nur der Anrede auf der Seite; nichts
wird gespeichert oder protokolliert. Ein Schlüssel ohne Namen ist erlaubt.

Damit sind beide Wege derselbe Mechanismus:

- **Empfänger**: `https://broda.at/mappe?k=<wort>` — Link genügt.
- **Du selbst**: die versteckten Gesten auf der Karte (lange Leertaste,
  drei Finger, Aufziehen) öffnen den Schlüsselkasten; das Wort führt in
  dieselbe Mappe.

## Ausliefern

```
npm install
npm run deploy
```

`build.mjs` legt `dist/` an und kopiert **nur**, was öffentlich sein darf.
Was in der Mappe liegt, kommt dort bewusst nicht vor.

## Offen: die Adresse selbst

Der Worker hängt an **neu.broda.at**. Die Bindung von **broda.at** scheitert,
solange die vier alten A-Records auf GitHub Pages
(185.199.108–111.153) in der Zone stehen. Sie müssen im
Cloudflare-Dashboard (DNS) gelöscht werden, danach genügt ein erneutes
`npm run deploy` — die Route steht bereits in `wrangler.jsonc`.

Rückweg, falls je nötig: die vier A-Records wieder eintragen, dann liefert
GitHub Pages wie zuvor aus. Die statischen Dateien bleiben im Repo.
