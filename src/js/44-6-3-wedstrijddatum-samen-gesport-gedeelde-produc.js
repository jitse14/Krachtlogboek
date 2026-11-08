/* ---------- 6.3: wedstrijddatum, samen gesport, gedeelde producten, ml, horloge-instelling ---------- */
/* sportschema: na het invullen van een wedstrijddatum meteen "tot de wedstrijd" kiezen */
document.addEventListener("change",ev=>{const id=ev.target.id||"";if(!UI.sc||!(/^sc-race-\d+$/.test(id)||id==="sc-mrace"))return;
  scRead();const c=UI.sc;if(scRaceWeeks(c)&&ev.target.value)c.weeks="race";const y=window.scrollY;render();window.scrollTo(0,y);
  const w=scRaceWeeks(c);if(w)toast(`Je schema loopt tot je wedstrijd: ${w} ${w===1?"week":"weken"}.`)});

/* samen gesport: dezelfde training ook bij je maatje registreren (met toestemming 'together') */
PERMS.splice(PERMS.findIndex(p=>p[0]==="direct"),0,["together","Een training die we samen deden ook bij mij registreren"]);
PERM_SHORT.together="samen gesport";KIND_TXT.session="Training";
let togPending=[];
function togetherRow(kind){const ls=linksWith("together");if(!ls.length)return "";const st=kind==="c"?UI.cardio:draft;const w=(st&&st.with)||[];
  return `<div class="f">Samen gedaan met <i>optioneel: de training komt ook bij hem of haar</i><div class="chips">${ls.map(l=>`<button class="chipb" data-act="tg-with" data-k="${kind}" data-id="${l.id}" aria-pressed="${w.includes(l.id)}">${esc(l.name)}</button>`).join("")}</div></div>`}
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="tg-with"]');if(!b)return;const st=b.dataset.k==="c"?UI.cardio:draft;if(!st)return;const id=+b.dataset.id;
  st.with=(st.with||[]).includes(id)?st.with.filter(x=>x!==id):[...(st.with||[]),id];b.setAttribute("aria-pressed",String(st.with.includes(id)));if(b.dataset.k==="c")saveCardioDraft();else saveDraft()});
/* vlak voor opslaan onthouden met wie */
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="c-save"],[data-act="finish"]');if(!b)return;const st=b.dataset.act==="c-save"?UI.cardio:draft;togPending=(st&&st.with)||[]},true);
async function togetherSend(rec){const ids=togPending;togPending=[];if(!ids.length)return;
  const ses={...rec};delete ses.planId;delete ses.routineId;delete ses.efforts;delete ses.feel;delete ses.importAt;
  const name=rec.kind==="cardio"?(rec.sport||"Duurtraining"):(rec.routineName||"Training");let ok=[];
  for(const id of ids){const l=soc().outgoing.find(x=>x.id===id);if(!l||!l.perms.together)continue;
    try{await rpc("kl_send",{p_code:code,p_profile:pid,p_pin:myPin(),p_link:l.id,p_kind:"session",p_data:{name,session:ses}});ok.push(l.name)}catch(e){}}
  if(ok.length)setTimeout(()=>toast(`Ook geregistreerd voor ${ok.join(" en ")}${ok.length?"":""}.`),1800)}
const _fbAfterSave63=fbAfterSave;fbAfterSave=function(id,rec){_fbAfterSave63(id,rec);togetherSend(rec)};
/* ontvanger */
const _importInbox63=importInbox;importInbox=async function(it){if(it.kind!=="session")return _importInbox63(it);
  const s={...(it.data&&it.data.session||{})},by=it.name;if(!s.date)throw new Error("leeg");
  const exMap=new Map(Object.entries(S.exercises).map(([id,x])=>[norm(x.name),id])),ex=[];
  s.entries=(s.entries||[]).map(e=>{const k=norm(e.name||"");let id=exMap.get(k);if(!id&&k){id=uid();exMap.set(k,id);ex.push(["exercises",id,{name:e.name,group:e.group||"Overig"}])}return{...e,exId:id||e.exId}});
  await runJobs(ex,put);
  if(s.kind==="cardio"){const p=piPlanFor(s.date,/zwem/i.test(s.sport||"")?"Zwemmen":s.sport);if(p){s.planId=p.id;s.planTitle=planTitle(p)}}
  s.note=[`Samen met ${by}.`,s.note].filter(Boolean).join(" ");s.ts=Date.now();s.with=by;
  await put("sessions",uid(),s);return `training "${it.data.name||"Training"}" van ${dateTxt(s.date)}`};
const _inboxDetail63=inboxDetail;inboxDetail=function(it){if(it.kind!=="session")return _inboxDetail63(it);const s=(it.data||{}).session||{};
  return `${s.date?esc(dateTxt(s.date)):""}${s.kind==="cardio"?" · "+esc(cardioSummary(s)):` · ${(s.entries||[]).length} oefeningen`} · samen gesport`};

/* producten die de beheerder heeft nagelezen: voor iedereen */
S.sharedFoods=[];
async function loadSharedFoods(){try{const d=await rpc("kl_setting_get",{p_code:code,p_key:"foods"});const items=(d&&d.items)||[];
  const mine=new Set(Object.values(S.foods||{}).map(f=>norm(f.n)));
  for(let i=FOODS.length-1;i>=0;i--)if(FOODS[i].cat==="gedeeld"){delete FOOD[FOODS[i].id];FOODS.splice(i,1)}
  for(const x of items){if(!x||!x.n||mine.has(norm(x.n))||FOODS.some(f=>norm(f.n)===norm(x.n)))continue;const f={id:"g-"+x.id,n:x.n,k:+x.k||0,p:+x.p||0,c:+x.c||0,f:+x.f||0,por:x.por||100,cat:"gedeeld",...(x.ml?{ml:true}:{})};FOODS.push(f);FOOD[f.id]=f}
  S.sharedFoods=items}catch(e){}}
function adminFoodShare(){const n=Object.keys(S.foods||{}).length;
  return `<h2>Producten delen</h2><div class="card stack"><p class="hp small" style="margin:0">Maak je eigen producten (${n}) beschikbaar voor iedereen. Alleen naam en voedingswaarden gaan mee, niet wanneer of hoeveel je ze eet. Voeg je later nieuwe producten toe, tik dan opnieuw.</p>
    <button class="btn" data-act="fs-share" ${n?"":"disabled"}>Mijn ${n} producten delen met iedereen</button><span class="small muted">Nu gedeeld: ${(S.sharedFoods||[]).length}</span></div>`}
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act="fs-share"]');if(!b)return;
  const items=Object.entries(S.foods||{}).map(([id,f])=>({id,n:f.n,k:+f.k||0,p:+f.p||0,c:+f.c||0,f:+f.f||0,por:f.por||100,...(f.ml?{ml:true}:{})}));
  try{await rpc("kl_admin_setting_put",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_key:"foods",p_data:{items,updated:today()}});await loadSharedFoods();toastOk(`${items.length} producten gedeeld met iedereen`);render()}catch(e){handleErr(e)}});

/* gram of ml */
const ML_RE=/melk|\bsap\b|sinaasappelsap|appelsap|drink|cola|frisdrank|limonade|\bbier\b|\bwijn\b|\bwater\b|koffie|\bthee\b|shake|smoothie|kefir|karnemelk|bouillon|siroop/i;
const isMl=f=>!!(f&&(f.ml||(!f.u&&ML_RE.test(f.n||"")&&!/melkchocolade|chocolade(?!melk)|poeder|kaas|reep|koek|ijs\b/i.test(f.n||""))));
const faUnit=sh=>sh.unit||(isMl(sh.pick)?"ml":"g");
const uTxt=it=>it&&it.ml?"ml":"g";
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="fa-unit"]');if(!b||!UI.sheet)return;const sh=UI.sheet,v=b.dataset.v;
  if(sh.pick){sh.unit=v;renderSheet();return}
  if(sh.custom){sh.custom.ml=v==="ml";document.querySelectorAll('[data-act="fa-unit"]').forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===v)));const hl=document.getElementById("cf-unit-h");if(hl)hl.textContent=`Voedingswaarden per 100 ${v}, staan op de verpakking`}});
function faUnitSeg(u){return `<div class="seg seg2" style="margin-top:2px">${[["g","Gram"],["ml","Milliliter"]].map(([k,l])=>`<button class="segb" data-act="fa-unit" data-v="${k}" aria-pressed="${u===k}">${l}</button>`).join("")}</div>`}

/* horloge-code alleen voor wie intervals.icu gebruikt */
const icuOn=()=>!!(tabsMeta().icu);
const _icuBox63=icuBox;icuBox=function(p){return icuOn()?_icuBox63(p):""};
const _icuField63=icuField;icuField=function(sh){return icuOn()||(sh.steps||"").trim()?_icuField63(sh):""};
function icuCard(){return `<h2>Horloge</h2><div class="card stack"><label class="check"><input type="checkbox" id="icu-on" ${icuOn()?"checked":""}><span><b>Ik gebruik intervals.icu</b> om trainingen op mijn Garmin of Apple Watch te zetten</span></label>
  <p class="small muted" style="margin:0">Aan: bij elke geplande duurtraining zie je de stappen voor je horloge, met een knop om de code te kopiëren. Een afgeronde training terugplakken kan altijd, ook zonder intervals.icu.</p></div>`}
document.addEventListener("change",async ev=>{if(ev.target.id!=="icu-on")return;await tabsSave({icu:ev.target.checked});toastOk(ev.target.checked?"Horloge-stappen staan aan":"Horloge-stappen staan uit")});

