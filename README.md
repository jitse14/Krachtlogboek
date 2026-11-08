# Athlevon

Training, voeding, coaching en voortgang in één installeerbare webapp. De frontend is pure HTML, CSS en JavaScript. Gegevens staan in Supabase.

## Aan de slag

Je hebt [Node.js](https://nodejs.org) 20.12 of nieuwer nodig. Er hoeft niets geïnstalleerd te worden.

```sh
npm run dev     # lokaal draaien op http://localhost:5173, bouwt opnieuw bij elke wijziging
npm run build   # productieversie maken in dist/
```

**Let op:** ook lokaal praat de app standaard met de echte Supabase-database. Wat je tijdens het testen verandert, verandert dus echte gegevens. Gebruik een testprofiel, of een aparte testdatabase via een `.env`-bestand (zie [DATABASE.md](DATABASE.md)).

## Meer lezen

- [DEPLOY.md](DEPLOY.md): een wijziging online zetten, en de verhuizing naar Cloudflare
- [DATABASE.md](DATABASE.md): hoe de beveiliging in Supabase werkt, en een testdatabase gebruiken
- [PRIVACY.md](PRIVACY.md): wat de AVG vraagt, en wat je doet bij een verzoek of datalek

## Mappen

| Map | Inhoud |
| --- | --- |
| `src/index.html` | De HTML-basis van de pagina |
| `src/js/` | De code, per onderwerp in genummerde bestanden |
| `src/styles/` | De CSS |
| `src/fonts/` | Lettertypes, worden bij het bouwen in de CSS ingebakken |
| `src/sw.js` | Service worker voor offline gebruik. De cacheversie wordt automatisch ingevuld |
| `public/` | Bestanden die ongewijzigd worden meegekopieerd, zoals iconen en video's |
| `scripts/` | Het bouw- en ontwikkelscript. `build.mjs` maakt ook de beveiligingsheaders |
| `supabase/` | Kopie van de databaselogica, zie [DATABASE.md](DATABASE.md) |
| `.github/workflows/` | Tijdelijk: het oude adres op GitHub Pages, zie [DEPLOY.md](DEPLOY.md) |
| `dist/` | Het bouwresultaat. Dit staat niet in git, dus hier niets wijzigen |

## Werken in `src/js/`

De bestanden zijn geen losse modules. Ze worden in volgorde van bestandsnaam samengevoegd tot één script en delen dus één globale scope. Daardoor gelden nu twee regels:

- **De nummers bepalen de volgorde.** Latere bestanden bouwen voort op eerdere, dus hernoem of verplaats ze niet zomaar.
- **Een functie aanpassen? Zoek eerst of er meer versies zijn.** Sommige functies zijn meerdere keren gedeclareerd (dan telt de laatste) of worden later omwikkeld, zoals `render`. Zoek in VS Code op de naam in de hele map.
