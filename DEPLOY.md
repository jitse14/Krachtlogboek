# Online zetten

De app staat bij [Cloudflare Pages](https://pages.cloudflare.com). Cloudflare bouwt de app zelf uit deze repository. Je hoeft dus nooit bestanden te uploaden.

## Zo werkt het elke dag

1. **Maak een branch** voor je wijziging. In VS Code: klik linksonder op `main` → *Create new branch*, bijvoorbeeld `voeding-zoeken-sneller`.
2. **Werk en test lokaal** met `npm run dev` (zie [README](README.md)).
3. **Commit en push** de branch.
4. **Open een pull request** op GitHub naar `main`. Cloudflare bouwt hem automatisch en zet onder de pull request een **previewlink**. Probeer de wijziging daar uit, ook op je telefoon.
5. **Merge** de pull request. Binnen een minuut of twee staat hij live.

Wat in `main` staat is dus altijd wat gebruikers zien. Werk daarom niet direct op `main`.

### Ging er iets mis?

Ga in Cloudflare naar *Workers & Pages* → *athlevon* → *Deployments*, kies een eerdere versie en klik op **Rollback**. Daarna kun je rustig de fout herstellen in een nieuwe pull request.

### Gebruikers zien de nieuwe versie niet?

De app werkt ook offline via een service worker. Bij elke build krijgt die automatisch een nieuwe naam, dus na één keer de app sluiten en opnieuw openen hebben gebruikers de nieuwe versie. Je hoeft niets met de hand op te hogen. Verhoog wel `APP_VERSION` in `src/js/18-wat-is-er-nieuw-suggesties.js` als je in *Wat is er nieuw* iets wilt melden.

### Wijzigingen in de database

Verander je ook iets in Supabase (een functie of tabel)? Lees dan eerst [DATABASE.md](DATABASE.md). Let op de volgorde: zorg dat een nieuwe databasefunctie er al staat voordat de app die gebruikt, en dat een oude functie pas weg gaat als geen enkele live versie van de app hem meer gebruikt.

## Beveiliging van de site

Bij het bouwen maakt `scripts/build.mjs` het bestand `dist/_headers`. Cloudflare stuurt daarmee beveiligingsheaders mee. De belangrijkste is de **Content-Security-Policy**: de browser voert alleen ons eigen script uit, en de app mag alleen praten met Supabase en Open Food Facts. Komt er ooit code van iemand anders in de pagina terecht, dan wordt die geblokkeerd.

Gebruik je een nieuwe externe dienst (bijvoorbeeld een andere voedingsdatabase), dan blokkeert de browser die eerst. Je ziet dat lokaal al in de console van de browser ("Refused to connect…"). Voeg het adres dan toe aan `connect-src` in `scripts/build.mjs`, en vermeld de dienst in de privacyverklaring.

## Eenmalig: Cloudflare instellen

Dit hoeft maar één keer. Alleen de eigenaar van de GitHub-repository kan dit doen.

1. Maak een gratis account op [dash.cloudflare.com](https://dash.cloudflare.com).
2. Ga naar *Workers & Pages* → *Create* → tab *Pages* → **Connect to Git** en kies `jitse14/Krachtlogboek`.
3. Vul in:
   - **Project name:** `athlevon` (dit wordt `athlevon.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** *None*
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Klik op *Save and Deploy*.
5. Zet onder *Settings* → *Builds* de **Preview branch deployments** op *All non-production branches*.
6. Wil je een eigen domeinnaam? Dat kan later onder *Custom domains*.

Cloudflare verwerkt technische gegevens van bezoekers (zoals IP-adressen). Hun verwerkersovereenkomst geldt automatisch voor elk account; zie [PRIVACY.md](PRIVACY.md).

## Eenmalig: verhuizen van GitHub Pages

De app stond eerst op `jitse14.github.io/Krachtlogboek`. Alles wat de app in de browser bewaart (de groepscode, je persoonlijke code, en wijzigingen die offline zijn gedaan en nog niet zijn verstuurd) hoort bij dat adres. Op het nieuwe adres is dat er dus niet. Daarom gaat de verhuizing in deze volgorde:

1. **Cloudflare instellen** (hierboven) en de previewlink van de pull request `restructure/split-source` goed testen.
2. **Het nieuwe adres doorgeven aan GitHub.** In de repository op GitHub: *Settings* → *Secrets and variables* → *Actions* → tab *Variables* → *New repository variable*. Naam `MOVED_TO`, waarde het nieuwe adres, bijvoorbeeld `https://athlevon.pages.dev/`.
3. **GitHub Pages omzetten.** *Settings* → *Pages* → bij *Source* kies **GitHub Actions**.
4. **De pull request mergen.** Cloudflare zet de app live op het nieuwe adres. Tegelijk zet `.github/workflows/oud-adres.yml` op het oude adres een versie die eerst nog niet-verstuurde wijzigingen verstuurt en dan zegt: *Athlevon heeft een nieuw adres*, met een knop erheen.
5. **Laat iedereen het weten.** Ze openen de app één keer op het oude adres (dan worden openstaande wijzigingen verstuurd), gaan naar het nieuwe adres, loggen in met naam en persoonlijke code, en zetten de nieuwe app op hun beginscherm. De oude app kunnen ze verwijderen.
6. **Na een paar weken:** maak de repository privé (*Settings* → *General* → *Danger Zone* → *Change visibility*). GitHub Pages stopt dan vanzelf. Verwijder daarna `.github/workflows/oud-adres.yml` en de variabele `MOVED_TO`.

Cloudflare blijft gewoon werken met een privérepository.
