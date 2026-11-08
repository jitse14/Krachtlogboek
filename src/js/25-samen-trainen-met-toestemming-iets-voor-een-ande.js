/* ---------- samen trainen: met toestemming iets voor een ander klaarzetten ---------- */
const PERMS=[["plan","Trainingen in mijn planning zetten"],["schemas","Schema's naar mij sturen"],["food","Maaltijden en maaltijdplannen naar mij sturen"],["results","Resultaten zien van trainingen die hij of zij voor mij inplant: de hele training, met opmerkingen en hartslag"],["progress","Voortgang zien: je trainingen, records, gewicht en voeding"],["direct","Direct toevoegen, zonder dat ik eerst hoef te accepteren"]];
const PERM_SHORT={plan:"planning",schemas:"schema's",food:"voeding",results:"resultaten zien",progress:"voortgang zien",direct:"direct toevoegen"};
const KIND_TXT={plan:"Training",routine:"Schema",folder:"Map met schema's",meal:"Maaltijd",mealplan:"Maaltijdplan",product:"Product"};
let socialBusy=false;const inboxDone=new Set();
function soc(){return S.social||{incoming:[],outgoing:[],inbox:[]}}
function socialCount(){const s=soc(),direct=new Set(s.incoming.filter(l=>l.status==="active"&&l.perms&&l.perms.direct).map(l=>l.id));return s.incoming.filter(l=>l.status==="pending").length+s.inbox.filter(i=>!direct.has(i.link)&&!inboxDone.has(i.id)).length}
function permTxt(p){const on=PERMS.map(([k])=>k).filter(k=>p&&p[k]);return on.length?on.map(k=>PERM_SHORT[k]).join(" · "):"nog niets aangevinkt"}
function linksWith(perm){return soc().outgoing.filter(l=>l.perms&&l.perms[perm])}
async function loadSocial(){
  if(!pid||socialBusy||!S.ready||!loadedAt)return;socialBusy=true;const id=pid;
  try{const s=await rpc("kl_social",{p_code:code,p_profile:id,p_pin:lsGet(pinKey(id))});if(pid!==id)return;S.social=s||{incoming:[],outgoing:[],inbox:[]};render();await processDirect()}
  catch(e){}finally{socialBusy=false}
}
async function processDirect(){
  const s=soc(),direct=new Map(s.incoming.filter(l=>l.status==="active"&&l.perms&&l.perms.direct).map(l=>[l.id,l]));
  const todo=s.inbox.filter(i=>direct.has(i.link)&&!inboxDone.has(i.id));if(!todo.length)return;
  const names=[];
  for(const it of todo){inboxDone.add(it.id);try{const t=await importInbox(it);await rpc("kl_inbox_done",{p_code:code,p_profile:pid,p_pin:myPin(),p_id:it.id});names.push(`${it.name}: ${t}`)}catch(e){inboxDone.delete(it.id)}}
  S.social.inbox=S.social.inbox.filter(i=>!inboxDone.has(i.id));
  if(names.length){toast(names.length===1?`Toegevoegd door ${names[0]}`:`${names.length} dingen voor je klaargezet: ${names.join(", ")}`);render()}
}
function inboxTitle(it){const d=it.data||{};return d.name||d.n||KIND_TXT[it.kind]||"Iets"}
function inboxDetail(it){
  const d=it.data||{};
  if(it.kind==="plan"){const ds=d.dates||[];return `${ds.length>1?`${ds.length}× vanaf `:""}${ds[0]?esc(dayName(ds[0])):""}${d.plan&&d.plan.note?` · ${esc(d.plan.note)}`:""}${d.routine?` · ${(d.routine.items||[]).length} oefeningen`:""}`}
  if(it.kind==="routine"||it.kind==="folder")return (d.routines||[]).map(r=>esc(r.name)).join(" · ");
  if(it.kind==="meal"){const t=(d.items||[]).reduce((s,x)=>s+x.k*x.g/100,0);return `${(d.items||[]).length} producten · ${nl(t)} kcal`}
  if(it.kind==="mealplan")return `${(d.entries||[]).length} onderdelen`;
  if(it.kind==="product")return `${nl(d.k||0)} kcal per 100 g`;
  return "";
}
/* importeren bij de ontvanger */
async function folderFrom(name){
  const nm=`Van ${name}`,f=folderList().find(x=>norm(x.name)===norm(nm));if(f)return f.id;
  const fid="fd-"+uid();await put("folders",fid,{name:nm,order:folderList().length});UI.open["f:"+fid]=true;lsSet(LS_OPEN,UI.open);return fid;
}
async function addRoutinesTo(routines,fid){
  const exMap=new Map(Object.entries(S.exercises).map(([id,x])=>[norm(x.name),id])),ex=[],rs=[],ids=[];
  const resolve=it=>{const k=norm(it.name);if(exMap.has(k))return exMap.get(k);const id=uid();exMap.set(k,id);ex.push(["exercises",id,{name:it.name,group:it.group}]);return id};
  const have=routinesIn(fid);let base=have.length;
  (routines||[]).forEach((r,i)=>{const items=(r.items||[]).map(cleanItem).filter(it=>it.name);const ex0=have.find(([,x])=>norm(x.name)===norm(r.name||""));const id=ex0?ex0[0]:uid()+"r"+i;ids.push(id);
    rs.push(["routines",id,{name:String(r.name||"Schema").slice(0,80),folderId:fid,order:ex0?ex0[1].order:base++,items:items.map(it=>({exId:resolve(it),sets:it.sets,reps:it.reps,note:it.note}))}])});
  await runJobs(ex,put);await runJobs(rs,put);return ids;
}
async function importMealPkg(d,by){
  const items=[];for(const x of d.items||[])items.push({fid:x.fid&&FOOD[x.fid]?x.fid:await ensureFood(x),g:x.g});
  const id=uid();await put("meals",id,{n:String(d.name||"Maaltijd").slice(0,80),cats:(d.cats||["ontbijt"]).filter(c=>MEALS.some(m=>m[0]===c)),items,by:by||null});return "u:"+id;
}
async function importInbox(it){
  const d=it.data||{},by=it.name;
  if(it.kind==="routine"||it.kind==="folder"){
    let fid;if(it.kind==="folder"){let nm=String(d.name||"Map");if(folderList().some(f=>norm(f.name)===norm(nm)))nm+=` (van ${by})`;fid="fd-"+uid();await put("folders",fid,{name:nm,order:folderList().length});UI.open["f:"+fid]=true;lsSet(LS_OPEN,UI.open)}
    else fid=await folderFrom(by);
    await addRoutinesTo(d.routines,fid);return `${KIND_TXT[it.kind].toLowerCase()} "${d.name}"`;
  }
  if(it.kind==="plan"){
    const p=d.plan||{},extra={};
    if(p.type==="routine"&&d.routine){const fid=await folderFrom(by);
      const ex=routinesIn(fid).map(([id,r])=>[id,r]).find(([,r])=>norm(r.name)===norm(d.routine.name));
      const rid=ex?ex[0]:(await addRoutinesTo([d.routine],fid))[0];Object.assign(extra,{routineId:rid,routineName:d.routine.name})}
    const stem=uid(),jobs=(d.dates||[]).map((dt,i)=>["plan",stem+"h"+i,{...p,...extra,date:dt,coach:by,fromLink:it.link,updated:Date.now()}]);
    await runJobs(jobs,put);return `${(p.type==="rest"?"rustdag":"training")} ${d.name?`"${d.name}" `:""}op ${dayName(d.dates[0]).toLowerCase()}${jobs.length>1?` (+${jobs.length-1})`:""}`;
  }
  if(it.kind==="meal"){await importMealPkg(d,by);return `maaltijd "${d.name}"`}
  if(it.kind==="product"){await ensureFood({...d,n:d.name||d.n});return `product "${d.name}"`}
  if(it.kind==="mealplan"){
    const entries=[],seen=new Map();
    for(const e of d.entries||[]){
      if(e.t==="m"&&e.meal){const k=norm(e.meal.name);let mid=seen.get(k);if(!mid){mid=await importMealPkg(e.meal,by);seen.set(k,mid)}entries.push({slot:e.slot,t:"m",id:mid,mul:e.mul||1})}
      else if(e.t==="p"&&e.food)entries.push({slot:e.slot,t:"p",fid:e.food.fid&&FOOD[e.food.fid]?e.food.fid:await ensureFood(e.food),g:e.g});
    }
    await put("mealplans",uid(),{n:`${String(d.name||"Maaltijdplan").slice(0,60)} (van ${by})`,entries,updated:Date.now()});return `maaltijdplan "${d.name}"`;
  }
  throw new Error("onbekend");
}
/* versturen door de helper */
function mealPkgOf(m){return{name:m.n,cats:mealCats(m),items:(m.items||[]).map(it=>{const f=partFood(it);return f?{...foodPkg(f),g:it.g,fid:it.fid&&FOOD[it.fid]?it.fid:null}:null}).filter(Boolean)}}
function mealplanPkg(p){return{name:p.n||"Maaltijdplan",entries:(p.entries||[]).map(e=>{if(e.t==="m"){const m=mealById(e.id);return m?{slot:e.slot,t:"m",mul:e.mul||1,meal:mealPkgOf(m)}:null}const f=anyFood(e.fid);return f?{slot:e.slot,t:"p",g:e.g,food:{...foodPkg(f),fid:FOOD[e.fid]?e.fid:null}}:null}).filter(Boolean)}}
async function sendTo(linkId,kind,data){
  const l=soc().outgoing.find(x=>x.id===+linkId);if(!l){toast("Je hebt geen toestemming meer om iets naar deze persoon te sturen.");return false}
  try{await rpc("kl_send",{p_code:code,p_profile:pid,p_pin:myPin(),p_link:l.id,p_kind:kind,p_data:data});
    toast(`Verstuurd naar ${l.name}. ${l.perms.direct?"Het wordt direct toegevoegd zodra de app opent.":"Hij of zij krijgt een voorstel om te accepteren."}`);return true}
  catch(e){if(e.code==="no_perm"){toast(`${l.name} heeft de toestemming hiervoor aangepast of ingetrokken.`);loadSocial()}else if(e.code==="too_many")toast("Je hebt vandaag al veel verstuurd. Probeer het morgen weer.");else if(e.code==="too_big")toast("Dit is te groot om te versturen.");else if(e.code==="net")toast("Versturen lukt alleen met internet.");else handleErr(e);return false}
}
function sendRow(perm,act,v){const ls=linksWith(perm);if(!ls.length)return "";return `<div class="f" style="margin-top:6px">Of stuur direct naar<div class="chips">${ls.map(l=>`<button class="chipb" data-act="${act}" data-v="${esc(v)}" data-id="${l.id}">${esc(l.name)}</button>`).join("")}</div></div>`}
/* pagina */
function permEditor(l,def){const p=l.perms&&Object.keys(l.perms).length?l.perms:def;return `<div class="stack permbox">${PERMS.map(([k,t])=>`<label class="check"><input type="checkbox" id="perm-${l.id}-${k}" ${p[k]?"checked":""}><span>${k==="results"||k==="direct"||k==="progress"?`<b>${t.split(" ")[0]}</b> ${t.split(" ").slice(1).join(" ")}`:t}</span></label>`).join("")}</div>`}
function readPerms(id){const o={};for(const [k] of PERMS)o[k]=!!document.getElementById(`perm-${id}-${k}`)?.checked;return o}
function viewTogether(){
  if(S.social==null&&!socialBusy&&loadedAt)loadSocial();
  const s=soc(),direct=new Set(s.incoming.filter(l=>l.status==="active"&&l.perms&&l.perms.direct).map(l=>l.id));
  const pend=s.incoming.filter(l=>l.status==="pending"),act=s.incoming.filter(l=>l.status==="active"),inbox=s.inbox.filter(i=>!direct.has(i.link)&&!inboxDone.has(i.id));
  let h=`<div class="wohead"><div class="title">Samen trainen</div><button class="linkbtn" data-act="go-profile">← Profiel</button></div>
    <p class="hp small muted" style="margin-top:8px">Train je samen of help je elkaar? Met toestemming kan iemand anders trainingen voor je inplannen, of schema's en maaltijden sturen. Jij kiest per persoon waarvoor, en kunt het altijd weer intrekken.</p>`;
  if(pend.length)h+=`<h2>Verzoeken</h2>`+pend.map(l=>`<div class="card stack reqcard"><div><b>${esc(l.name)}</b> wil met je samen trainen.</div><p class="hp small" style="margin:0">Vink aan wat ${esc(l.name)} mag:</p>${permEditor(l,{plan:true,schemas:true,food:true,results:false,direct:false})}<div class="btnrow"><button class="btn primary" data-act="lk-accept" data-id="${l.id}">Accepteren</button><button class="btn" data-act="lk-decline" data-id="${l.id}">${UI.confirm==="lk-decline"+l.id?"Zeker? Tik nogmaals":"Weigeren"}</button></div></div>`).join("");
  if(inbox.length)h+=`<h2>Voor jou klaargezet</h2>`+inbox.map(i=>`<div class="card stack inboxcard"><div class="fbh"><b>${esc(inboxTitle(i))}</b><span class="chip">${KIND_TXT[i.kind]||i.kind}</span></div><span class="small muted">Van ${esc(i.name)}${inboxDetail(i)?` · ${inboxDetail(i)}`:""}</span><div class="btnrow"><button class="btn primary" data-act="ib-add" data-id="${i.id}">Toevoegen</button><button class="btn" data-act="ib-no" data-id="${i.id}">Weigeren</button></div></div>`).join("");
  h+=`<h2>Wie mag met je meekijken of iets klaarzetten</h2>`+(act.length?`<div class="stack">${act.map(l=>`<div class="card stack"><div class="fbh"><b>${esc(l.name)}</b></div><span class="small muted">Mag: ${esc(permTxt(l.perms))}</span>${UI.permEdit===l.id?permEditor(l,{})+`<div class="btnrow"><button class="btn primary" data-act="lk-save" data-id="${l.id}">Opslaan</button><button class="btn" data-act="lk-edit" data-id="">Annuleren</button></div>`:`<div class="btnrow"><button class="btn" data-act="lk-edit" data-id="${l.id}">Aanpassen</button><button class="btn ghost danger" data-act="lk-remove" data-id="${l.id}">${UI.confirm==="lk-remove"+l.id?"Zeker? Tik nogmaals":"Intrekken"}</button></div>`}</div>`).join("")}</div>`:`<p class="small muted">Nog niemand. Krijg je een verzoek, dan zie je dat hier en bovenaan Trainen.</p>`);
  h+=`<h2>Jij helpt</h2>`+(s.outgoing.length?`<div class="stack">${s.outgoing.map(l=>`<div class="card stack"><div class="fbh"><b>${esc(l.name)}</b></div><span class="small muted">Jij mag: ${esc(permTxt(l.perms))}</span><div class="btnrow">${l.perms.plan?`<button class="btn primary" data-act="lk-plan" data-id="${l.id}">Training inplannen</button><button class="btn" data-act="lk-view" data-id="${l.id}">Ingepland${l.perms.results?" en resultaten":""}</button>`:""}${l.perms.progress||l.perms.sessions||l.perms.agenda?`<button class="btn" data-act="hv-prog" data-id="${l.id}">Meekijken</button>`:""}${l.perms.food?`<button class="btn" data-act="lk-food" data-id="${l.id}">Maaltijd sturen</button>`:""}${l.perms.schemas?`<button class="btn" data-act="go-schemas">Schema sturen</button>`:""}</div><button class="linkbtn danger" data-act="lk-stop" data-id="${l.id}">${UI.confirm==="lk-stop"+l.id?"Zeker? Tik nogmaals om te stoppen":"Stoppen met helpen"}</button></div>`).join("")}</div><p class="small muted">Schema's stuur je via Schema's → Delen, maaltijden via Voeding → Plannen → Delen.</p>`:`<p class="small muted">Je helpt nog niemand.</p>`);
  h+=`<h2>Iemand vragen</h2><div class="card stack"><p class="hp">Wil je iemand trainen, met iemand samen sporten of iets voor iemand klaarzetten? Vul de naam in waarmee die persoon inlogt. Die persoon kiest zelf wat je mag.</p><div class="codeinput"><input type="text" id="lk-name" placeholder="Naam" autocomplete="off"><button class="btn primary" data-act="lk-request">Verzoek sturen</button></div><p class="small muted" style="margin:0">Je ziet niet wie er allemaal een account heeft. Bestaat de naam, dan krijgt die persoon een melding en kan je verzoek accepteren of weigeren.</p></div>`;
  return h;
}
function socialBanner(){const n=socialCount();if(!n)return "";const s=soc(),p=s.incoming.filter(l=>l.status==="pending").length;
  return `<div class="banner newsb"><span>${p?`<b>${p} verzoek${p>1?"en":""}</b> voor Samen trainen`:""}${p&&n>p?" · ":""}${n>p?`<b>${n-p}</b> ding${n-p>1?"en":""} voor je klaargezet`:""}</span><span class="nbtns"><button class="linkbtn" data-act="go-together">Bekijken</button></span></div>`}
/* overzicht voor de helper */
function helpViewSheet(sh){
  const l=soc().outgoing.find(x=>x.id===sh.link),d=sh.data;
  let h=`<div class="sh"><h2>Ingepland voor ${esc(l?l.name:"")}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>`;
  if(!d)return h+`<p class="muted">Laden…</p>`;
  if(d.pending.length)h+=`<div class="card stack"><b>Nog niet bekeken</b>${d.pending.map(p=>`<span class="small">${KIND_TXT[p.kind]||p.kind}${p.name?` "${esc(p.name)}"`:""}${p.dates&&p.dates[0]?` · ${esc(dayName(p.dates[0]))}`:""}</span>`).join("")}</div>`;
  const t=today();
  h+=d.plan.length?`<div class="recgroup" style="margin-top:10px">${d.plan.map(p=>{const s=p.session;let res="";
      if(s){res=s.kind==="cardio"?[s.km?fmt1(+s.km)+" km":null,s.durMin?durTxt(+s.durMin):null,s.km&&s.durMin?paceTxt(+s.durMin,+s.km):null].filter(Boolean).join(" · "):(s.entries||[]).map(e=>`${esc(e.name)} ${(e.sets||[]).map(x=>(x.k?x.k+"×":"")+x.r).join(", ")}`).join(" · ")}
      if(s&&d.results)return `<button class="row logrow" data-act="hv-ses" data-v="${esc(p.id)}"><span class="n">${esc(p.title||"Training")}</span><span class="b none">✓ gedaan</span><span class="l">${esc(dayName(p.date))}${res?` · ${res}`:""}${s.feel?` · ${esc(hvFeel(s.feel))}`:""}${s.note?" · 💬":""} · <u>hele training</u></span></button>`;
      return `<div class="row logrow"><span class="n">${esc(p.title||"Training")}</span><span class="b none">${p.done?"✓ gedaan":p.date<t?"niet gedaan":"gepland"}</span><span class="l">${esc(dayName(p.date))}${res?` · ${res}`:""}${p.date>=t&&!p.done?` <button class="linkbtn danger" data-act="hv-del" data-v="${esc(p.id)}">verwijderen</button>`:""}</span></div>`}).join("")}</div>`
    :`<p class="small muted">Nog niets van jou in de planning (laatste 60 dagen).</p>`;
  if(!d.results)h+=`<p class="small muted">${esc(l?l.name:"Deze persoon")} deelt geen resultaten met je; je ziet alleen of iets gedaan is.</p>`;
  return h;
}
async function openHelpView(link){UI.sheet={type:"help-view",link,data:null};render();
  try{const d=await rpc("kl_help_view",{p_code:code,p_profile:pid,p_pin:myPin(),p_link:link});if(UI.sheet&&UI.sheet.type==="help-view"&&UI.sheet.link===link){UI.sheet.data=d;renderSheet()}}
  catch(e){UI.sheet=null;if(e.code==="no_perm"){toast("Je hebt hier geen toestemming meer voor.");loadSocial()}else handleErr(e)}}
function sendMealSheet(sh){const l=soc().outgoing.find(x=>x.id===sh.link);const ms=mealsAll();const plans=Object.entries(S.mealplans||{});
  return `<div class="sh"><h2>Sturen naar ${esc(l?l.name:"")}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
  ${plans.length?`<h2>Maaltijdplannen</h2><div class="card" style="padding:4px 12px">${plans.map(([id,p])=>`<button class="pickitem" data-act="sd-mealplan" data-v="${id}" data-id="${sh.link}"><span>${esc(p.n||"Maaltijdplan")}</span><span class="small muted">${(p.entries||[]).length} onderdelen</span></button>`).join("")}</div>`:""}
  <h2>Maaltijden</h2><div class="card" style="padding:4px 12px">${ms.map(m=>`<button class="pickitem" data-act="sd-meal" data-v="${m.id}" data-id="${sh.link}"><span>${esc(m.n)}</span><span class="small muted">${nl(partsMacros(mealParts(m,1)).k)} kcal</span></button>`).join("")}</div>`}
EXTRA_SHEETS["help-view"]=helpViewSheet;EXTRA_SHEETS["send-meal"]=sendMealSheet;

/* deel-sheet uitbreiden met direct sturen */
const _shareSheetT=EXTRA_SHEETS["share"];
EXTRA_SHEETS["share"]=function(sh){let h=_shareSheetT(sh);if(!sh.pkg)return h;const perm=sh.kind==="meal"||sh.kind==="product"?"food":"schemas";
  const row=sendRow(perm,"sd-pkg",sh.kind);return row?h.replace(/<\/div>\s*$/,`${row}</div>`):h};

document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;
  const act=b.dataset.act,v=b.dataset.v,id=b.dataset.id;
  switch(act){
    case "go-together":UI.tab="together";lsSet(LS_TAB,"together");UI.sheet=null;UI.permEdit=null;render();window.scrollTo(0,0);loadSocial();break;
    case "go-schemas":UI.tab="schemas";lsSet(LS_TAB,"schemas");render();window.scrollTo(0,0);toast("Tik bij een schema of map op Delen en kies daar de persoon.");break;
    case "lk-request":{const el=document.getElementById("lk-name"),nm=(el?.value||"").trim();if(!nm){toast("Vul een naam in.");return}
      if(norm(nm)===norm(S.me?.name||"")){toast("Dat ben je zelf.");return}
      try{await rpc("kl_link_request",{p_code:code,p_profile:pid,p_pin:myPin(),p_name:nm});el.value="";toast("Verzoek verstuurd. Als deze gebruiker bestaat, krijgt hij of zij een melding en kan je accepteren of weigeren.")}
      catch(e){if(e.code==="too_many")toast("Je hebt vandaag al veel verzoeken gestuurd. Probeer het morgen weer.");else if(e.code==="net")toast("Een verzoek sturen lukt alleen met internet.");else if(0)toast("Je hebt vandaag al veel verzoeken gestuurd. Probeer het morgen weer.");else handleErr(e)}break}
    case "lk-accept":case "lk-save":{const p=readPerms(id);if(!Object.entries(p).some(([k,v])=>v&&k!=="direct")){toast("Vink minstens één onderdeel aan.");return}
      try{await rpc("kl_link_set",{p_code:code,p_profile:pid,p_pin:myPin(),p_id:+id,p_perms:p});UI.permEdit=null;toast(act==="lk-accept"?"Geaccepteerd":"Toestemming aangepast");await loadSocial()}catch(e){handleErr(e)}break}
    case "lk-decline":case "lk-remove":case "lk-stop":{
      if(UI.confirm!==act+id){UI.confirm=act+id;render();if(act==="lk-remove")toast("Openstaande voorstellen van deze persoon vervallen dan ook.");return}
      UI.confirm=null;try{await rpc("kl_link_remove",{p_code:code,p_profile:pid,p_pin:myPin(),p_id:+id});toast(act==="lk-decline"?"Verzoek geweigerd":act==="lk-remove"?"Toestemming ingetrokken":"Je helpt deze persoon niet meer");await loadSocial()}catch(e){handleErr(e)}break}
    case "lk-edit":UI.permEdit=id?+id:null;render();break;
    case "ib-add":{const it=soc().inbox.find(i=>i.id===+id);if(!it)return;inboxDone.add(it.id);render();
      try{const t=await importInbox(it);await rpc("kl_inbox_done",{p_code:code,p_profile:pid,p_pin:myPin(),p_id:it.id});S.social.inbox=S.social.inbox.filter(i=>i.id!==it.id);toastOk(`Toegevoegd: ${t}`);render()}
      catch(e){inboxDone.delete(it.id);if(e.code==="net")toast("Toevoegen lukt alleen met internet.");else toast("Toevoegen lukte niet. Probeer het opnieuw.");render()}break}
    case "ib-no":{try{await rpc("kl_inbox_done",{p_code:code,p_profile:pid,p_pin:myPin(),p_id:+id});S.social.inbox=S.social.inbox.filter(i=>i.id!==+id);toast("Geweigerd");render()}catch(e){handleErr(e)}break}
    case "lk-plan":UI.sheet={type:"pl-add",forLink:+id,date:addDays(today(),1),kind:Object.keys(S.routines).length?"routine":spCardio().length?"cardio":"other",routineId:"",sport:spCardioFirst(),title:"",durMin:"",km:"",note:"",repeat:"1"};UI.confirm=null;render();break;
    case "pa-for":UI.sheet.forLink=id?+id:null;renderSheet();break;
    case "lk-view":await openHelpView(+id);break;
    case "hv-del":{const sh=UI.sheet;try{await rpc("kl_help_plan_del",{p_code:code,p_profile:pid,p_pin:myPin(),p_link:sh.link,p_id:v});toast("Uit de planning gehaald");await openHelpView(sh.link)}catch(e){if(e.code==="no_perm")toast("Je hebt hier geen toestemming meer voor.");else handleErr(e)}break}
    case "lk-food":UI.sheet={type:"send-meal",link:+id};render();break;
    case "sd-meal":{const m=mealById(v);if(m&&await sendTo(id,"meal",{type:"meal",...mealPkgOf(m),by:S.me?.name}))UI.sheet=null;render();break}
    case "sd-mealplan":{const p=S.mealplans[v];if(p&&await sendTo(id,"mealplan",mealplanPkg(p)))UI.sheet=null;render();break}
    case "sd-pkg":{const sh=UI.sheet;if(sh&&sh.pkg&&await sendTo(id,sh.pkg.type,sh.pkg)){UI.sheet=null;render()}break}
    case "mp-send":{const p=UI.planEdit;if(!p||!p.entries.length){toast("Voeg eerst iets toe aan het plan.");return}if(await sendTo(id,"mealplan",mealplanPkg(p)))render();break}
  }
});
document.addEventListener("input",ev=>{if(ev.target.id==="pa-date"&&UI.sheet&&UI.sheet.type==="pl-add")UI.sheet.date=ev.target.value});
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target.id==="lk-name"){ev.preventDefault();document.querySelector('[data-act="lk-request"]')?.click()}});

