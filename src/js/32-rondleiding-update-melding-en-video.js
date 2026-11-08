/* ---------- rondleiding, update-melding en video ---------- */
const INTRO=[
  ["Welkom bij Athlevon","Je houdt hier je trainingen, voeding en voortgang bij, en ziet of je op koers ligt voor je doel. In een paar korte stappen zie je hoe het werkt. Liever kijken? Bekijk de korte instructievideo (± 1½ minuut) of de uitgebreide versie met alle functies."],
  ["Trainen","Onder <b>Trainen</b> start je een training uit je schema's. Per set vul je kg en herhalingen in; je vorige keer en je record staan erbij. Duurtrainingen log je met duur en afstand. Bij elke oefening staat een doel voor vandaag, zodat je elke keer een stapje verder komt."],
  ["Schema's","Je krijgt automatisch de map <b>Krachttraining 3 dagen split</b>. Je kunt schema's zelf maken, aanpassen en met anderen delen."],
  ["Planning","Plan je week vooruit. Met <b>Sportschema op maat</b> maakt de coach een plan voor al je sporten (fitness, duursport, teamsport) dat bij je wensen en agenda past, met genoeg herstel. Met <b>Naar je agenda</b> zet je trainingen in de agenda van je telefoon."],
  ["Voeding","Vul eerst je <b>Profiel</b> in: lengte, gewicht, doel en sportweek. Dan krijg je een dagdoel, kun je maaltijden en maaltijdplannen samenstellen, je eten bijhouden en een boodschappenlijst maken."],
  ["Kennis","Onder <b>Kennis</b> lees je per sport over materiaal, voeding, techniek, blessures en hoe je een schema opbouwt. Dit tabblad is nog in ontwikkeling."],
  ["Voortgang en samen","Onder <b>Voortgang</b> zie je met kleuren of je op koers ligt, met uitleg en advies. Met <b>Samen trainen</b> (onder Profiel) zetten vrienden met jouw toestemming trainingen voor je klaar. Tip: installeer de app op je beginscherm."]];
const UPDATE_HL=[["Samen trainen","geef een trainer of maatje toestemming om je trainingen en agenda te zien, en kies met één tik een rol zoals Trainer, Trainingsmaatje of Voedingscoach. Daarna pas je de vinkjes nog zelf aan."]];
function introSheet(sh){
  if(sh.mode==="update"){const c=CHANGELOG[0];
    return `<div class="sh"><h2>Nieuw in versie ${esc(c.v)}</h2><button class="ib" data-act="intro-done" aria-label="Sluiten">✕</button></div><div class="card"><ul class="hl">${UPDATE_HL.map(([t,x])=>`<li><b>${esc(t)}</b> ${esc(x)}</li>`).join("")}</ul><p class="small muted" style="margin:6px 0 0">Ook verbeterd: privacy en beveiliging. Bekijk ook wat er in eerdere versies kwam.</p></div>
      <div class="stack" style="margin-top:12px"><button class="btn primary" data-act="intro-done">Aan de slag</button><button class="btn" data-act="intro-video">Bekijk de instructievideo</button><button class="linkbtn" data-act="intro-news">Alles over deze versie en suggesties doorgeven</button></div>`}
  const i=sh.step||0,[t,b]=INTRO[i];
  return `<div class="sh"><h2>${esc(t)}</h2><button class="ib" data-act="intro-done" aria-label="Sluiten">✕</button></div><div class="card"><p class="hp" style="margin:0">${b}</p></div>
    <div class="dots" aria-hidden="true">${INTRO.map((_,k)=>`<span class="${k===i?"on":""}"></span>`).join("")}</div>
    <div class="btnrow" style="margin-top:8px">${i?`<button class="btn" data-act="intro-step" data-v="${i-1}">Vorige</button>`:`<button class="btn" data-act="intro-video">Bekijk de video</button>`}${i<INTRO.length-1?`<button class="btn primary" data-act="intro-step" data-v="${i+1}">Volgende</button>`:`<button class="btn primary" data-act="intro-done">Klaar</button>`}</div>
    ${i===0?`<button class="linkbtn" data-act="intro-done">Overslaan</button>`:""}`;
}
function videoSheet(sh){const long=sh&&sh.v==="lang",src=long?"instructievideo.mp4":"instructievideo-kort.mp4";
  return `<div class="sh"><h2>Instructievideo</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
  <div class="seg seg2" style="margin-bottom:10px"><button class="segb" data-act="vid-pick" data-v="kort" aria-pressed="${!long}">Kort · ± 1½ min</button><button class="segb" data-act="vid-pick" data-v="lang" aria-pressed="${long}">Alles · ± 8 min</button></div>
  <p class="small muted" style="margin:0 0 8px">${long?"<b>Stap voor stap alle functies</b>, in de volgorde waarin je de app gebruikt.":"<b>De meest gebruikte functies</b>, kort en krachtig."}</p>
  <video src="${src}" controls playsinline preload="metadata" style="width:100%;border-radius:10px;background:#000;max-height:66vh"></video><p class="small muted">Zonder geluid: de uitleg staat in beeld.</p>`}
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="vid-pick"]');if(!b||!UI.sheet)return;UI.sheet.v=b.dataset.v;renderSheet()});
EXTRA_SHEETS["intro"]=introSheet;EXTRA_SHEETS["video"]=videoSheet;
function checkIntro(){
  if(!pid||!S.ready||!consentOk()||UI.sheet||draft||UI.cardio)return;
  const s=S.meta.seen;
  if(s&&s.welcome)UI.sheet={type:"intro",mode:"welcome",step:0};
  else if(!s||s.v!==APP_VERSION)UI.sheet={type:"intro",mode:"update"};
  else return;
  render();
}
async function introDone(){UI.sheet=null;render();if(!S.meta.seen||S.meta.seen.v!==APP_VERSION||S.meta.seen.welcome)await put("meta","seen",{v:APP_VERSION,at:Date.now()});lsSet("krachtlogboek.seen",APP_VERSION)}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;
  switch(b.dataset.act){
    case "ics":exportIcs();break;
    case "watch":UI.sheet={type:"watch"};render();break;
    case "cal-pick":lsSet("krachtlogboek.cal",b.dataset.v);renderSheet();break;
    case "wo-copy":{const p=S.plan[b.dataset.id];if(!p)return;try{await navigator.clipboard.writeText(workoutText({id:b.dataset.id,...p}));toast("Training gekopieerd. Plak hem in je notities of neem de stappen over in je horloge-app.")}catch(e){toast("Kopiëren lukte niet op dit apparaat.")}break}
    case "intro-step":UI.sheet.step=+b.dataset.v;renderSheet();break;
    case "intro-done":await introDone();break;
    case "intro-video":await introDone();UI.sheet={type:"video"};render();break;
    case "intro-news":await introDone();UI.tab="news";lsSet(LS_TAB,"news");UI.fb=undefined;render();window.scrollTo(0,0);break;
    case "go-video":UI.sheet={type:"video"};render();break;
    case "go-intro":UI.sheet={type:"intro",mode:"welcome",step:0};render();break;
  }
});

