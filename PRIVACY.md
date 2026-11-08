# Privacy (AVG)

Athlevon bewaart gezondheidsgegevens (gewicht, hartslag, voeding). Onder de AVG is dat een *bijzondere categorie* persoonsgegevens. Daarvoor gelden strengere regels. Jitse is de **verwerkingsverantwoordelijke**: hij beslist welke gegevens de app bewaart en waarom.

De privacyverklaring die gebruikers zien staat in `privacyHtml()` in `src/js/21-v6-privacy-toestemming-account-verwijderen.js`. **Klopt iets in dit document of in de app niet meer met die verklaring, pas de verklaring dan aan** en verhoog de versie en datum bovenaan. Verandert er iets wezenlijks (nieuwe soort gegevens, nieuw doel, nieuwe partij die gegevens krijgt), verhoog dan ook `CONSENT_V`. Dan vraagt de app iedereen opnieuw om toestemming.

## Wat de app al regelt

| AVG-eis | Waar in de app |
| --- | --- |
| Uitdrukkelijke toestemming voor gezondheidsgegevens | Toestemmingsscherm, `viewConsent()` |
| Informeren (privacyverklaring) | Uitleg → Privacy, `privacyHtml()` |
| Inzage en meenemen van je gegevens | Uitleg → Back-up downloaden |
| Verwijderen | Profiel → Account verwijderen, `kl_profile_delete_self` |
| Niet langer bewaren dan nodig | Details na 3 maanden samengevat, `src/js/22-…` |
| Leeftijd | Toestemming voor 16+ of met ouder |

## Welke partijen gegevens krijgen

| Partij | Wat | Waarom | Afspraak |
| --- | --- | --- | --- |
| Supabase | Alle gegevens in de app | Database | [Verwerkersovereenkomst (DPA)](https://supabase.com/legal/dpa): ondertekenen via het Supabase-dashboard. Controleer dat het project in een **EU-regio** staat (*Project Settings* → *General*). |
| Cloudflare (Workers) | IP-adres en technische gegevens van bezoekers | Hosting | [DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) geldt automatisch. Cloudflare is Amerikaans en valt onder het EU-VS Data Privacy Framework. |
| Open Food Facts | Alleen de zoekterm | Producten zoeken | Geen persoonsgegevens |
| GitHub | Wekelijkse back-up (zie privacyverklaring) | Back-up | Nagaan waar die draait en dat de repository privé is |

## Checklist voor Jitse

- [ ] Supabase-project staat in een EU-regio.
- [ ] Supabase-DPA ondertekend.
- [ ] Databasebeveiliging nagelopen (zie [DATABASE.md](DATABASE.md)).
- [ ] Back-ups: draaien ze, zijn ze privé, worden ze na 3 maanden echt verwijderd?
- [ ] Ingestuurde suggesties (`kl_feedback`): na hoeveel tijd ruim je ze op? Zet dat in de privacyverklaring.
- [ ] Gedeelde links (`kl_shares`): verlopen of opruimen na een tijd?

## Als iemand iets vraagt

Je moet binnen **een maand** reageren.

- **"Welke gegevens heb je van mij?"** De gebruiker kan zelf een back-up downloaden. Lukt dat niet, maak de export dan via de database (alle rijen in `kl_docs` met zijn `profile_id`, plus `kl_profiles`, `kl_feedback`, `kl_links`, `kl_shares`).
- **"Verwijder mijn gegevens."** Kan zelf via Profiel → Account verwijderen. Als beheerder kan het ook via het beheerscherm. Denk aan de back-ups: die verlopen vanzelf na 3 maanden. Zeg dat erbij.
- **"Pas iets aan."** Kan de gebruiker in de app zelf.

## Als er iets misgaat (datalek)

Kunnen anderen gegevens hebben gezien die niet voor hen bedoeld waren, bijvoorbeeld door een fout in een databasefunctie of een uitgelekte sleutel?

1. Dicht het lek eerst: zet de functie uit of verander de sleutel in Supabase.
2. Schrijf op wat er gebeurde, wanneer, welke gegevens en van wie.
3. Bij gezondheidsgegevens moet je het binnen **72 uur** melden bij de [Autoriteit Persoonsgegevens](https://autoriteitpersoonsgegevens.nl/themas/beveiliging/datalekken/datalek-melden) en de betrokken gebruikers inlichten.
