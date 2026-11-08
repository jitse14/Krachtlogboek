/* ---------- Kennis: achtergrondinformatie per sport (test, nog niet gecontroleerd) ---------- */
const knUl=(...a)=>`<ul class="hl">${a.map(x=>`<li>${x}</li>`).join("")}</ul>`,knP=t=>`<p class="hp">${t}</p>`,knH=t=>`<h4 class="knh">${t}</h4>`;
function knSupp(kind){const duur=kind==="duur"||kind==="ultra",it=[];
  if(!duur)it.push("<b>Creatine monohydraat</b>: 3-5 g per dag, elke dag (het tijdstip maakt weinig uit, een laadfase is niet nodig). Het best onderzochte supplement voor kracht, spiermassa en korte, zware inspanningen. Je kunt 0,5-1 kg zwaarder worden door extra vocht in je spieren.");
  it.push("<b>Cafeïne</b>: 3-6 mg per kg lichaamsgewicht, 30-60 min voor "+(duur?"een zware training of wedstrijd; bij lange wedstrijden ook later onderweg (bijv. een gel met cafeïne)":"de training")+". Niet laat op de dag, want het verstoort je slaap. Voor gezonde volwassenen geldt ± 400 mg per dag als veilige bovengrens.");
  if(duur)it.push("<b>Sportdrank, gels en elektrolyten</b>: voor trainingen en wedstrijden van meer dan ± 75-90 minuten, en bij warmte. Zie hierboven hoeveel per uur.");
  it.push("<b>Eiwitpoeder</b>: handig om je eiwit te halen"+(duur?", bijvoorbeeld direct na een lange training":"")+", maar niet beter dan gewoon eten (kwark, yoghurt, vlees, vis, eieren, peulvruchten).");
  const kr=kind==="kracht"||kind==="hiit";
  it.push("<b>Multivitamine</b>: als je gevarieerd eet meestal niet nodig, en het maakt je niet sterker of sneller. "+(kr?"Wel zinvol als je lang in een calorietekort zit (afvallen of droogtrainen): dan eet je minder en krijg je makkelijker te weinig binnen.":"Train je veel, dan eet je meestal ook meer en krijg je vanzelf meer vitamines en mineralen binnen. Wel zinvol als je eet om af te vallen, of als je weinig groente en fruit eet.")+" Eet je veganistisch, dan heb je in elk geval vitamine B12 nodig.");
  it.push("<b>Omega-3 (visvetzuren EPA en DHA)</b>: de Gezondheidsraad adviseert 1× per week vis, bij voorkeur vette vis (zalm, makreel, haring). Eet je geen vis, dan kan visolie of algenolie (± 250-500 mg EPA + DHA per dag) dat aanvullen. "+(kr?"Het maakt je niet sterker; mogelijk helpt het een beetje tegen spierpijn na zware trainingen, maar het bewijs is beperkt.":"Voor je uithoudingsvermogen of herstel is het bewijs beperkt; het is vooral goed voor je algemene gezondheid en je hart.")+"");
  it.push("<b>Vitamine D</b>: veel Nederlanders hebben in de winter weinig vitamine D. De Gezondheidsraad adviseert extra vitamine D voor bepaalde groepen, zoals mensen die weinig buiten komen of een donkere huid hebben. "+(kr?"Train je vooral binnen, dan geldt dat eerder voor jou.":"Train je veel buiten, dan maak je in de zomer zelf meer aan; in de winter niet.")+" Twijfel je, overleg dan met je huisarts.");
  it.push("<b>Magnesium</b>: een tekort is zeldzaam als je gevarieerd eet (volkoren, noten, peulvruchten, groente). Zonder tekort verbetert extra magnesium je prestaties niet. "+(kr?"Voor spiergroei of kracht is er geen bewijs dat het helpt.":"Via zweet verlies je vooral zout (natrium) en weinig magnesium. Spierkramp heeft vaker met vermoeidheid te maken dan met een tekort"+(kind==="ultra"?"; bij lange wedstrijden zijn zout en elektrolyten belangrijker":"")+".")+" Neem je het toch, houd de dosis laag: meer dan ± 250 mg per dag uit supplementen kan diarree geven.");
  if(duur)it.push("<b>IJzer</b>: alleen bij een aangetoond tekort (komt vaker voor bij vrouwen en lopers). Slik het niet op de gok; laat het via je huisarts testen.");
  return knH("Supplementen (legaal, voor de gewone sporter)")+knP("Supplementen zijn de laatste 1-5%. Eerst moeten eten, slapen en trainen op orde zijn.")+knUl(...it)+
  knP("<b>Veilig kiezen:</b> neem bij voorkeur supplementen met het NZVT-keurmerk of het Informed Sport-keurmerk; daarbij is de kans op vervuiling met verboden stoffen kleiner. Blijf weg van \"fat burners\", pre-workouts met onbekende oppeppers en testosteron-boosters. Prohormonen, SARMs en anabolen zijn doping en gevaarlijk voor je gezondheid. Gebruik je medicijnen, ben je zwanger of heb je hartklachten? Overleg dan eerst met je huisarts.")}
const KN_BASIS=knH("De basis: eiwit, koolhydraten en vetten")+knUl(
  "<b>Energie</b>: hoeveel je in totaal eet, bepaalt of je aankomt, gelijk blijft of afvalt. Je dagdoel staat bij <b>Voeding</b> in de app.",
  "<b>Eiwit</b>: bouwstof voor spieren, en het geeft een vol gevoel. Sporters: ± 1,6 g per kg lichaamsgewicht per dag.",
  "<b>Koolhydraten</b>: de brandstof voor zware training, opgeslagen als glycogeen in je spieren en lever. Krachtsporters ± 3-5 g per kg per dag, duursporters meer (zie hun eigen sport). Kies vooral volkoren producten, aardappelen, havermout en fruit; snelle koolhydraten (wit brood, banaan, honing) zijn handig vlak voor of na de training.",
  "<b>Vetten</b>: nodig voor je hormonen en voor de vitamines A, D, E en K. Ongeveer 20-35% van je energie. Vooral onverzadigd vet (olijfolie, noten, vette vis, avocado); beperk verzadigd vet (vet vlees, roomboter, veel kaas). Vlak voor de training liever weinig vet, want het verteert langzaam.",
  "<b>Groente, fruit en water</b>: ± 250 g groente en 2 stuks fruit per dag, en ± 1,5-2 liter drinken plus wat je bij het sporten verliest.")+
  knH("Waar zit veel in? (± per 100 g)")+`<table class="kntab"><tr><th>Eiwit</th><th>Koolhydraten</th><th>Vetten</th></tr>
  <tr><td>Kipfilet, bereid ± 30 g</td><td>Havermout ± 60 g</td><td>Olijfolie ± 12 g per eetlepel</td></tr>
  <tr><td>Tonijn uit blik ± 25 g</td><td>Rijst of pasta, droog ± 70-78 g (gekookt ± 25-30 g)</td><td>Noten ± 50-60 g</td></tr>
  <tr><td>Mager rundergehakt, bereid ± 25 g</td><td>Volkorenbrood ± 40 g (± 14 g per snee)</td><td>Pindakaas ± 50 g (en ± 25 g eiwit)</td></tr>
  <tr><td>Kaas ± 25 g (ook veel vet)</td><td>Aardappelen ± 15-17 g</td><td>Zalm ± 13 g (en ± 20 g eiwit)</td></tr>
  <tr><td>Skyr ± 11 g, magere kwark ± 9 g</td><td>Banaan ± 25 g per stuk</td><td>Avocado ± 15 g</td></tr>
  <tr><td>Ei ± 6-7 g per stuk</td><td>Rijstwafel ± 7 g per stuk</td><td>Pure chocolade ± 30-40 g</td></tr>
  <tr><td>Tofu ± 10-15 g, linzen of kikkererwten (gekookt) ± 8-9 g</td><td>Honing ± 80 g</td><td>Griekse yoghurt (vol) ± 10 g</td></tr>
  <tr><td>Wei-eiwitpoeder ± 20-25 g per schep</td><td>Krentenbol ± 30 g per stuk</td><td></td></tr></table>`+
  knP("<b>Voorbeeld</b>: weeg je 75 kg, dan is 1,6 g/kg ± 120 g eiwit per dag. Bijvoorbeeld: ontbijt 250 g magere kwark met havermout (± 28 g), lunch 3 boterhammen met kip en een ei (± 30 g), na de training een eiwitshake (± 22 g), avondeten 150 g kipfilet (± 45 g). Samen ± 125 g. Gebruik <b>Voeding</b> in de app om het bij te houden.")+
  knP("De waarden zijn afgerond; kijk voor precieze getallen op het etiket.");
const KN_BASISREF=knP("De basis over eiwit, koolhydraten en vetten, met een lijst van producten, staat bij <b>Kracht / fitness → Voeding</b>.");
const KN_TRISWIM=knH("Voor triathlon: de basis van borstcrawl")+knP("Voor een triathlon hoef je niet snel te zwemmen. Je doel is je afstand rustig en ontspannen borstcrawl te kunnen zwemmen, zodat je fris op de fiets stapt. Efficiënt zwemmen kost veel minder energie dan hard zwemmen.")+knUl(
  "<b>1. Rustig uitademen onder water</b>: blaas continu bellen. Dit is de basis; zonder dit raak je snel buiten adem.",
  "<b>2. Hoofd laag</b>: kijk naar de bodem. Dan komen je benen omhoog en lig je makkelijker.",
  "<b>3. Ademen opzij</b>: om de 2 of 3 slagen, wat het rustigst voelt. Draai je hoofd mee met je lichaam en til het niet op.",
  "<b>4. Lange slag</b>: strek je arm ver naar voren, draai mee vanuit je heup, en duw door tot bij je heup.",
  "<b>5. Kleine beenslag</b>: rustig vanuit de heup (bijv. 2 slagen per armcyclus). Je hebt je benen nog nodig voor fietsen en lopen.",
  "<b>Opbouw vanaf nul</b> (2-3× per week): eerst 8-10× 25 m met 20-30 s rust; dan 6× 50 m; dan 4× 100 m; dan 2× 200 m; en uiteindelijk je wedstrijdafstand aan één stuk. Ga pas naar de volgende stap als het ontspannen lukt.",
  "In triathlonwedstrijden mag je meestal elke zwemslag gebruiken. Even schoolslag om op adem te komen of om te kijken waar je bent, is dus geen probleem.",
  "<b>Open water</b>: oefen met kort vooruitkijken (sighting) om de 6-10 slagen, zwem in een wetsuit voordat je wedstrijd is (hij voelt strak, maar je drijft beter), en start rustig aan de zijkant of achterin de groep.",
  "Een paar lessen bij een zwem- of triathlonvereniging levert vaak meer op dan maanden alleen trainen.");
const KN_COMBI=knP("Kracht- en duurtraining gaan prima samen. Wel kan veel duurtraining de krachtwinst iets remmen, vooral explosiviteit en spiergroei (het \"interferentie-effect\"). Voor recreatieve sporters is dat effect klein als je je herstel goed plant.")+
  knH("Zo plan je het")+knUl(
  "<b>Zware dagen zwaar, rustige dagen rustig.</b> Zet een zware beentraining liever op dezelfde dag als een zware duurtraining (met minstens 6 uur ertussen) dan op je rustige dag. Dan blijven je rustige dagen echt rustig.",
  "Geen zware beentraining de dag vóór een lange duurtraining of intervaltraining.",
  "Op één dag allebei? Doe eerst wat het belangrijkst is voor je doel.",
  "2× per week kracht is genoeg voor duursporters; in een wedstrijdperiode is 1× per week genoeg om je kracht te behouden.",
  "Wie vooral kracht traint en duur toevoegt: 2-3× per week 30-45 min rustig (zone 2) verbetert je herstel tussen sets en je gezondheid, zonder veel spiermassa te verliezen. Fietsen en roeien belasten je benen minder dan hardlopen.",
  "Je verbruikt meer energie: eet genoeg, vooral koolhydraten rond de trainingen.")+
  knH("Hoe kracht je duursport helpt")+knUl(
  "Betere loop- of fietseconomie: je gebruikt minder energie per stap of trap.",
  "Je houdt het langer vol en hebt meer over voor heuvels en de eindsprint.",
  "Minder blessures: sterkere spieren en pezen kunnen meer belasting aan.",
  "Zwaar (3-6 herhalingen) plus springoefeningen werkt hiervoor beter dan veel lichte herhalingen.")+
  knH("Goede oefeningen per sport")+knUl(
  "<b>Hardlopen:</b> squat, Roemeense deadlift, split squat of lunges, step-ups, kuitheffen met gestrekte én gebogen knie, hip thrust, Copenhagen plank (binnenkant bovenbeen), Pallof press (romp) en kleine sprongetjes (pogo hops).",
  "<b>Fietsen:</b> squat of leg press, oefeningen op één been, Roemeense deadlift, rugstrekken en romp-oefeningen.",
  "<b>Zwemmen:</b> pull-ups of lat pulldown, roeien, buitenwaartse rotatie van de schouder, Y-T-W-oefening, romp, en squats en sprongen voor de afzet.");
const KN_BLES=knP("<b>Wanneer naar de huisarts of fysiotherapeut?</b> Bij pijn die erger wordt, zwelling, pijn in rust of 's nachts, uitstraling, tintelingen of krachtverlies, of als je na 1-2 weken minder belasten nog klachten hebt. Bij lichte klachten is minder belasten meestal beter dan helemaal stilzitten.");
const KN={
 kracht:{n:"Kracht / fitness",s:[
  ["Materiaal",knUl(
   "<b>Schoenen</b>: een platte, stevige zool geeft stabiliteit bij squats en deadlifts. Zachte hardloopschoenen geven minder grip. Gewichthefschoenen (harde, verhoogde hak) helpen bij diepe squats als je enkels stijf zijn; voor beginners zijn ze niet nodig.",
   "<b>Kleding</b>: ademend, met bewegingsvrijheid, en een handdoek.",
   "<b>Halterriem</b>: alleen voor zware squats en deadlifts dicht bij je maximum. De riem helpt druk in je romp op te bouwen. Leer eerst je romp aanspannen zonder riem.",
   "<b>Polsbanden</b> voor zware drukoefeningen. <b>Lifting straps</b> voor grip bij zware trekoefeningen; train je grip ook zonder.",
   "<b>Krijt (magnesium)</b> voor grip, als je sportschool het toestaat. <b>Kniebandages</b> geven warmte en comfort, maar zijn geen vervanging voor techniek.",
   "<b>Thuis</b>: verstelbare dumbbells, een bankje, weerstandsbanden, en een halterrek met veiligheidssteunen. Train nooit zwaar zonder veiligheid.")],
  ["Voeding",knUl(
   "<b>Eiwit</b>: ± 1,6 g per kg lichaamsgewicht per dag is voor de meeste mensen genoeg voor spieropbouw. Bij afvallen kan meer (tot ± 2,2 g/kg) helpen om spiermassa te behouden. Verdeel het over 3-5 momenten van 20-40 g.",
   "<b>Voor</b>: een maaltijd 2-3 uur ervoor met koolhydraten en eiwit, of een kleine snack 30-60 min ervoor (banaan, yoghurt, boterham).",
   "<b>Tijdens</b>: water. Bij trainingen tot ± 75 min heb je geen sportdrank nodig.",
   "<b>Na</b>: een maaltijd met eiwit en koolhydraten binnen een paar uur. Het \"anabole venster\" is ruimer dan vroeger gedacht; wat je over de hele dag eet, telt het meest.",
   "<b>Over de dag</b>: spieropbouw gaat het best met een klein overschot (± 200-300 kcal), vetverlies met een tekort van ± 300-500 kcal en veel eiwit. Slaap 7-9 uur.")+KN_BASIS+knSupp("kracht")],
  ["Sets en herhalingen",`<table class="kntab"><tr><th>Doel</th><th>Herhalingen</th><th>Sets / rust</th></tr><tr><td>Kracht</td><td>1-6, zwaar</td><td>3-5 sets, 2-5 min rust</td></tr><tr><td>Spiergroei</td><td>6-12 (5-30 werkt ook, mits dicht bij falen)</td><td>10-20 sets per spiergroep per week, 1-3 min rust</td></tr><tr><td>Spieruithouding</td><td>15+</td><td>2-3 sets, 30-60 s rust</td></tr></table>`+knUl(
   "<b>Zwaarte</b>: stop 0-3 herhalingen voor het falen. Beginners houden 1-2 herhalingen over.",
   "<b>Frequentie</b>: elke spiergroep ± 2× per week werkt beter dan 1× per week met hetzelfde aantal sets.",
   "<b>Progressie (dubbele progressie)</b>: werk binnen een reeks, bijvoorbeeld 8-12. Haal je bij alle sets 12, verhoog dan het gewicht (± 2,5 kg; bij kleine oefeningen 1-2 kg) en begin weer bij 8. De app geeft je hiervoor bij elke oefening een doel voor vandaag.",
   "<b>Beginners</b>: 2-3 sets per oefening is genoeg. Je wordt de eerste maanden snel sterker, vooral doordat je techniek en zenuwstelsel beter worden.",
   "<b>Rustweek (deload)</b> elke 4-8 weken: minder sets of lichter. Daarna kun je weer verder.")],
  ["Techniek en houding",knUl(
   "<b>Algemeen</b>: warm 5-10 minuten op, plus 1-3 lichtere sets van je eerste oefening. Gebruik een volledige bewegingsuitslag die je onder controle hebt, laat het gewicht in 2-3 seconden zakken, en adem in en span je romp aan vóór de zware fase.",
   "<b>Squat</b>: voeten ± schouderbreedte, tenen iets naar buiten. Knieën gaan in de richting van je tenen (niet naar binnen). Rug neutraal en gewicht midden op je voet. Zak zo diep als je met een neutrale rug kunt.",
   "<b>Deadlift</b>: stang dicht bij je schenen, rug neutraal (niet bollen). Heupen en schouders komen tegelijk omhoog en de stang blijft langs je benen. Strek uit met je heupen, zonder achterover te leunen.",
   "<b>Bankdrukken</b>: schouderbladen naar achteren en omlaag, voeten stevig op de grond. Stang naar de onderkant van je borst, ellebogen ± 45-70° van je lichaam (niet haaks). Gebruik een spotter of veiligheidssteunen.",
   "<b>Drukken boven je hoofd</b>: billen en buik aanspannen, niet hol trekken met je onderrug.",
   "<b>Roeien en pulldown</b>: start met je schouderbladen en trek zonder zwaaien.",
   "<b>Pijn</b>: bij scherpe of stekende pijn stop je de oefening. Spierpijn 1-3 dagen na de training is normaal.")],
  ["Veelvoorkomende blessures",knUl(
   "<b>Onderrug</b>: vaak door een bolle rug bij deadlift of squat, te snel te zwaar, of doorgaan als je vermoeid bent.",
   "<b>Schouder</b> (pijn bij drukken of boven je hoofd): veel drukken en weinig trekken, of ellebogen haaks bij bankdrukken. Zorg voor balans tussen druk- en trekoefeningen, en doe face pulls en rotatie-oefeningen.",
   "<b>Elleboog</b> (tennis- of golferselleboog): veel curls, pull-ups of grip, te snel opgebouwd.",
   "<b>Knie</b> (voorkant): squats en lunges te snel opgebouwd, of knieën die naar binnen zakken.",
   "<b>Pols</b>: zwaar drukken met een omgebogen pols.",
   "<b>Spierverrekking</b>: explosief of zwaar trainen zonder warming-up.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "<b>Sterker worden</b>: basisoefeningen (squat, deadlift, bankdrukken, drukken boven je hoofd, roeien), 3-6 herhalingen, 3-4 dagen per week, lange rust.",
   "<b>Spiermassa</b>: 6-12 herhalingen dicht bij falen, genoeg sets per spiergroep, en een klein calorie-overschot. Splits zoals bovenlichaam/benen of push/pull/legs.",
   "<b>Vetverlies</b>: krachttraining blijft de basis, zodat je je spiermassa houdt. Daarbij een calorietekort, veel eiwit en extra stappen of rustige duurtraining.",
   "<b>Algemeen fit</b>: 2-3× per week full body, plus conditie.",
   "<b>Welke indeling?</b> 2-3 dagen: full body. 4 dagen: bovenlichaam/benen. 5-6 dagen: push/pull/legs.",
   "Werk in blokken van 4-8 weken met daarna een rustweek; dat is ook hoe de app je sportschema opbouwt.")],
  ["Kracht en duur combineren",KN_COMBI]]},
 hiit:{n:"HIIT",s:[
  ["Materiaal",knUl(
   "<b>Schoenen</b> met demping én stevigheid opzij (cross-trainers) voor sprongen en richtingsveranderingen. Hardloopschoenen zijn opzij vaak minder stabiel.",
   "Een <b>mat</b>, een <b>timer-app</b> (bijv. een intervaltimer) en eventueel een <b>hartslagmeter</b>.",
   "<b>Thuis</b>: genoeg ruimte, een stroeve vloer, en let op harde vloeren en de buren bij sprongen.",
   "Optioneel: kettlebell, springtouw, roeitrainer, hometrainer of air bike.")],
  ["Voeding",knUl(
   "Niet met een volle maag: een maaltijd 2-3 uur ervoor, of een lichte snack ± 1 uur ervoor.",
   "HIIT draait op koolhydraten. Nuchter trainen kan, maar dan lukt een hoge intensiteit vaak minder.",
   "Na: eiwit en koolhydraten, en drink genoeg.")+KN_BASISREF+knSupp("hiit")],
  ["Werk en rust",knUl(
   "<b>Tabata</b>: 20 s maximaal, 10 s rust, 8 rondes (4 minuten). Echt maximaal, dus zwaar.",
   "<b>30/30 of 40/20</b>: 30 of 40 s werk met 30 of 20 s rust per oefening, in 3-6 rondes. Goed om mee te beginnen en op te bouwen.",
   "<b>EMOM</b> (every minute on the minute): elke minuut een vast aantal herhalingen; de rest van de minuut is rust.",
   "<b>4×4</b>: 4 minuten op ± 85-95% van je maximale hartslag, met 3 minuten rustig ertussen. Sterk voor je conditie (VO2max).",
   "<b>Opbouw</b>: begin met meer rust (30/30) en werk naar minder rust (40/20) of meer rondes. De app doet dit in je sportschema stap voor stap.",
   "<b>Hoe vaak</b>: maximaal 2-3× per week, niet op dagen achter elkaar. Zo blijft er tijd om te herstellen.")],
  ["Techniek en houding",knUl(
   "Warm 5-10 minuten op.",
   "<b>Landen</b> na een sprong: zacht, eerst op je voorvoet en dan je hele voet, knieën boven je tenen (niet naar binnen).",
   "<b>Burpees en mountain climbers</b>: rug recht in de plank, heupen niet omhoog en niet doorzakken.",
   "<b>Kettlebell swing</b>: beweging vanuit je heupen (scharnieren), niet tillen met je rug of armen.",
   "Kwaliteit gaat voor snelheid: zakt je techniek weg, pauzeer dan even of kies een lichtere variant.")],
  ["Veelvoorkomende blessures",knUl(
   "<b>Enkel verzwikken</b>: bij landen of zijwaartse sprongen, vaak als je moe bent.",
   "<b>Achillespees en kuit</b>: veel springen zonder opbouw.",
   "<b>Knie</b>: veel sprongen, en landen met knieën die naar binnen zakken.",
   "<b>Onderrug</b>: burpees of kettlebell swings met een bolle rug.",
   "<b>Overbelasting</b>: elke dag HIIT. Je lijf heeft tijd nodig om te herstellen.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "<b>Vetverlies en conditie</b>: 2× HIIT per week, plus 2-3× kracht en dagelijks bewegen. Het meeste verschil maakt je voeding.",
   "<b>Conditie (VO2max)</b>: 4×4 min of 5×3 min hard, op de fiets, roeitrainer of hardlopend.",
   "<b>Snelheid en explosiviteit</b>: kort en maximaal (sprints van 10-30 s, Tabata) met ruime rust.",
   "Combineer HIIT met rustige duurtraining: ± 80% rustig en 20% hard is voor de meeste mensen het beste recept.")],
  ["Kracht en duur combineren",KN_COMBI]]},
 cali:{n:"Calisthenics",s:[
  ["Materiaal",knUl(
   "<b>Optrekstang</b>: voor in een deurpost of vast aan muur of plafond. Controleer het maximale gewicht. Buiten kun je in een calisthenicspark trainen.",
   "<b>Ringen</b>: veelzijdig en instabiel, dus veel spierwerk. Je kunt ze hoog en laag hangen voor pull-ups, dips en rows.",
   "<b>Parallettes</b>: voor handstand, L-sit en push-ups die vriendelijker zijn voor je polsen.",
   "<b>Weerstandsbanden</b>: hulp bij pull-ups en dips terwijl je sterker wordt.",
   "<b>Dipstation</b>, <b>grips</b> (beschermen je handpalmen) en <b>krijt</b>. Een gewichtsvest of dipriem komt later, voor extra gewicht.")],
  ["Voeding",knUl(
   "Dezelfde basis als bij krachttraining: genoeg eiwit (± 1,6 g/kg), koolhydraten rond de training, en slaap.",
   "Je tilt je eigen gewicht: lichter maakt veel oefeningen makkelijker, maar extreem lijnen kost kracht en herstel.")+KN_BASISREF+knSupp("kracht")],
  ["Sets en herhalingen",knUl(
   "Je maakt het zwaarder met een moeilijkere <b>variant of hefboom</b>, niet met kilo's.",
   "<b>Push-up</b>: knieën → gewone push-up → voeten hoog → archer → push-up op één arm.",
   "<b>Pull-up</b>: australian rows → negatives (5 s laten zakken) → met band → gewone pull-up → met extra gewicht.",
   "<b>Dips</b>: op een bankje → aan de brug of ringen → met extra gewicht.",
   "<b>Benen</b>: squat → bulgarian split squat → pistol squat.",
   "Kies de moeilijkste variant waarmee je 5-12 herhalingen met goede techniek haalt. Haal je 12-15, ga dan naar de volgende stap.",
   "<b>Skills</b> (handstand, L-sit, front lever): oefen ze aan het begin van je training, als je fris bent, in korte blokken. Statische houdingen doe je in 3-5 sets van 10-30 s.")],
  ["Techniek en houding",knUl(
   "<b>Actief hangen</b>: schouders weg van je oren voordat je optrekt.",
   "<b>Hollow body</b>: buik aangespannen en onderrug plat. Dat is de basis voor bijna alles.",
   "<b>Volledige uitslag</b>: kin boven de stang en onderaan je armen gestrekt; bij dips tot je bovenarmen ± horizontaal zijn.",
   "Warm je polsen goed op voor handstand en planche.",
   "Ringen: draai bovenaan bij dips en support je handen iets naar buiten (\"turn out\") voor stabiliteit.")],
  ["Veelvoorkomende blessures",knUl(
   "<b>Elleboog</b>: veel pull-ups of muscle-ups, te snel opgebouwd.",
   "<b>Pols</b>: handstand of planche zonder opbouw.",
   "<b>Schouder</b>: dips te diep, of muscle-ups met slechte techniek.",
   "<b>Huid en vingers</b>: blaren en scheurtjes. Gebruik grips en houd eelt glad.",
   "De grootste valkuil: te snel naar moeilijke skills. Pezen worden langzamer sterk dan spieren.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "<b>Kracht</b>: zware varianten of extra gewicht, 3-6 herhalingen.",
   "<b>Spiermassa</b>: 8-15 herhalingen dicht bij falen, en genoeg sets.",
   "<b>Skills</b>: dagelijks kort oefenen, steeds net onder je maximum.",
   "Een full-body schema 3× per week (duwen, trekken, benen, romp) is voor de meeste mensen ideaal.")],
  ["Kracht en duur combineren",KN_COMBI]]},
 run:{n:"Hardlopen",s:[
  ["Materiaal",knUl(
   "<b>Schoenen laten aanmeten</b>: ga naar een gespecialiseerde hardloopwinkel of een loopcentrum. Daar meten ze je voeten en filmen ze je op de loopband. Kies uiteindelijk de schoen die tijdens het lopen het meest comfortabel voelt; dat blijkt een goede graadmeter.",
   "<b>Neutraal of stabiel</b>: een neutrale schoen voor de meeste lopers. Een stabiliteitsschoen geeft steun als je voet sterk naar binnen kantelt (overpronatie).",
   "<b>Demping</b>: meer demping is comfortabel bij lange afstanden; minder demping geeft meer gevoel met de grond.",
   "<b>Drop</b> (het hoogteverschil tussen hiel en teen, 0-12 mm): een lage drop belast je kuit en achillespees meer. Wissel daarom geleidelijk.",
   "<b>Zool</b>: een wegschoen voor asfalt; een trailschoen met grof profiel en meer grip voor bos en onverhard. <b>Carbonschoenen</b> zijn voor wedstrijden en snelle trainingen: efficiënter, maar minder stabiel, dus niet voor elke training.",
   "<b>Vervangen</b> na ± 500-800 km of als de demping op is. Afwisselen tussen twee paar is fijn.",
   "<b>Sokken</b>: naadloos en synthetisch of merino (geen katoen) tegen blaren. <b>Kleding</b>: ademende laagjes; kleed je alsof het ± 10 graden warmer is. In het donker: reflectie en een lampje.",
   "<b>Horloge of hartslagmeter</b> (een borstband is nauwkeuriger dan meten aan je pols). Bij lange duurlopen een heupband of bidon.")],
  ["Voeding",knUl(
   "<b>Voor</b>: een licht verteerbare maaltijd 2-3 uur ervoor, of een snack (banaan) 30-60 min ervoor. Weinig vezels en vet vlak voor het lopen.",
   "<b>Tijdens</b>: tot ± 75 min is water genoeg (bij warmte). Bij een lange duurloop of wedstrijd van meer dan 75-90 min: 30-60 g koolhydraten per uur (gels, sportdrank). Drink op dorst (± 400-800 ml per uur) en neem bij warmte zout (natrium).",
   "<b>Train je darmen</b>: oefen gels en sportdrank in je trainingen. Op de wedstrijddag niets nieuws.",
   "<b>Na</b>: koolhydraten en 20-30 g eiwit, en drinken.",
   "<b>Over de dag</b>: duursporters hebben meer koolhydraten nodig: ± 5-7 g per kg per dag bij ± 1 uur training per dag, meer bij veel volume. Eiwit ± 1,4-1,6 g per kg. Voor een wedstrijd van meer dan 90 min 1-2 dagen extra koolhydraten eten (carboloaden).",
   "<b>IJzer</b>: bij aanhoudende vermoeidheid kan een ijzertekort spelen, vooral bij vrouwelijke lopers. Laat dit via de huisarts testen.")+KN_BASISREF+knSupp("duur")],
  ["Techniek en houding",knUl(
   "<b>Houding</b>: rechtop, iets voorover vanuit je enkels, ontspannen schouders, armen ± 90° gebogen langs je lichaam (niet voor je borst kruisen), blik vooruit.",
   "<b>Pasfrequentie</b>: kleine, snelle passen en landen dicht onder je lichaam. Ver voor je landen met een gestrekte knie (overstriding) belast je knie en scheen. Je pasfrequentie 5-10% verhogen kan de belasting op je knie verminderen.",
   "<b>Hiel of voorvoet?</b> Dat maakt minder uit dan niet ver voor je lichaam landen. Verander je landing niet ineens.",
   "<b>Rustig is rustig</b>: bij een rustige training kun je nog praten.",
   "<b>Loopscholing</b> 1-2× per week: kniehef, hakken-billen, skippings, en 4-6 versnellingen (strides) van 80-100 m na een rustige loop.",
   "Warm altijd 5-10 minuten op met rustig inlopen.")],
  ["Veelvoorkomende blessures",knUl(
   "<b>Scheenbeenvliesontsteking</b>: pijn langs de binnenrand van je scheenbeen. Oorzaak: te snel opbouwen, harde ondergrond, versleten schoenen of zwakke kuiten. Pijn op één plek die ook in rust of 's nachts blijft, kan een stressfractuur zijn: ga dan naar je huisarts.",
   "<b>Lopersknie</b>: pijn rond of achter de knieschijf, erger bij traplopen en hurken. Vaak door te veel kilometers en zwakke heup- en bilspieren.",
   "<b>ITB-syndroom</b>: pijn aan de buitenkant van je knie, vaak na een vaste afstand. Door veel volume, veel afdalen en zwakke heupspieren.",
   "<b>Achillespees</b>: stijf in de ochtend en pijn bij het starten. Door te snel opbouwen, veel heuvels of snelheid, of een snelle overstap naar een schoen met lage drop.",
   "<b>Fasciitis plantaris</b>: hielpijn bij je eerste stappen in de ochtend.",
   "<b>Kuitverrekking of -scheur</b>: plotselinge pijn bij versnellen, vaak als je moe of niet opgewarmd bent. Bouw daarna rustig op, met kuitkracht.",
   "<b>Voorkomen</b>: geleidelijk opbouwen (± 10% per week), rustweken, krachttraining voor kuit, bil en heup, genoeg slaap, en afwisselen van ondergrond.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "<b>Rustige duurloop</b> (je kunt praten): ± 80% van je training. Bouwt je basisconditie, je vetverbranding en je pezen op.",
   "<b>Lange duurloop</b>: 1× per week, rustig, ± 25-30% van je weekvolume. Voor uithoudingsvermogen en om aan de afstand te wennen.",
   "<b>Tempoloop</b> (drempel): 20-40 min \"comfortabel zwaar\"; praten gaat in korte zinnen. Je kunt daarna langer een hoog tempo volhouden.",
   "<b>Intervallen</b>: 3-5 minuten rond je 5 km-tempo (bijv. 5× 1000 m) voor je conditie (VO2max); korte stukken van 200-400 m voor snelheid en een efficiëntere pas. Altijd met rust ertussen.",
   "<b>Per doel</b>: voor een snelle 5 km meer intervallen; voor een halve of hele marathon zijn de lange duurloop en tempo belangrijker.",
   "Bij 3 trainingen per week 1 snelle training, maximaal 2. Elke 3-4 weken een rustweek, en 1-2 weken voor je wedstrijd minder trainen (taperen).")],
  ["Kracht en duur combineren",KN_COMBI]]},
 bike:{n:"Wielrennen",s:[
  ["Materiaal",knUl(
   "<b>Soort fiets</b>: racefiets (asfalt, snel), gravelbike (asfalt en onverhard, bredere banden), mountainbike (bos en technisch terrein), of binnen op een fietstrainer met een app.",
   "<b>Maat en afstelling</b>: zet je hiel op het pedaal in de laagste stand; je been is dan gestrekt. Met je voorvoet op het pedaal is je knie dan licht gebogen. Is het zadel te laag, dan voel je het aan de voorkant van je knie; te hoog, dan aan de achterkant en wiegen je heupen. Rijd je veel of heb je klachten? Laat dan een bikefit doen.",
   "<b>Helm</b>: altijd. Let op het keurmerk (EN 1078). Een MIPS- of vergelijkbaar systeem beschermt extra bij een schuine klap. Vervang je helm na een val.",
   "<b>Gewone (platte) pedalen</b>: met normale schoenen, makkelijk en vertrouwd. Prima om mee te beginnen.",
   "<b>Klikpedalen</b>: je schoen klikt vast in het pedaal. Je zet efficiënter kracht en blijft stabiel op het pedaal. Uitklikken doe je door je hiel naar buiten te draaien.",
   "<b>SPD</b> (2 schroefgaten): een klein plaatje (cleat) verzonken in de zool, zodat je goed kunt lopen. Voor mountainbike, gravel, toerfietsen en binnen.",
   "<b>SPD-SL of Look Kéo</b> (3 schroefgaten): een groot plaatje en een stijve zool. Betere krachtoverbrenging op de weg, maar lastig lopen.",
   "<b>Float</b>: hoeveel graden je voet kan draaien in het pedaal. Een beetje float (bijv. 6°) is fijn voor je knieën.",
   "<b>Tip bij klikpedalen</b>: zet de veerspanning laag en oefen eerst stilstaand tegen een muur. Bijna iedereen valt in het begin een keer stil om.",
   "<b>Kleding</b>: een fietsbroek met zeem (zonder onderbroek eronder, na elke rit wassen), een shirt met rugzakken, handschoenen, een fietsbril en een windjack.",
   "<b>Banden</b>: houd de juiste bandenspanning aan; bredere banden kunnen met minder druk, wat comfortabeler is en vaak niet langzamer. Neem een reparatieset mee: binnenband, bandenlichters, pomp en multitool.",
   "<b>Versnellingen</b>: trap ± 80-95 omwentelingen per minuut en schakel vóór de heuvel terug.",
   "In het donker zijn voor- en achterlicht verplicht.",
   "Een fietscomputer, hartslagmeter of vermogensmeter (watt) helpt om gericht te trainen.")],
  ["Voeding",knUl(
   "Op de fiets kun je goed eten: eet vroeg en regelmatig, nog voordat je honger hebt.",
   "<b>Rustig tot 60-90 min</b>: water is genoeg.",
   "<b>1 tot 2,5 uur</b>: 30-60 g koolhydraten per uur.",
   "<b>Langer dan 2,5 uur</b>: tot 60-90 g per uur, bij voorkeur een mix van glucose en fructose (sportdrank, gels, repen, rijstwafels, banaan).",
   "<b>Drinken</b>: ± 500-750 ml per uur (een bidon), meer bij warmte, met elektrolyten (natrium).",
   "<b>Voor</b>: een koolhydraatrijke maaltijd 2-3 uur ervoor (havermout, brood). <b>Na</b>: koolhydraten en eiwit; na een lange rit flink bijvullen.",
   "<b>Over de dag</b>: ± 5-7 g koolhydraten per kg bij veel fietsen, meer na lange ritten; eiwit ± 1,4-1,6 g per kg.",
   "<b>Hongerklop</b>: plotseling leeg, slap en duizelig door een tekort aan koolhydraten. Voorkom het door op tijd te eten.")+KN_BASISREF+knSupp("duur")],
  ["Techniek en houding",knUl(
   "<b>Houding</b>: ontspannen schouders, ellebogen licht gebogen, rug neutraal, handen licht op het stuur.",
   "<b>Trappen</b>: rond trappen, met een soepele cadans van 80-95.",
   "<b>Bochten</b>: rem vóór de bocht, buitenste pedaal laag met je gewicht erop, kijk door de bocht heen.",
   "<b>Klimmen</b>: zittend in een lichte versnelling; staand voor korte, steile stukken.",
   "<b>In een groep</b>: rijd een rechte lijn, wijs gaten en obstakels aan, rem niet plotseling, en laat je voorwiel niet overlappen met het achterwiel voor je.")],
  ["Veelvoorkomende blessures",knUl(
   "<b>Knie</b>: zadel te laag (voorkant) of te hoog (achterkant), een verkeerd afgesteld schoenplaatje, of een te zware versnelling (lage cadans).",
   "<b>Lage rug</b>: een te gestrekte houding of een zwakke romp.",
   "<b>Nek en schouders</b>: een te lage voorkant, of krampachtig vasthouden.",
   "<b>Gevoelloze handen</b>: te veel gewicht op je handen. Wissel van greep en draag handschoenen.",
   "<b>Zadelpijn</b>: een verkeerd zadel of een verkeerde breedte, een slecht zeem of hygiëne.",
   "<b>Vallen</b>: sleutelbeen en pols zijn kwetsbaar. Fiets voorspelbaar en zichtbaar.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "<b>Duurrit</b> (rustig, je kunt praten): het grootste deel van je training. Bouwt je basis en je vetverbranding op.",
   "<b>Lange rit</b>: 1× per week, voor je uithoudingsvermogen en om eten en drinken te oefenen.",
   "<b>Sweet spot en drempel</b>: blokken als 2× 20 min net onder je FTP (wat je ± een uur volhoudt). Verhoogt je FTP.",
   "<b>VO2max-intervallen</b>: 3-6 min hard (bijv. 5× 4 min) met even lang rust.",
   "<b>Sprints</b> van 10-30 s voor explosiviteit, en <b>cadanstraining</b> (kort 100+ omwentelingen).",
   "<b>FTP-test</b>: 20 minuten zo hard mogelijk, × 0,95. Daarmee bepaal je je zones.",
   "Fietsen belast je gewrichten minder dan hardlopen, dus er is meer volume mogelijk. Bouw toch geleidelijk op en neem rustweken.")],
  ["Kracht en duur combineren",KN_COMBI]]},
 swim:{n:"Zwemmen",s:[
  ["Materiaal",knUl(
   "<b>Zwembril</b>: test of hij goed afsluit door hem zonder band tegen je ogen te drukken; blijft hij even zitten, dan past hij. Neem anti-condens en voor buiten getinte of spiegelende glazen.",
   "<b>Badmuts</b>: haar uit je gezicht en minder weerstand. Buiten een felle kleur, zodat je goed zichtbaar bent.",
   "<b>Zwemkleding</b>: strak en chloorbestendig.",
   "<b>Plankje</b>: om je beenslag te trainen. <b>Pull buoy</b> (tussen je benen): om je armen te trainen; je ligt er ook hoger mee.",
   "<b>Korte zwemvliezen</b>: voor techniek en beenslag. <b>Handpaddles</b>: voor kracht, maar ze belasten je schouders, dus alleen kort en met goede techniek.",
   "<b>Frontale snorkel</b>: om op je armslag te letten zonder te hoeven ademen.",
   "<b>Buiten zwemmen</b>: een wetsuit geeft drijfvermogen en warmte. Bij wedstrijden bepaalt de organisatie op basis van de watertemperatuur of een wetsuit verplicht, toegestaan of verboden is. Gebruik een zwemboei, zwem nooit alleen en controleer de waterkwaliteit.")],
  ["Voeding",knUl(
   "Ook in het zwembad zweet je: neem een bidon mee.",
   "Vroeg zwemmen? Neem iets kleins vooraf, zoals een banaan of een beschuit. Een grote maaltijd liever 2-3 uur ervoor.",
   "Bij trainingen van meer dan 75-90 min (bijvoorbeeld voor triathlon): koolhydraten in je bidon.",
   "Na: koolhydraten en eiwit. Zwemmen maakt vaak flink hongerig.",
   "<b>Over de dag</b>: train je veel, dan ± 5-7 g koolhydraten per kg en ± 1,4-1,6 g eiwit per kg.")+KN_BASISREF+knSupp("duur")],
  ["Techniek en houding",knP("Bij zwemmen levert techniek meer op dan alleen harder trainen. Een les of iemand die je filmt helpt enorm. Dit gaat vooral over de borstcrawl (vrije slag).")+knUl(
   "<b>Ligging</b>: zo horizontaal mogelijk. Hoofd in het verlengde van je rug, blik naar beneden en iets naar voren. Houd je je hoofd te hoog, dan zakken je benen.",
   "<b>Uitademen</b>: blaas onder water rustig en continu uit, door je neus en/of mond. Dan hoef je bij het draaien alleen in te ademen. Veel beginners houden hun adem in en raken daardoor snel buiten adem.",
   "<b>Ademen</b>: draai je hoofd mee met je lichaam, zonder het op te tillen; één brilglas blijft in het water. Om de 3 slagen (afwisselend links en rechts) helpt voor je balans; om de 2 mag ook.",
   "<b>Rotatie</b>: draai vanuit je heup en schouder rond je lengteas. Dat geeft een langere slag en maakt ademen makkelijker.",
   "<b>Armslag</b>: je hand gaat met de vingertoppen eerst het water in, vóór je schouder (niet over het midden). Strek uit, en \"pak\" dan het water met een hoge elleboog: je onderarm staat zo snel mogelijk verticaal. Duw door tot bij je heup. Bij het terugbrengen boven water blijft je elleboog hoog en ontspannen.",
   "<b>Beenslag</b>: vanuit je heup, benen bijna gestrekt, enkels ontspannen en voeten gestrekt, met een kleine slag. Bij triathlon dient de beenslag vooral voor je balans; spaar je benen voor fietsen en lopen.",
   "<b>Schoolslag</b>: de volgorde is trekken, ademen, trappen, glijden. Draai je voeten bij de beenslag naar buiten. De zweepslag belast de binnenkant van je knie.",
   "<b>Oefeningen</b>: beenslag op je zij met één arm vooruit (balans en ademen); catch-up (de ene arm wacht voor tot de andere aantikt); vingertoppen over het water slepen (hoge elleboog); sculling (watergevoel); beenslag met een plankje.")+KN_TRISWIM],
  ["Veelvoorkomende blessures",knUl(
   "<b>Zwemmersschouder</b>: overbelaste pezen in je schouder. Door te snel meer meters, je hand die het midden kruist, een lage elleboog, weinig rotatie, steeds naar één kant ademen, of veel met paddles. Voorkom het met geleidelijke opbouw, goede techniek, en oefeningen voor je rotatorcuff en schouderbladen.",
   "<b>Schoolslagknie</b>: pijn aan de binnenkant van je knie door de zweepslag. Wissel af met andere slagen.",
   "<b>Nek</b>: je hoofd te hoog houden of optillen om te ademen.",
   "<b>Onderrug</b>: hol trekken, vooral bij schoolslag en vlinderslag, of een te hoog hoofd.",
   "<b>Oren en huid</b>: ontstoken oren (zwemmersoor) en een geïrriteerde huid door chloor. Droog je oren goed en spoel na het zwemmen af.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "<b>Techniek</b>: elke training een paar oefeningen, vooral in je warming-up.",
   "<b>Uithouding</b>: langere blokken rustig, bijv. 4× 400 m met 30 s rust.",
   "<b>Drempeltempo (CSS)</b>: zwem 400 m en (na rust) 200 m zo snel mogelijk. Je CSS-tempo per 100 m = (tijd 400 m − tijd 200 m) ÷ 2. Dat is ongeveer het tempo dat je ± 30 min volhoudt. Train bijv. 10× 100 m op dat tempo met 10-20 s rust.",
   "<b>Snelheid</b>: korte stukken van 25-50 m snel, met ruime rust.",
   "<b>Opbouw</b>: ± 10% meer meters per week, en ook hier een rustweek.",
   "<b>Voor triathlon</b>: oefen in open water. Kijk om de 6-10 slagen kort vooruit om te oriënteren (sighting), en oefen een start in een groep.")],
  ["Kracht en duur combineren",KN_COMBI]]}
 ,duo:{n:"Duathlon",s:[
  ["Materiaal",knUl(
   "<b>Fiets</b>: een racefiets is ideaal; een gravelbike of mountainbike kan ook. Een opzetstuur (tijdritstuur) alleen als de wedstrijd het toestaat.",
   "<b>Helm</b>: verplicht. <b>Hardloopschoenen met elastische veters</b>: dan wissel je sneller.",
   "<b>Startnummerband</b>: zo draai je je nummer van achter (fietsen) naar voren (lopen). <b>Wedstrijdkleding</b>: een trisuit of strakke sportkleding waarin je kunt fietsen én lopen.",
   "Klikpedalen helpen op de fiets; met gewone pedalen en je hardloopschoenen wissel je juist sneller. Oefen beide in de training.")],
  ["Voeding",knUl(
   "Eet en drink vooral op de fiets: tijdens het lopen gaat dat lastiger.",
   "Wedstrijd korter dan ± 75 min: een goed ontbijt 2-3 uur ervoor en water is genoeg. Langer: 30-60 g koolhydraten per uur, bij lange afstanden tot 60-90 g per uur.",
   "Oefen je wedstrijdvoeding in je koppeltrainingen, zodat je maag eraan went.")+KN_BASISREF+knSupp("duur")],
  ["Wissels en wedstrijdtips",knUl(
   "<b>Volgorde</b>: lopen, wissel 1 (T1), fietsen, wissel 2 (T2), lopen.",
   "<b>Helm</b>: bij vrijwel alle wedstrijden zet je je helm op en vast vóórdat je je fiets pakt, en doe je hem pas af als je fiets weer in het rek hangt. Op- en afstappen doe je bij de lijn.",
   "<b>Stayeren</b> (in de slipstream van een ander fietsen) is bij de meeste wedstrijden voor recreanten verboden. Houd afstand; de regels staan in de wedstrijdinformatie.",
   "<b>Tempo</b>: de grootste fout is de eerste loop te snel. Fiets rustig genoeg om daarna nog goed te kunnen lopen. Zware benen in de eerste kilometer van de tweede loop zijn normaal; dat trekt meestal bij.",
   "Leg je spullen in de wisselzone in de volgorde waarin je ze nodig hebt, en loop vooraf de route door de wisselzone.")],
  ["Opbouw per doel",knUl(
   "Train 2-3× per week lopen en 2-3× fietsen, met vooral rustige trainingen en 1-2 snellere.",
   "<b>Koppeltraining</b>: fiets en loop direct daarna 10-20 min. Zo went je lijf aan de wissel. Ook lopen gevolgd door fietsen is goed om te oefenen.",
   "<b>Sprint en standaard</b>: tempo- en intervaltrainingen worden belangrijker. <b>Middellange en lange afstanden</b>: lange ritten en lange duurlopen, en oefen eten en drinken.",
   "Oefen wissels een paar keer in een training: schoenen, helm, nummer.")],
  ["Veelvoorkomende blessures",knUl(
   "Vooral de bekende hardloopblessures (scheen, achillespees, knie): lopen belast het meest. Bouw het lopen geleidelijk op.",
   "Kuit en achillespees kunnen extra opspelen bij lopen direct na het fietsen. Begin de tweede loop rustig.",
   "Fietsklachten (knie, rug, nek) hangen vaak samen met je fietsafstelling.")+KN_BLES],
  ["Kracht en duur combineren",KN_COMBI]]},
 tri:{n:"Triathlon",s:[
  ["Materiaal",knUl(
   "<b>Zwemmen</b>: zwembril (voor buiten getint), badmuts, en voor open water vaak een wetsuit. De organisatie bepaalt op basis van de watertemperatuur of een wetsuit verplicht, toegestaan of verboden is.",
   "<b>Fietsen</b>: racefiets (of wat je hebt voor een eerste kennismaking), helm verplicht. Een opzetstuur alleen als dat is toegestaan.",
   "<b>Lopen</b>: hardloopschoenen met elastische veters en een startnummerband.",
   "<b>Trisuit</b>: één pak voor zwemmen, fietsen en lopen, met een dun zeemlapje. Je hoeft je dan niet om te kleden.")],
  ["Voeding",knUl(
   "Ontbijt 2-3 uur voor de start. Tijdens het zwemmen eet je niets; de fiets is het moment om te eten en te drinken.",
   "Sprint (± 1-1,5 uur): water of sportdrank op de fiets is genoeg. Olympisch en langer: 30-60 g koolhydraten per uur; bij een halve of hele triathlon 60-90 g per uur, met genoeg drinken en zout.",
   "Oefen je wedstrijdvoeding in lange trainingen en koppeltrainingen.")+KN_BASISREF+knSupp("duur")],
  ["Zwemmen voor triathlon",KN_TRISWIM],
  ["Wissels en wedstrijdtips",knUl(
   "<b>Volgorde</b>: zwemmen, wissel 1 (T1), fietsen, wissel 2 (T2), lopen.",
   "<b>T1</b>: trek je wetsuit al lopend tot je middel naar beneden en daarna helemaal uit (oefen dit!). Zet je helm op en vast vóórdat je je fiets pakt.",
   "<b>T2</b>: fiets in het rek, helm pas daarna af, schoenen aan en lopen.",
   "<b>Stayeren</b> is bij de meeste wedstrijden voor recreanten verboden; houd afstand tot de fietser voor je. Lees de regels van je wedstrijd.",
   "<b>Tempo</b>: zwem rustig en ontspannen, fiets niet te hard (je moet nog lopen), en begin het lopen rustig. Zware benen in het begin van het lopen zijn normaal.",
   "Bekijk de wisselzone vooraf en leg je spullen klaar in de volgorde waarin je ze nodig hebt.")],
  ["Opbouw per doel",knUl(
   "Train elke sport 2-3× per week, met het meeste rustig. Besteed extra tijd aan je zwakste onderdeel; voor veel mensen is dat zwemmen.",
   "<b>Koppeltraining</b>: fietsen en direct daarna 10-20 min lopen, minstens elke 1-2 weken.",
   "<b>Supersprint en sprint</b>: goed haalbaar voor beginners met ± 8-12 weken voorbereiding, als je je zwemafstand ontspannen kunt zwemmen.",
   "<b>Olympisch</b>: meer duur, en zwem regelmatig 1,5 km aan één stuk. <b>Halve en hele</b>: maanden opbouw met lange ritten, lange duurlopen en voedingsstrategie; bouw ervaring op via kortere afstanden.",
   "Zwem een paar keer in open water voor je wedstrijd, het liefst in je wetsuit en onder begeleiding.")],
  ["Veelvoorkomende blessures",knUl(
   "Lopen geeft de meeste blessures (scheen, achillespees, knie): bouw geleidelijk op.",
   "Schouderklachten van zwemmen (zie Zwemmen), vaak door veel meters met slechte techniek.",
   "Knie-, rug- of nekklachten op de fiets door je afstelling.",
   "Te veel tegelijk willen: drie sporten samen is veel belasting. Plan rustweken en minstens 1 rustdag per week.")+KN_BLES],
  ["Kracht en duur combineren",KN_COMBI]]},
 trail:{n:"Trailrunnen",s:[
  ["Materiaal",knUl(
   "<b>Trailschoenen</b>: een zool met profiel (noppen) voor grip op modder en losse ondergrond. Een steenplaat (rock plate) beschermt tegen scherpe stenen. Meer demping is fijn bij lange afstanden; een lage, stevige schoen geeft meer gevoel en stabiliteit op technisch terrein.",
   "<b>Loopvest</b> met flessen of een drinkzak, voor water en eten.",
   "<b>Stokken</b>: handig bij veel hoogtemeters. Oefen er eerst mee in de training.",
   "<b>Jas</b> (waterdicht), hoofdlamp, en een route op je horloge of telefoon. Bij wedstrijden is er vaak verplichte uitrusting, zoals een jas, een nooddeken, een fluitje en drinken: check de regels.")],
  ["Voeding",knUl(
   "Je bent vaak langer onderweg dan bij een wegloop van dezelfde afstand. Begin na ± 45-60 min met eten: 30-60 g koolhydraten per uur.",
   "Naast gels werkt ook gewoon eten goed: een krentenbol, banaan, rijstwafels of repen.",
   "Drink regelmatig op dorst en neem bij warmte zout.")+KN_BASISREF+knSupp("duur")],
  ["Techniek en houding",knUl(
   "<b>Bergop</b>: kleine passen. Bij steile stukken is stevig wandelen (power hiking, eventueel handen op je knieën) vaak sneller en zuiniger dan rennen.",
   "<b>Bergaf</b>: ontspannen, korte snelle passen, iets voorover en niet achterover leunen. Kijk 3-5 meter vooruit en gebruik je armen voor balans.",
   "<b>Technisch terrein</b>: til je voeten goed op en zet ze bewust neer.",
   "Loop op tijd en gevoel, niet op tempo per kilometer: dat zegt op trails weinig.")],
  ["Veelvoorkomende blessures",knUl(
   "<b>Enkel verzwikken</b>: train je enkels met balansoefeningen (op één been staan, op een kussen).",
   "<b>Knie en dijen</b> bij lange afdalingen: veel spierpijn door het afremmen. Bouw afdalen geleidelijk op.",
   "<b>Vallen</b>: schaafwonden aan handen en knieën. Rustig aan op technische stukken.",
   "Ook de gewone hardloopblessures, zoals ITB-syndroom en achillespeesklachten.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "Plan je trainingen in tijd en hoogtemeters in plaats van kilometers.",
   "<b>Heuveltraining</b>: herhalingen bergop, en ook rustig bergaf lopen om je benen te laten wennen.",
   "<b>Lange duurloop</b> op terrein dat lijkt op je wedstrijd.",
   "<b>Kracht</b>: squats, step-ups, lunges en kuitheffen helpen bij klimmen en afdalen.",
   "Bouw geleidelijk op, net als bij hardlopen: ± 10% per week en rustweken.")],
  ["Kracht en duur combineren",KN_COMBI]]},
 ultra:{n:"Ultrarunnen",s:[
  ["Materiaal",knUl(
   "Alles van trailrunnen, plus een groter loopvest met ruimte voor eten, kleding en verplichte uitrusting.",
   "<b>Voeten</b>: reservesokken, en iets tegen schuren (bijv. vaseline of anti-schuurcrème). Blaren zijn een van de meest voorkomende redenen om uit te vallen.",
   "<b>Hoofdlamp met reservebatterij</b> als je in het donker loopt, en drop bags (tassen met spullen op verzorgingsposten) als de wedstrijd dat aanbiedt.")],
  ["Voeding",knUl(
   "Eten en drinken bepalen je wedstrijd. Mik op ± 200-300 kcal per uur, vaak 40-90 g koolhydraten, en begin al vroeg.",
   "Wissel zoet af met hartig, \"echt\" eten: aardappeltjes, broodjes, soep, chips. Je maag houdt dat beter vol.",
   "Neem zout of elektrolyten, zeker bij warmte. Drink regelmatig op dorst, maar niet veel meer: te veel water zonder zout kan gevaarlijk zijn (hyponatriëmie).",
   "Train je darmen: oefen in lange trainingen precies wat je in de wedstrijd wilt eten.",
   "Cafeïne kun je bewaren voor later in de wedstrijd, als je moe wordt.")+KN_BASISREF+knSupp("ultra")],
  ["Techniek en houding",knUl(
   "Heel rustig starten: je moet nog kunnen praten. Wandel vanaf het begin de klimmen.",
   "Denk in stukken: van verzorgingspost naar verzorgingspost.",
   "Luister naar je lijf: een probleem (een blaar, schuren, misselijkheid) los je meteen op, voordat het groter wordt.",
   "Voor bergop, bergaf en technisch terrein: zie Trailrunnen.")],
  ["Veelvoorkomende blessures",knUl(
   "Overbelasting: achillespees, scheen, knie en voet, door te snel opbouwen.",
   "Blaren en schuren. Test je schoenen, sokken en kleding op lange trainingen.",
   "Maag- en darmklachten, uitdroging of oververhitting.",
   "Herstel na een ultra duurt lang: neem ruim de tijd (vaak weken) voordat je weer zwaar traint.")+KN_BLES],
  ["Opbouw per doel",knUl(
   "Reken op minstens 16-24 weken opbouw, en meer bij lange afstanden of veel hoogtemeters. Een marathon of lange trail eerst is een goede stap.",
   "<b>Back-to-back</b>: in het weekend twee lange duurlopen op dagen achter elkaar (bijv. zaterdag en zondag). Zo train je lopen op vermoeide benen, zonder één extreem lange training.",
   "Train op tijd op de benen en hoogtemeters, en oefen lopen in het donker en met je uitrusting.",
   "Bouw je weekvolume geleidelijk op, met elke 3-4 weken een rustweek, en 2-3 weken voor de wedstrijd minder trainen.")],
  ["Kracht en duur combineren",KN_COMBI]]}

};
const KN_ORDER=["kracht","hiit","cali","run","bike","swim","duo","tri","trail","ultra"];
function viewKennis(){
  const ko=KN_ORDER.filter(spKnOk),k=KN[UI.kn]&&ko.includes(UI.kn)?UI.kn:(ko[0]||"kracht"),d=KN[k];
  return `<div class="wohead"><div class="title">Kennis</div></div>
    <div class="card insight in-warn" style="margin-top:6px"><p><b>Test · in ontwikkeling.</b> Deze informatie is nog niet gecontroleerd op juistheid (fact check). Het is algemene informatie, geen medisch of persoonlijk advies. Twijfel je of heb je klachten, overleg dan met een huisarts, fysiotherapeut of trainer.</p></div>
    <div class="chips" style="margin-top:12px">${ko.map(x=>`<button class="chipb" data-act="kn-sport" data-v="${x}" aria-pressed="${x===k}">${esc(KN[x].n)}</button>`).join("")}</div>
    <h2>${esc(d.n)}</h2><div class="stack">${d.s.map(([t,html],i)=>`<details class="card kndet" ${UI.knOpen===k+i?"open":""} data-kn="${k+i}"><summary><b>${esc(t)}</b></summary><div class="knbody">${html}</div></details>`).join("")}</div>`;
}
UI.kn=lsGet("krachtlogboek.kn")||"kracht";
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="kn-sport"]');if(!b)return;UI.kn=b.dataset.v;UI.knOpen=null;lsSet("krachtlogboek.kn",UI.kn);render()});
document.addEventListener("toggle",ev=>{const d=ev.target;if(d.classList&&d.classList.contains("kndet")&&d.open)UI.knOpen=d.dataset.kn},true);

