/* ---------- zelf kiezen: tabbladen, subtabbladen en je sporten ---------- */
const TAB_OPT=[["plan","Planning"],["schemas","Schema's"],["records","Voortgang"],["food","Voeding"],["kennis","Kennis"]];
const SUB_OPT={food:{keep:"Advies",opts:[["plannen","Plannen"],["dagboek","Dagboek"],["shop","Boodschappen"]]},records:{keep:"Voortgang",opts:[["records","Records"]]}};
const SPF=[["kracht","Krachttraining"],["hiit","HIIT"],["cali","Calisthenics"],["run","Hardlopen"],["bike","Wielrennen"],["swim","Zwemmen"],["trail","Trailrunnen"],["ultra","Ultrarunnen"],["team","Teamsporten"],["other","Overige sporten"]];
const SP_KRACHT_WARN="Krachttraining is ook belangrijk als ondersteuning bij duursport, weet je zeker dat je deze onzichtbaar wilt maken?";
const tabsMeta=()=>(S.meta&&S.meta.tabs)||{};
const tabHidden=()=>new Set((tabsMeta().hide||[]).filter(t=>TAB_OPT.some(x=>x[0]===t)));
const subHidden=t=>new Set(((tabsMeta().sub||{})[t]||[]).filter(v=>SUB_OPT[t]&&SUB_OPT[t].opts.some(x=>x[0]===v)));
const subOn=(t,v)=>!subHidden(t).has(v);
const spHidden=()=>new Set((tabsMeta().sports||[]).filter(k=>SPF.some(x=>x[0]===k)));
const spOn=k=>!spHidden().has(k);
const spAny=(...ks)=>ks.some(spOn);
const spFit=()=>spAny("kracht","hiit","cali");
const spRun=()=>spAny("run","trail","ultra");
const SP_TEAMS=new Set(["Voetbal","Hockey","Handbal","Volleybal","Basketbal","Tennis","Padel","Squash"]);
const SP_SC={Hardlopen:"run",Wielrennen:"bike",Zwemmen:"swim",Trailrunnen:"trail",Ultrarunnen:"ultra"};
/* mag deze sport gekozen worden? */
function spScOk(n){if(n==="Fitness")return spFit();if(SP_SC[n])return spOn(SP_SC[n]);if(SP_TEAMS.has(n))return spOn("team");return spOn("other")}
function spOtherOk(n){if(n==="Zwemmen")return spOn("swim");if(SP_TEAMS.has(n))return spOn("team");return spOn("other")}
const spOtherList=()=>OTHER_SPORTS.filter(spOtherOk);
function spCardioOk(s){return s==="Hardlopen"?spRun():s==="Wielrennen"?spOn("bike"):s==="Anders"?(spOn("other")||spOtherList().length>0):true}
const spCardio=()=>CARDIO.filter(spCardioOk);
const spCardioFirst=()=>spCardio()[0]||"Anders";
function spCardioLbl(s){if(s!=="Anders"||spOn("other"))return s;const l=spOtherList();return l.length===1?l[0]:spOn("swim")&&!spOn("team")?"Zwemmen":!spOn("swim")?"Teamsport":"Overig"}
const spSeg=n=>n>=4?"seg4":n===3?"seg3":n===2?"seg2":"seg1";
/* sportkeuze in een segment; een al gekozen sport blijft zichtbaar */
function spCardioSeg(act,cur){const l=spCardio();if(cur&&CARDIO.includes(cur)&&!l.includes(cur))l.push(cur);
  return `<div class="seg ${spSeg(l.length)}">${l.map(s=>`<button class="segb" data-act="${act}" data-v="${s}" aria-pressed="${cur===s}">${esc(spCardioLbl(s))}</button>`).join("")}</div>`}
function spProfOk(k){return({kracht:spFit(),hardlopen:spRun(),wielrennen:spOn("bike"),zwemmen:spOn("swim"),teamsport:spOn("team"),overig:spOn("other")})[k]??true}
function spKnOk(k){return k==="duo"?spRun()&&spOn("bike"):k==="tri"?spRun()&&spOn("bike")&&spOn("swim"):SPF.some(x=>x[0]===k)?spOn(k):true}
const spLibOk=l=>/^cali/.test(l.id)?spOn("cali"):spOn("kracht");
const spFitTypes=()=>SC_F.filter(([v])=>spOn(v));

async function tabsSave(patch){const y=window.scrollY;await put("meta","tabs",{...tabsMeta(),...patch});render();window.scrollTo(0,y)}
function tabsApply(){
  if(!pid)return;const hid=tabHidden(),nav=document.querySelector("nav.tabs .in");if(!nav)return;let n=0;
  nav.querySelectorAll("button[data-tab]").forEach(b=>{const h=hid.has(b.dataset.tab);b.hidden=h;if(!h)n++});
  nav.style.gridTemplateColumns=`repeat(${n},1fr)`;
  /* knoppen naar een verborgen subtabblad weghalen */
  const off=[];for(const v of subHidden("food"))off.push(`[data-act="n-tab"][data-v="${v}"]`);
  if(!subOn("food","dagboek"))off.push('[data-act="n-day-log"]','[data-act="mp-log"]');
  if(!subOn("food","shop"))off.push('[data-act="mp-shop"]');
  if(off.length)document.querySelectorAll(off.join(",")).forEach(b=>b.hidden=true);
}
function tabsCard(){const hid=tabHidden(),sh=spHidden();
  const subs=Object.entries(SUB_OPT).filter(([t])=>!hid.has(t)).map(([t,o])=>{const sub=subHidden(t);
    return `<div class="f sub">${esc((TAB_OPT.find(x=>x[0]===t)||[,t])[1])} <i>${esc(o.keep)} blijft altijd staan</i><div class="chips">${o.opts.map(([v,l])=>`<button class="chipb" data-act="tb-sub" data-t="${t}" data-v="${v}" aria-pressed="${!sub.has(v)}">${esc(l)}</button>`).join("")}</div></div>`}).join("");
  return `<h2>Tabbladen</h2><div class="card stack"><p class="hp small" style="margin:0">Gebruik je niet alles? Kies welke onderdelen je onderin wilt zien. Trainen en Profiel blijven altijd staan. Je kunt het altijd weer aanzetten.</p>
    <div class="chips">${TAB_OPT.map(([k,l])=>`<button class="chipb" data-act="tb-tog" data-v="${k}" aria-pressed="${!hid.has(k)}">${l}</button>`).join("")}</div>${subs}</div>
    <h2>Mijn sporten</h2><div class="card stack"><p class="hp small" style="margin:0">Kies de sporten die je doet. De andere sporten en wat erbij hoort verdwijnen uit de keuzes: bij trainen, schema's, sportschema op maat, de planning en kennis. Wat al in je planning staat, blijft gewoon staan. Zet je een sport weer aan, dan kun je hem meteen weer kiezen.</p>
    <div class="chips">${SPF.map(([k,l])=>`<button class="chipb" data-act="sp-tog" data-v="${k}" aria-pressed="${!sh.has(k)}">${l}</button>`).join("")}</div></div>`}
EXTRA_SHEETS["sp-kracht"]=function(){return `<div class="sh"><h2>Krachttraining verbergen?</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
  <p class="hp" style="margin:0">${esc(SP_KRACHT_WARN)}</p><div class="stack"><button class="btn primary" data-act="close-sheet">Nee, laten staan</button><button class="btn" data-act="sp-kracht-yes">Ja, onzichtbaar maken</button></div></div>`};
async function spSet(k,on){const sh=spHidden();if(on)sh.delete(k);else sh.add(k);await tabsSave({sports:[...sh]});const l=(SPF.find(x=>x[0]===k)||[,k])[1];toastOk(on?`${l} weer zichtbaar`:`${l} verborgen`)}
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act="tb-tog"],[data-act="tb-sub"],[data-act="sp-tog"],[data-act="sp-kracht-yes"]');if(!b)return;const act=b.dataset.act,k=b.dataset.v;
  if(act==="tb-tog"){const hid=tabHidden();if(hid.has(k))hid.delete(k);else hid.add(k);await tabsSave({hide:[...hid]});const l=(TAB_OPT.find(x=>x[0]===k)||[,k])[1];toastOk(hid.has(k)?`${l} verborgen`:`${l} weer zichtbaar`);return}
  if(act==="tb-sub"){const t=b.dataset.t,sub=subHidden(t);if(sub.has(k))sub.delete(k);else sub.add(k);await tabsSave({sub:{...(tabsMeta().sub||{}),[t]:[...sub]}});const l=((SUB_OPT[t].opts.find(x=>x[0]===k))||[,k])[1];toastOk(sub.has(k)?`${l} verborgen`:`${l} weer zichtbaar`);return}
  if(act==="sp-kracht-yes"){UI.sheet=null;renderSheet();await spSet("kracht",false);return}
  if(act==="sp-tog"){const on=spOn(k);
    if(!on){await spSet(k,true);return}
    if(SPF.filter(([x])=>spOn(x)).length<=1){toast("Laat minstens één sport aan staan.");return}
    if(k==="kracht"){UI.sheet={type:"sp-kracht"};renderSheet();return}
    await spSet(k,false)}
});
/* sportschema op maat: alleen sporten die aan staan */
const _scDefaults=scDefaults;scDefaults=function(pre){const c=_scDefaults(pre);
  for(const n of Object.keys(c.sp))if(!spScOk(n))delete c.sp[n];
  c.custom=(c.custom||[]).filter(spScOk);
  if(!Object.keys(c.sp).length){const n=SC_LIST.find(spScOk)||c.custom[0];if(n)c.sp[n]={n:n==="Fitness"?3:2,days:[]}}
  c.order=Object.keys(c.sp);
  c.f.likes=(c.f.likes||[]).filter(spOn);if(!c.f.likes.length){const f=spFitTypes()[0];if(f)c.f.likes=[f[0]]}
  for(const n of Object.keys(c.eg||{}))if(!spScOk(n))delete c.eg[n];
  if(c.multi&&c.multi.type&&!SC_MULTI[c.multi.type].need.every(spScOk))c.multi.type="";
  return c};
/* duurtraining "anders" met maar één mogelijke sport: die alvast kiezen */
const _newCardio=newCardio;newCardio=function(sport,plan){_newCardio(sport,plan);const c=UI.cardio;
  if(c&&c.sport==="Anders"&&!c.other&&!spOn("other")){const l=spOtherList();if(l.length===1){c.other=l[0];saveCardioDraft();render()}}};
let tabsBoot=false;
const _renderTabs=render;render=function(){
  if(!tabsBoot&&pid&&S.ready){tabsBoot=true;if(tabHidden().has(UI.tab))UI.tab="train"}
  if(pid&&S.ready){if(UI.foodTab&&UI.foodTab!=="advies"&&!subOn("food",UI.foodTab==="dagen"?"plannen":UI.foodTab))UI.foodTab="advies";if(UI.recTab==="records"&&!subOn("records","records"))UI.recTab="voortgang"}
  const r=_renderTabs.apply(this,arguments);try{tabsApply()}catch(e){}return r};

