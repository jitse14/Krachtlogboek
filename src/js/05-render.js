/* ---------- render ---------- */
function statusHtml(){
  const m={loading:["","Laden…"],cloud:["ok","Online opgeslagen"],local:["warn","Alleen op dit apparaat"],error:["warn","Niet verbonden"],offline:["warn","Offline: wordt later verstuurd"]}[S.mode]||["",""];
  if(pid&&S.me)return `<div class="who"><span class="dot ${m[0]}" title="${m[1]}"></span><b>${esc(S.me.name)}</b><button class="qbtn" data-act="go-help" aria-label="Uitleg">?</button></div>`;
  return `<span class="dot ${m[0]}"></span><span>${m[1]}</span>`;
}
function render(){
  if(pid&&S.meta)applyGroups();
  const a=document.activeElement,fid=a&&a.id;let s1=null,s2=null;try{s1=a.selectionStart;s2=a.selectionEnd}catch(e){}
  document.getElementById("status").innerHTML=statusHtml();
  const nav=document.querySelector("nav.tabs");nav.hidden=!pid||(S.ready&&!consentOk());
  document.querySelectorAll("nav.tabs button").forEach(b=>{if(b.dataset.tab===UI.tab||(UI.tab==="together"&&b.dataset.tab==="profile"))b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  document.querySelector('nav.tabs [data-tab="profile"]')?.classList.toggle("has-badge",!!pid&&socialCount()>0);
  const v=document.getElementById("view");
  if(!S.profilesReady){renderSheet();return}
  if(!pid){v.innerHTML=viewLogin();renderSheet();restore(fid,s1,s2);return}
  if(!S.ready){v.innerHTML=`<div class="card empty" style="margin-top:16px"><strong>${S.mode==="offline"?"Geen internet":"Logboek laden"}</strong><p class="muted">${S.mode==="offline"?"Je logboek kon niet geladen worden. Open de app opnieuw zodra je verbinding hebt.":`De schema's en records van ${esc(S.me?.name||"")} verschijnen zo.`}</p></div>`;renderSheet();return}
  if(!consentOk()){v.innerHTML=viewConsent();renderSheet();restore(fid,s1,s2);return}
  v.innerHTML=(S.readonly?`<div class="banner">Je hebt alleen leesrechten. Wijzigingen worden niet opgeslagen.</div>`:"")+({train:viewTrain,plan:viewPlan,schemas:viewSchemas,records:viewRecords,profile:viewProfile,food:viewFood,help:viewHelp,news:viewNews,privacy:viewPrivacy,together:viewTogether,kennis:viewKennis}[UI.tab]||viewTrain)();
  renderSheet();restore(fid,s1,s2);
}
function restore(fid,s1,s2){if(fid){const el=document.getElementById(fid);if(el&&el!==document.activeElement){el.focus({preventScroll:true});try{if(s1!=null)el.setSelectionRange(s1,s2)}catch(e){}}}}

function viewLogin(){
  if(UI.login==="privacy")return `<div class="card privacy" style="margin-top:16px">${privacyHtml()}</div><button class="linkbtn" data-act="login-back">← Terug</button>`;
  if(UI.login==="code"||!code){
    return `<div class="login"><p class="q">Welkom bij Athlevon</p><div class="card stack"><label class="f">Groepscode<input type="text" id="gc-code" autocomplete="off" autocapitalize="characters" placeholder="Vraag de code aan je groep"></label><button class="btn primary" data-act="submit-code">Verder</button></div><p class="small muted">Je vult de groepscode alleen de eerste keer in op dit apparaat.</p></div>`;
  }
  if(UI.login==="setpin"&&UI.pinFor){
    return `<div class="login"><p class="q">Kies je persoonlijke code</p><div class="card stack"><p class="hp">Hoi ${esc(UI.pinFor.name)}, je account heeft nog geen code. Kies er een van minimaal 6 tekens. Daarmee log je voortaan in.</p><label class="f">Code<input type="password" id="pin-1" autocomplete="new-password"></label><label class="f">Herhaal code<input type="password" id="pin-2" autocomplete="new-password"></label><button class="btn primary" data-act="submit-firstpin">Code instellen</button></div><button class="linkbtn" data-act="login-back">Terug</button></div>`;
  }
  if(UI.login==="new"){
    return `<div class="login"><p class="q">Nieuw account</p><div class="card stack"><label class="f">Je naam<input type="text" id="np-name" value="${esc(UI.newName)}" placeholder="Je voornaam" autocomplete="off"></label>
      <label class="f">Persoonlijke code<input type="password" id="np-pin" autocomplete="new-password" placeholder="minimaal 6 tekens"></label>
      <label class="f">Herhaal code<input type="password" id="np-pin2" autocomplete="new-password"></label>
      <p class="hp small muted">Je krijgt automatisch de map "Krachttraining 3 dagen split". Andere voorbeeldmappen voeg je later toe onder Schema's.</p>
      ${consentBoxes("np-")}
      <button class="btn primary" data-act="create-profile">Account aanmaken</button></div><p class="small muted">Je logt voortaan in met je naam en deze code. Vergeet je hem, dan kan Jitse een nieuwe instellen.</p><button class="linkbtn" data-act="login-back">Ik heb al een account</button></div>`;
  }
  return `${UI.pendingShare?`<div class="banner">Je hebt een gedeeld schema geopend. Log in om het toe te voegen.</div>`:""}<div class="login"><p class="q">Inloggen</p><div class="card stack"><label class="f">Naam<input type="text" id="li-name" value="${esc(UI.loginName)}" autocomplete="username" autocapitalize="words" placeholder="Je naam"></label><label class="f">Persoonlijke code<input type="password" id="li-pin" autocomplete="current-password"></label><button class="btn primary" data-act="submit-login">Inloggen</button></div><p class="small muted">Code vergeten? Vraag Jitse om een nieuwe in te stellen.</p><button class="linkbtn" data-act="login-new">Nieuw hier? Account aanmaken</button><button class="linkbtn" data-act="login-privacy">Privacyverklaring</button></div>`;
}

function viewTrain(){
  if(draft)return viewWorkout();
  if(UI.cardio)return viewCardio();
  if(UI.coach&&S.me&&S.me.isAdmin)return viewCoach();
  let h=socialBanner()+newsBanner()+queueBanner()+wcCard()+viewPlanCard()+`<h2>Training starten</h2>`+trainStartList();
  if(spCardio().length)h+=`<h2>${spFit()||spRun()||spOn("bike")?"Duurtraining":"Sport"}</h2><div class="btnrow">${spCardio().map(s=>`<button class="btn" data-act="c-new" data-v="${s}">+ ${esc(spCardioLbl(s))}</button>`).join("")}</div>`;
  const recent=sortedSessions().slice(0,6);
  if(recent.length){
    h+=`<h2>Recente trainingen</h2><div class="recgroup">`+recent.map(s=>{const nSets=(s.entries||[]).reduce((t,e)=>t+e.sets.length,0);
      if(s.kind==="cardio")return `<button class="row" data-act="open-session" data-id="${s.id}"><span class="n">${esc(s.trail?"Trailrunnen":s.sport)}${s.purpose?` <span class="chip">${esc(s.purpose)}</span>`:""}</span><span class="b none">${dateTxt(s.date)}</span><span class="l">${cardioSummary(s)}</span></button>`;
      return `<button class="row" data-act="open-session" data-id="${s.id}"><span class="n">${esc(s.routineName||"Training")}</span><span class="b none">${dateTxt(s.date)}</span><span class="l">${(s.entries||[]).length} oefeningen · ${nSets} sets</span></button>`}).join("")+`</div>`;
  }

  return h;
}

function viewWorkout(){
  let h=`<div class="wohead"><div class="title">${esc(draft.routineName)}</div><label class="f">Datum<input type="date" id="d-date" value="${esc(draft.date)}"></label></div>${musicBtn()}${progBanner()}<h2>Oefeningen</h2><div class="stack">`;
  if(!draft.entries.length)h+=`<div class="card empty"><p class="muted">Nog geen oefeningen in deze training. Voeg er een toe om te beginnen.</p></div>`;
  draft.entries.forEach((e,i)=>{
    const best=bestFor(e.exId),last=lastFor(e.exId);
    const otherSchema=last&&last.name&&last.name!==draft.routineName?` · ${esc(last.name)}`:"";
    h+=`<article class="card ex"><header><div><h3>${esc(exName(e.exId,e.name))}</h3><span class="chip">${esc(exGroup(e.exId,e.group))}</span></div><div class="icons">
      <button class="ib" data-act="ex-up" data-i="${i}" aria-label="Omhoog" ${i===0?"disabled":""}>↑</button>
      <button class="ib" data-act="ex-down" data-i="${i}" aria-label="Omlaag" ${i===draft.entries.length-1?"disabled":""}>↓</button>
      <button class="ib" data-act="ex-remove" data-i="${i}" aria-label="Verwijder oefening">✕</button></div></header>
      <dl class="refs"><div class="best"><dt>Hoogste</dt><dd>${best?setTxt(best.set)+`<small>${dateTxt(best.date)}</small>`:`—<small>nog geen record</small>`}</dd></div>
      <div><dt>Laatste</dt><dd>${last?`${last.sets.length} sets · ${last.sets.map(shortSet).join(" · ")}<small>${dateTxt(last.date)}${otherSchema}</small>`:`—<small>eerste keer</small>`}</dd></div>
      ${(()=>{const t=progTip(e);return t?`<div class="target prog"><dt>Vandaag</dt><dd>${esc(t)}</dd></div>`:""})()}${e.target?`<div class="target"><dt>Schema</dt><dd>${e.target.sets||e.target.reps?`${esc(e.target.sets||"?")} sets × ${esc(e.target.reps||"?")} reps`:""}${e.target.note?`<small>${esc(e.target.note)}</small>`:""}</dd></div>`:""}</dl>
      <div class="sets"><div class="setrow sethead"><span>Set</span><span>Kg</span><span>Reps</span><span></span><span></span></div>`;
    e.sets.forEach((st,j)=>{const ph=placeholderFor(e,j);
      h+=`<div class="setrow"><button class="setn" data-act="fill" data-i="${i}" data-j="${j}" aria-label="Neem waarden van vorige keer over">${j+1}</button>
        <input class="num" id="s-${i}-${j}-k" inputmode="decimal" autocomplete="off" placeholder="${ph?(ph.k?String(ph.k).replace(".",","):"BW"):"kg"}" value="${esc(st.k)}" aria-label="Kg set ${j+1}">
        <input class="num" id="s-${i}-${j}-r" inputmode="numeric" autocomplete="off" placeholder="${ph?ph.r:"reps"}" value="${esc(st.r)}" aria-label="Herhalingen set ${j+1}">
        <span class="flag" id="f-${i}-${j}">${rowIsPR(e,st)?"PR":""}</span>
        <button class="ib" data-act="set-remove" data-i="${i}" data-j="${j}" aria-label="Verwijder set">✕</button></div>`});
    h+=`</div>${last?`<p class="hint">Tik op een setnummer om het resultaat van vorige keer over te nemen. Leeg kg = bodyweight.</p>`:`<p class="hint">Leeg kg = bodyweight.</p>`}<button class="btn block addset" data-act="add-set" data-i="${i}">+ Set</button>${exNoteUI(e,i)}</article>`;
  });
  h+=`<button class="btn block" data-act="pick" data-mode="draft">+ Oefening toevoegen</button></div><h2>Afronden</h2>${togetherRow("d")}<label class="f" style="margin-bottom:10px">Opmerking <i>optioneel</i><textarea id="d-note" rows="2" placeholder="Hoe ging het? Bijv. zware benen, nieuwe techniek geprobeerd.">${esc(draft.note||"")}</textarea></label>`;
  if(UI.confirm==="cancel")h+=`<div class="confirm"><span>Training weggooien? Ingevulde sets gaan verloren.</span><div class="btnrow"><button class="btn danger" data-act="cancel-yes">Weggooien</button><button class="btn" data-act="confirm-no">Doorgaan met trainen</button></div></div>`;
  else h+=`<div class="btnrow"><button class="btn primary" data-act="finish">Training opslaan</button><button class="btn ghost" data-act="cancel">Weggooien</button></div>`;
  return h;
}

function viewEditor(){
  const e=UI.edit;
  let h=`<h2>${e.id&&S.routines[e.id]?"Schema bewerken":"Nieuw schema"}</h2><div class="card stack"><label class="f">Naam<input type="text" id="re-name" value="${esc(e.name)}" placeholder="Bijv. Dag 1 — Push"></label><label class="f">Map<select id="re-folder"><option value="">Zonder map</option>${folderList().map(f=>`<option value="${f.id}" ${e.folderId===f.id?"selected":""}>${esc(f.name)}</option>`).join("")}</select></label>${catChips("cat-re",e.cat)}<div>`;
  if(!e.items.length)h+=`<p class="muted small" style="margin:4px 0">Voeg je eerste oefening toe.</p>`;
  e.items.forEach((it,i)=>{h+=`<div class="edititem"><div><strong>${esc(exName(it.exId))}</strong> <button class="chip chipbtn" data-act="open-ex" data-id="${it.exId}" aria-label="Spiergroep van ${esc(exName(it.exId))} aanpassen">${esc(exGroup(it.exId))} ✎</button></div><div class="icons">
    <button class="ib" data-act="it-up" data-i="${i}" aria-label="Omhoog" ${i===0?"disabled":""}>↑</button><button class="ib" data-act="it-down" data-i="${i}" aria-label="Omlaag" ${i===e.items.length-1?"disabled":""}>↓</button><button class="ib" data-act="it-remove" data-i="${i}" aria-label="Verwijder">✕</button></div>
    <div class="tg"><label class="f">Doel sets<input type="text" inputmode="numeric" id="re-s-${i}" value="${esc(it.sets)}" placeholder="3"></label><label class="f">Doel reps<input type="text" id="re-r-${i}" value="${esc(it.reps)}" placeholder="8-10"></label><label class="f nf">Notitie <i>optioneel</i><input type="text" id="re-n-${i}" value="${esc(it.note||"")}" placeholder="Tempo, rust, gewicht of tip"></label></div></div>`});
  h+=`</div><button class="btn block" data-act="pick" data-mode="routine">+ Oefening toevoegen</button></div><div style="margin-top:12px" class="stack">`;
  if(UI.confirm==="del-routine")h+=`<div class="confirm"><span>Schema verwijderen? Je gelogde trainingen en records blijven bewaard.</span><div class="btnrow"><button class="btn danger" data-act="del-routine-yes">Verwijderen</button><button class="btn" data-act="confirm-no">Behouden</button></div></div>`;
  h+=`<div class="btnrow"><button class="btn primary" data-act="save-routine">Schema opslaan</button><button class="btn" data-act="close-editor">Annuleren</button></div>`;
  if(e.id&&S.routines[e.id]&&UI.confirm!=="del-routine")h+=`<button class="btn ghost danger" data-act="del-routine">Schema verwijderen</button>`;
  return h+`</div>`;
}

function viewRecords(){const ro=subOn("records","records"),t=ro?UI.recTab||"voortgang":"voortgang";return (ro?`<div class="seg seg2" style="margin-top:16px"><button class="segb" data-act="rec-tab" data-v="voortgang" aria-pressed="${t==="voortgang"}">Voortgang</button><button class="segb" data-act="rec-tab" data-v="records" aria-pressed="${t==="records"}">Records</button></div>`:"")+(t==="voortgang"?viewProgress():viewStrengthRecords()+viewCardioRecords())}
function viewStrengthRecords(){
  const q=UI.recQ.trim().toLowerCase();
  const seen=new Set();
  const list=Object.entries(S.exercises).filter(([xid])=>bestFor(xid)).sort((a,b)=>a[1].name.localeCompare(b[1].name)).filter(([,x])=>{const k=norm(x.name);if(seen.has(k))return false;seen.add(k);return !q||x.name.toLowerCase().includes(q)});
  let h=`<h2>Hoogste resultaten</h2><input type="search" id="rec-q" placeholder="Zoek een oefening" value="${esc(UI.recQ)}" autocomplete="off">`;
  if(!Object.keys(S.exercises).some(xid=>bestFor(xid)))return h+`<div class="card empty" style="margin-top:12px"><strong>Nog geen records</strong><p class="muted">Zodra je een training logt, verschijnt hier per spiergroep je zwaarste set: meeste kg, en bij gelijk gewicht de meeste reps.</p></div>`;
  if(!list.length)return h+`<p class="muted">Geen oefening gevonden voor "${esc(UI.recQ)}".</p>`;
  const groups=[...GROUPS,...new Set(list.map(([,x])=>x.group).filter(g=>!GROUPS.includes(g)))];
  for(const g of groups){
    const rows=list.filter(([,x])=>(x.group||"Overig")===g);
    if(!rows.length)continue;
    h+=`<h2>${esc(g)}</h2><div class="recgroup">`+rows.map(([id,x])=>{const b=bestFor(id),l=lastFor(id);
      return `<button class="row" data-act="open-ex" data-id="${id}"><span class="n">${esc(x.name)}</span>${b?`<span class="b">${setTxt(b.set)}</span>`:`<span class="b none">Nog niet gelogd</span>`}${l?`<span class="l">Laatste ${dateTxt(l.date)}: ${l.sets.map(shortSet).join(" · ")}${b?` · record ${dateTxt(b.date)}`:""}</span>`:""}</button>`}).join("")+`</div>`;
  }
  return h;
}


function viewHelp(){
  const steps=[
    ["Log in","De eerste keer vul je de groepscode in. Daarna log je in met je naam en persoonlijke code, of maak je een nieuw account aan. Je telefoon onthoudt dat je ingelogd bent tot je op <b>Uitloggen</b> tikt. Code vergeten? Jitse kan als beheerder een nieuwe instellen. Iedereen ziet alleen zijn eigen schema's, trainingen en records."],
    ["Mappen en schema's","In <b>Schema's</b> staan je schema's in mappen, bijvoorbeeld \"Fitness 4 dagen\". Maak een map met <b>+ Nieuwe map</b> en kies bij een schema in welke map het hoort. Iedereen krijgt de map \"Krachttraining 3 dagen split\"; de calisthenics-mappen met en zonder ringen voeg je toe onder <b>Voorbeeldmappen</b>."],
    ["Delen met vrienden","Tik bij een schema of map op <b>Delen</b>. Je krijgt een code van 6 tekens en een link die je via WhatsApp kunt sturen. De ander vult de code in bij <b>Schema's → Gedeeld schema toevoegen</b> en heeft het schema dan zelf, met eigen resultaten."],
    ["Plan je week","In <b>Planning</b> zie je je week. Tik bij een dag op <b>+ Plannen</b> en kies een schema, duurtraining, rustdag of andere sport. Vandaag geplande trainingen staan ook bovenaan in Trainen, met een knop om meteen te starten. Gedaan? Dan krijgt het vanzelf een vinkje."],
    ["Maak een schema","Ga naar <b>Schema's → Nieuw schema</b>. Geef het een naam, voeg oefeningen toe en vul eventueel een doel in, bijvoorbeeld 3 sets × 8-10 reps. Bestaat een oefening nog niet, typ dan de naam en kies de spiergroep. Bij elke oefening kun je een notitie zetten, zoals tempo of rusttijd."],
    ["Start een training","Tik in <b>Trainen</b> op een schema. Elke oefening toont je <b>Hoogste</b> set ooit en wat je de <b>Laatste</b> keer deed. Een losse training zonder schema kan ook."],
    ["Vul je sets in","Per set vul je kg en reps in. Leeg kg betekent bodyweight. Grijze getallen zijn je resultaat van vorige keer: tik op het setnummer om ze over te nemen. Met <b>+ Set</b> voeg je een set toe."],
    ["Sla op","Tik op <b>Training opslaan</b>. Sets zonder reps worden overgeslagen. Je training blijft bewaard als je tussendoor de app sluit, tot je opslaat of weggooit. Geen internet bij het opslaan? Dan blijft de training op je telefoon staan en wordt hij automatisch verstuurd zodra je weer verbinding hebt."],
    ["Bekijk je records","In <b>Voortgang → Records</b> staat per spiergroep je zwaarste set. Tik op een oefening voor de volledige geschiedenis, of om de naam of spiergroep aan te passen."],
    ["Log je duurtraining","Onder <b>Trainen → Duurtraining</b> log je hardlopen of wielrennen: duur, afstand, eventueel hartslag en een toelichting. Snelheid en tempo worden automatisch berekend. Neem duur, afstand en eventueel hartslag over uit je horloge-app. Bij hardlopen kies je ook of het een trail was. Andere sporten zoals voetbal kies je onder Anders."],
    ["Eerdere resultaten overzetten","Heb je eerdere resultaten of schema's in je notities, Excel of een andere app? Ga naar <b>Schema's → Oude trainingen of schema's → Inladen</b>. Kies <b>Met een AI</b>: kopieer de opdracht, plak die met je gegevens in ChatGPT, Gemini of Claude, en plak het antwoord terug in de app. Of kies <b>CSV-bestand</b> voor een export uit Strong, Hevy of je eigen tabel. Je ziet eerst wat er wordt ingeladen; dubbele trainingen worden overgeslagen. Tot 7 dagen later kun je het inladen ongedaan maken."],
    ["Voeding","In <b>Voeding</b> zie je je dagdoel op basis van je profiel en sportweek. Je kunt het zelf aanpassen, je voorkeuren voor eten instellen, drie voorbeelddagen met grammen bekijken, je eten registreren in het dagboek en een boodschappenlijst maken."],
    ["Privacy en bewaren","Details van trainingen, je voedingsdagboek en je planning worden 3 maanden bewaard en daarna samengevat; je records blijven altijd staan. Lees de <b>Privacyverklaring</b> onder Profiel. Daar kun je ook je account verwijderen."],
    ["Naar je agenda","Onder <b>Planning → Naar je agenda</b> zet je je trainingen in de agenda van je telefoon, met tijdstip en een herinnering. Op je horloge zetten kan met de hand, maar is wat omslachtig; de stappen staan daar ook."],
    ["Profiel en instellingen","Profiel heeft twee delen: <b>Persoonlijk</b> (je gegevens, beweging en gewicht) en <b>Instellingen</b> (samen trainen, tabbladen en sporten, muziek, je code en account)."],
    ["Trainer of trainingsmaatje","Bij <b>Samen trainen</b> kies je per persoon wat diegene mag. Met <b>Snel kiezen</b> zet je in één tik de vinkjes voor bijvoorbeeld een trainer (inplannen, al je trainingen, je agenda en voortgang zien) of een trainingsmaatje. Daarna kun je elk vinkje nog zelf aan- of uitzetten. Wie mag meekijken, ziet bij Jij helpt de knop <b>Meekijken</b>."],
    ["Mappen en schema's beheren","Bij Schema's tik je bij een map op <b>Naam en soort</b> om de naam te wijzigen of te kiezen of het fitness, HIIT of calisthenics is. Bij een schema doe je dat via <b>Bewerken</b>. Met <b>Archiveren</b> haal je een map of schema uit het zicht; onderaan bij <b>Archief</b> zet je het terug. Je trainingen en records blijven altijd bewaard."],
    ["Toelichting bij een oefening","Tik tijdens je training onder een oefening op <b>+ Toelichting</b>, bijvoorbeeld over je houding, een dropset, of dat reps hier seconden zijn. Je ziet het later terug bij de training."],
    ["Samen gesport","Deden jullie dezelfde training? Kies bij het opslaan <b>Samen gedaan met</b>; de training komt dan ook bij je maatje. Daarvoor moet die persoon je bij Samen trainen toestemming geven voor <b>Een training die we samen deden ook bij mij registreren</b>."],
    ["Tabbladen en sporten kiezen","Bij <b>Profiel → Tabbladen</b> kies je welke onderdelen je onderin ziet, en per tabblad welke onderdelen erin staan (bij Voeding blijft Advies altijd staan). Trainen en Profiel blijven altijd staan. Bij <b>Mijn sporten</b> kies je welke sporten je doet: de andere verdwijnen uit de keuzes bij trainen, schema's, sportschema op maat, de planning en kennis. Wat al gepland staat, blijft staan. Alles zet je zo weer aan."],
    ["Progressie","Bij elke oefening in je training staat onder <b>Vandaag</b> een doel: eerst 1 herhaling meer per set dan vorige keer. Haal je bij alle sets de bovenkant van de reeks (bijv. 12 bij 8-12), dan stelt de app een hoger gewicht voor. Een rustigere week staat er ook bij. Gaf je aan dat het te zwaar of te licht was, dan past het doel zich daarop aan."],
    ["Kennis","Onder <b>Kennis</b> vind je per sport (kracht, HIIT, calisthenics, hardlopen, wielrennen, zwemmen, duathlon, triathlon, trailrunnen en ultrarunnen) uitleg over materiaal, voeding en supplementen, techniek, blessures, opbouw per doel en het combineren van kracht en duur. Let op: dit is een test en nog niet gecontroleerd op juistheid."],
    ["Wegen","Weeg jezelf minimaal 1× per week, 's ochtends voor het ontbijt of 's avonds voor het slapen, altijd op dezelfde dag en hetzelfde moment. Vaker wegen? Houd dan vaste dagen aan, bijvoorbeeld maandag en vrijdag. Een afwijking op één dag is normaal; kijk naar de lijn."],
    ["Sportschema op maat","Onder <b>Planning → Sportschema op maat</b> (of via Schema's) kies je sporten (fitness, hardlopen, fietsen, zwemmen, een teamsport of een eigen sport) en hoe vaak je elke sport per week wilt doen, bijvoorbeeld 3× fitness, 1× fietsen, 1× hardlopen en 1× voetbal. Per sport kun je vaste dagen kiezen (zoals je teamtraining), en per dag aangeven of en van hoe laat tot hoe laat je kunt. Ook kies je je materiaal, blessures of klachten en of je een lange duurtraining wilt. Per duursport kies je een eigen doel (fitter, een afstand, sneller of een wedstrijd), of je traint samen voor een duathlon of triathlon. Je kiest zelf voor hoeveel weken (1, 2, 4, 6 of 8), en of er 2 trainingen op één dag mogen. In het resultaat tik je op een training om hem te verplaatsen of weg te halen, of je past de beschikbaarheid van één week aan. Het schema wordt elke week een stapje zwaarder, met regelmatig een rustigere week. Na elke training vraagt de app hoe het ging, en met de weekcheck stuurt het schema zichzelf bij. De coach maakt een plan van 1, 2, 4 of 8 weken (of tot een wedstrijd) dat zo goed mogelijk bij je wensen past, met genoeg herstel: nooit twee dagen achter elkaar dezelfde spiergroepen, rust tussen hardlooptrainingen en geen beendag vlak voor een lange duurtraining. Voor duursport gebruikt hij je laatste 3 trainingen en je langste training van de laatste 3 maanden, zodat je niet geblesseerd raakt."],
    ["Voortgang","Onder <b>Voortgang</b> zie je per week of per 4 weken hoe je ervoor staat: gewicht, calorieën, eiwit, trainingen, kracht en duursport. Groen is goed, oranje let op, rood bijsturen. Daaronder staat wat dat betekent en wat je kunt doen. Hoe meer je registreert (trainingen, eten en 2 à 3 keer per week je gewicht), hoe beter het advies."],
    ["Samen trainen","Onder <b>Profiel → Samen trainen</b> vraag je iemand op naam of je iets voor diegene mag klaarzetten. Accepteert die persoon, dan kies jij of hij of zij trainingen in je planning mag zetten, schema's of maaltijden mag sturen, of je resultaten mag zien, en of dat direct mag of eerst als voorstel komt. Intrekken kan altijd."],
    ["Suggesties","Mis je iets of werkt iets niet? Meld het via <b>Wat is er nieuw</b> (onder Profiel of bovenaan deze pagina). Jitse ziet je melding en laat weten wat ermee gebeurt."],
    ["Geplande trainingen","Maakt Jitse een training voor je, dan staat die bovenaan in <b>Trainen</b> onder <b>Op je planning</b>, met datum en uitleg. Tik op <b>Training loggen</b> als je hem gedaan hebt: je resultaat wordt gekoppeld en Jitse ziet het terug."],
    ["Vul je profiel in","In <b>Profiel</b> vul je je leeftijd, lengte, doel en trainingen per week in, en houd je je gewicht bij. Op basis daarvan berekent <b>Voeding</b> je dagelijkse calorieën, eiwit, koolhydraten en vet."]
  ];
  return `<button class="btn block" style="margin-top:16px" data-act="go-news">Wat is er nieuw in versie ${APP_VERSION} · suggesties</button><div class="btnrow" style="margin-top:8px"><button class="btn" data-act="go-video">Instructievideo</button><button class="btn" data-act="go-intro">Rondleiding</button></div><h2>Zo werkt het</h2><div class="stack">${steps.map((s,i)=>`<div class="card help"><span class="hn">${i+1}</span><div><strong>${s[0]}</strong><p>${s[1]}</p></div></div>`).join("")}</div>
  <h2>Hoe wordt een record bepaald?</h2><div class="card"><p class="hp">De set met de <b>meeste kg</b> wint. Bij gelijk gewicht telt de set met de <b>meeste reps</b>. Bodyweight-oefeningen worden dus op reps vergeleken. Haal je tijdens een training een record, dan verschijnt <b style="color:var(--pr)">PR</b> naast die set.</p></div>
  <h2>Tips</h2><div class="card"><ul class="hl">
    <li>Dezelfde oefening in meerdere schema's deelt één geschiedenis, zolang de naam gelijk is.</li>
    <li>Voor holds zoals een Hollow Body Hold vul je seconden in bij reps.</li>
    <li>Zet de pagina op je beginscherm: open de link in Safari, tik op het deelicoon en kies <b>Zet op beginscherm</b>. Zo blijf je ingelogd en wist Safari je niet-verstuurde gegevens niet.</li>
    <li>Een training verkeerd ingevoerd? Open hem onder <b>Trainen → Recente trainingen</b> en verwijder hem. Records worden opnieuw berekend.</li>
  </ul></div>
  <h2>Back-up</h2><div class="card stack"><p class="hp">Download een kopie van al je schema's en trainingen, of zet een eerdere back-up terug in dit account. Bestaande onderdelen met dezelfde naam worden daarbij overschreven.</p>
  ${UI.confirm==="import"&&UI.importObj?`<div class="confirm"><span>Back-up${UI.importObj.profile?" van "+esc(UI.importObj.profile):""} met ${Object.keys(UI.importObj.sessions||{}).length} trainingen en ${Object.keys(UI.importObj.routines||{}).length} schema's terugzetten in het account van ${esc(S.me?.name||"")}?</span><div class="btnrow"><button class="btn primary" data-act="import-yes">Terugzetten</button><button class="btn" data-act="confirm-no">Annuleren</button></div></div>`:""}
  <div class="btnrow"><button class="btn" data-act="export-backup">Back-up downloaden</button><label class="btn" for="imp-file" style="text-align:center;display:grid;place-items:center">Back-up terugzetten</label></div><input type="file" id="imp-file" accept="application/json,.json" hidden></div>`;
}


