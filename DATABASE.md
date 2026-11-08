# De database (Supabase)

## Hoe de beveiliging werkt

De app gebruikt geen gewone Supabase-login. In plaats daarvan:

- iedereen vult één keer de **groepscode** in, en daarna **naam + persoonlijke code** (de pincode);
- elke vraag aan de database gaat via een **functie** (`kl_load`, `kl_put`, enzovoort), zie `rpc()` in `src/js/01-store-supabase.js`;
- elke functie krijgt de groepscode, het profiel en de pincode mee en controleert die eerst, en pas dan doet hij iets.

De sleutel in de app (`sb_publishable_…`) is openbaar. Iedereen kan hem uit de pagina halen, en dat is ook de bedoeling. Daarom moet de database zelf alles afschermen:

- **RLS staat aan op elke `kl_`-tabel**, zonder policies voor `anon`. Dan kan niemand de tabellen rechtstreeks lezen of wijzigen, alleen via de functies.
- De functies zijn **`SECURITY DEFINER`** met een vaste **`search_path`**, zodat ze wel bij de tabellen kunnen.
- Elke functie **controleert de pincode** voordat hij iets teruggeeft of verandert. Beheerfuncties (`kl_admin_…`) controleren ook `is_admin`.
- Pincodes staan als **hash** in de database (bcrypt via `crypt()` uit `pgcrypto`), nooit als leesbare tekst.

**Als één van deze punten niet klopt, kan iedereen met de openbare sleutel de gegevens van alle gebruikers lezen.** Controleer ze dus na elke databasewijziging.

## De databaselogica in git

De functies en instellingen staan in Supabase, niet automatisch in deze repository. Daarom bewaren we een kopie in `supabase/schema.sql`. Zo zie je wat er veranderd is, kan iemand meekijken, en kun je alles terugzetten als het misgaat.

**Kopie maken of bijwerken** (doe dit na elke wijziging in Supabase):

1. Open Supabase → *SQL Editor* → *New query*.
2. Plak de inhoud van `supabase/export.sql` en klik op *Run*. Dit leest alleen en laat geen gebruikersgegevens zien.
3. Kopieer het resultaat (één cel) naar `supabase/schema.sql`.
4. Commit dat bestand, het liefst in dezelfde pull request als de bijbehorende wijziging in de app.

Bovenaan `schema.sql` zie je per tabel of RLS aan staat (`rls=t`), welke policies er zijn en wie welke functie mag aanroepen. Dat zijn precies de punten uit de lijst hierboven.

## Veilig testen met een testdatabase

Normaal praat ook `npm run dev` met de echte database. Wil je iets proberen zonder echte gegevens te raken, of een databasefunctie aanpassen:

1. Maak in Supabase een tweede, gratis project, bijvoorbeeld `athlevon-test`, in een **EU-regio**.
2. Open daar de *SQL Editor* en voer `supabase/schema.sql` uit. Maak eerst de tabellen aan; die staan nog niet in de export (zie *Nog te doen* hieronder).
3. Kopieer `.env.example` naar `.env` en vul de URL en publishable key van het testproject in (*Project Settings* → *API*).
4. Start `npm run dev` opnieuw. De app praat nu met de testdatabase. Haal `.env` weg (of hernoem hem) om terug te gaan.

Test een databasewijziging eerst in het testproject. Werkt hij, voer dezelfde SQL dan uit in het echte project en werk `supabase/schema.sql` bij.

## Nog te doen

- [ ] `supabase/schema.sql` voor het eerst maken (zie hierboven) en de beveiligingspunten laten nalopen.
- [ ] De `create table`-opdrachten toevoegen, zodat een testproject in één keer op te zetten is. Met de [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) kan dat in één opdracht: `supabase db dump --schema public -f supabase/schema.sql` (daarvoor moet Docker draaien).
- [ ] Nagaan waar de wekelijkse back-up draait die in de privacyverklaring staat, en dat beschrijven in [PRIVACY.md](PRIVACY.md).
