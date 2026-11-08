/* ---------- planning ---------- */
function planList(){return Object.entries(S.plan||{}).map(([id,p])=>({id,...p}))}
function planKind(p){return p.type||"cardio"}
function planDoneFor(p){
  if(p.doneAt)return{kind:"check"};
  const s=planSession(S.sessions,p.id);if(s)return s;
  if(planKind(p)==="routine"&&p.routineId)return sortedSessions().find(x=>x.date===p.date&&x.routineId===p.routineId&&!x.planId)||null;
  return null;
}
function planTitle(p){const k=planKind(p);if(k==="routine")return S.routines[p.routineId]?.name||p.routineName||"Schema";if(k==="rest")return "Rustdag";return p.title||p.sport||"Training"}
function planChip(p){const k=planKind(p);return k==="routine"?"Kracht":k==="rest"?"Rust":k==="other"?"Overig":(p.sport||"Duur")}
function sessionSummary(s){if(!s)return "";if(s.kind==="check")return "Afgevinkt";if(s.kind==="cardio")return cardioSummary(s);const n=(s.entries||[]).reduce((t,e)=>t+(e.sets||[]).length,0);const e=(s.entries||[]).length;return `${e} oefening${e===1?"":"en"} · ${n} set${n===1?"":"s"}`}
function dayName(iso){const t=today();const w=new Date(iso+"T12:00:00").toLocaleDateString("nl-NL",{weekday:"long"});const lbl=iso===t?"Vandaag":iso===addDays(t,1)?"Morgen":iso===addDays(t,-1)?"Gisteren":w.charAt(0).toUpperCase()+w.slice(1);return `${lbl} ${new Date(iso+"T12:00:00").toLocaleDateString("nl-NL",{day:"numeric",month:"short"})}`}
function weekStart(iso){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()-((d.getDay()+6)%7));return isoOf(d)}
function weekNo(iso){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+3-((d.getDay()+6)%7));const y=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-y)/864e5-3+((y.getDay()+6)%7))/7)}
function planItemBtn(p,late){
  const k=planKind(p);
  if(k==="rest")return "";
  if(k==="routine")return `<button class="btn ${late?"":"primary"}" data-act="plan-start" data-id="${p.id}">Start training</button>`;
  if(k==="other")return `<button class="btn" data-act="pl-check" data-id="${p.id}">Afvinken als gedaan</button>`;
  return `<button class="btn ${late?"":"primary"}" data-act="plan-start" data-id="${p.id}">${late?"Toch nog loggen":"Training loggen"}</button>`;
}
function viewPlanCard(){
  const t=today(),to=addDays(t,14),from=addDays(t,-7);
  const all=planList();
  const show=all.filter(p=>{const done=planDoneFor(p);if(p.date===t)return true;if(!p.coach)return false;if(p.date>t&&p.date<=to)return true;return p.date<t&&p.date>=from&&!done})
    .sort((a,b)=>a.date.localeCompare(b.date)||(a.updated||0)-(b.updated||0));
  if(!show.length)return "";
  return `<h2>Op je planning</h2><div class="stack">${show.map(p=>{
    const done=planDoneFor(p),late=!done&&p.date<t,k=planKind(p);
    const tg=k==="cardio"?planTargets(p):"",txt=p.desc||p.note||"";
    return `<article class="card plan k-${k} c-${planCat(p)}${done?" done":""}${late?" late":""}"><div class="ph"><span class="pd">${esc(dayLabel(p.date))}${p.time?` · ${esc(p.time)}`:""}</span><span class="chip">${esc(planChip(p))}</span></div>
      <strong class="pt">${esc(planTitle(p))}</strong>${tg?`<span class="muted small">${tg}</span>`:""}
      ${txt?`<p class="pdesc">${esc(txt)}</p>`:""}
      ${done?`<div class="pdone">✓ Gedaan: ${sessionSummary(done)}</div>`:planItemBtn(p,late)}
      ${p.coach?`<span class="small muted">Van ${esc(p.coach)}${late?" · nog niet gelogd":""}</span>`:""}</article>`}).join("")}</div><button class="linkbtn" data-act="go-plan">Hele week bekijken →</button>`;
}
function viewPlan(){
  if(UI.sc)return viewSportCoach();
  if(UI.ec)return viewEnduranceCoach();
  const t=today(),ws=UI.week||weekStart(t),days=[...Array(7)].map((_,i)=>addDays(ws,i)),items=planList();
  let planned=0,done=0;
  const dayHtml=days.map(d=>{
    const its=items.filter(p=>p.date===d).sort((a,b)=>(a.updated||0)-(b.updated||0));
    const linked=new Set(its.map(p=>{const x=planDoneFor(p);return x&&x.id}).filter(Boolean));
    const extra=sortedSessions().filter(s=>s.date===d&&!linked.has(s.id));
    its.forEach(p=>{if(planKind(p)!=="rest"){planned++;if(planDoneFor(p))done++}});
    return `<section class="day${d===t?" today":""}${d<t?" past":""}"><div class="dh"><span class="dn">${esc(dayName(d))}</span><button class="linkbtn" data-act="pl-add" data-id="${d}">+ Plannen</button></div>
      ${its.map(p=>planRow(p,d<t)).join("")}
      ${extra.map(s=>`<button class="prow done" data-act="open-session" data-id="${s.id}"><span class="pk">${s.kind==="cardio"?esc(s.sport):"Kracht"}</span><span class="pn">${esc(s.routineName||"Training")} <span class="muted small">· niet gepland</span></span><span class="ps">✓ ${sessionSummary(s)}</span></button>`).join("")}
      ${!its.length&&!extra.length?`<p class="dempty">Nog niets gepland</p>`:""}</section>`;
  }).join("");
  return wcCard()+`<button class="card start" style="margin-top:16px" data-act="sc-open"><span><span class="name">Sportschema op maat</span><br><span class="muted small">Al je sporten in één verantwoord weekplan: fitness, duursport en teamsport</span></span><span class="go">Start</span></button><div class="weekbar card" style="margin-top:10px"><button class="ib wkb" data-act="wk-prev" aria-label="Vorige week">‹</button><div class="wk"><b>Week ${weekNo(ws)}</b><span class="muted small">${dateTxt(days[0])} – ${dateTxt(days[6])}</span></div><button class="ib wkb" data-act="wk-next" aria-label="Volgende week">›</button></div>
    <div class="weeksum">${planned?`<b>${done} van ${planned}</b> geplande training${planned>1?"en":""} gedaan`:"Nog niets gepland deze week"}${ws!==weekStart(t)?` · <button class="linkbtn" data-act="wk-today">naar deze week</button>`:""}</div>
    <div class="days">${dayHtml}</div>
    <div class="btnrow" style="margin-top:12px"><button class="btn" data-act="wk-copy">Deze week kopiëren naar volgende week</button><button class="btn" data-act="watch">Naar je agenda</button></div>
    <p class="small muted">Tik op een dag om een schema, duurtraining, rustdag of andere sport te plannen. Gedane trainingen krijgen vanzelf een vinkje.</p>`;
}
function planRow(p,past){
  const done=planDoneFor(p),k=planKind(p);
  const st=done?`✓ ${sessionSummary(done)}`:k==="rest"?"":past?"Niet gedaan":"Gepland";
  return `<button class="prow k-${k} c-${planCat(p)}${done?" done":""}${!done&&past&&k!=="rest"?" miss":""}" data-act="pl-open" data-id="${p.id}"><span class="pk">${esc(planChip(p))}</span><span class="pn">${p.time?`<b class="ptime">${esc(p.time)}</b> `:""}${esc(planTitle(p))}${p.coach?` <span class="muted small">· van ${esc(p.coach)}</span>`:""}</span>${st?`<span class="ps">${st}</span>`:""}</button>`;
}
function plAddSheet(sh){
  const kinds=[["routine","Schema"],["cardio","Duur"],["rest","Rust"],["other","Anders"]].filter(([k])=>k!=="cardio"||spCardio().length||sh.kind==="cardio");
  const hasR=Object.keys(S.routines).length>0;
  let h=`<div class="sh"><h2>${esc(dayName(sh.date))}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
    ${linksWith("plan").length?`<div class="f">Voor wie?<div class="chips"><button class="chipb" data-act="pa-for" data-id="" aria-pressed="${!sh.forLink}">Mezelf</button>${linksWith("plan").map(l=>`<button class="chipb" data-act="pa-for" data-id="${l.id}" aria-pressed="${sh.forLink===l.id}">${esc(l.name)}</button>`).join("")}</div></div>`:""}
    ${sh.forLink?`<label class="f">Datum<input type="date" id="pa-date" value="${esc(sh.date)}"></label>`:""}
    <div class="f">Wat plan je?<div class="seg ${spSeg(kinds.length)}">${kinds.map(([k,l])=>`<button class="segb" data-act="pa-kind" data-v="${k}" aria-pressed="${sh.kind===k}">${l}</button>`).join("")}</div></div>`;
  if(sh.kind==="routine")h+=hasR?`<label class="f">Schema${routineSelect("pa-routine",sh.routineId)}</label>`:`<p class="muted" style="margin:0">Je hebt nog geen schema's. Maak er eerst een onder Schema's.</p>`;
  if(sh.kind==="cardio")h+=`<div class="f">Sport${spCardioSeg("pa-sport",sh.sport)}</div>
    <label class="f">Omschrijving <i>optioneel</i><input type="text" id="pa-title" value="${esc(sh.title)}" placeholder="Bijv. Rustige duurloop"></label>
    <div class="grid2"><label class="f">Duur <i>optioneel</i><input type="text" inputmode="numeric" id="pa-dur" value="${esc(sh.durMin)}" placeholder="min"></label><label class="f">Afstand <i>optioneel</i><input type="text" inputmode="decimal" id="pa-km" value="${esc(sh.km)}" placeholder="km"></label></div>${icuField(sh)}`;
  if(sh.kind==="other")h+=`<label class="f">Wat ga je doen?<input type="text" id="pa-title" value="${esc(sh.title)}" placeholder="Bijv. Voetbal, zwemmen, padel"></label>`;
  if(sh.kind!=="rest")h+=`<label class="f">Notitie <i>optioneel</i><textarea id="pa-note" rows="2" placeholder="Bijv. samen met een vriend, of: rustig aan na beendag">${esc(sh.note)}</textarea></label>`;
  h+=`<label class="f">Tijdstip <i>optioneel, handig voor je agenda</i><input type="time" id="pa-time" value="${esc(sh.time||"")}"></label><label class="f">Herhalen<select id="pa-rep">${[["1","Alleen deze dag"],["2","2 weken, elke week"],["4","4 weken, elke week"],["8","8 weken, elke week"],["12","12 weken, elke week"]].map(([v,l])=>`<option value="${v}" ${sh.repeat===v?"selected":""}>${l}</option>`).join("")}</select></label>
    <button class="btn primary" data-act="pa-save" ${sh.kind==="routine"&&!hasR?"disabled":""}>${sh.forLink?`Versturen naar ${esc((soc().outgoing.find(l=>l.id===sh.forLink)||{}).name||"")}`:"Inplannen"}</button></div>`;
  return h;
}
async function planAddSave(){
  const sh=UI.sheet,k=sh.kind,base={type:k,own:true,updated:Date.now()};
  {const tm=document.getElementById("pa-time")?.value||sh.time;if(tm)base.time=tm}
  if(k!=="rest"&&(sh.note||"").trim())base.note=sh.note.trim();
  if(k==="routine"){const rid=document.getElementById("pa-routine")?.value;if(!rid||!S.routines[rid]){toast("Kies een schema.");return}Object.assign(base,{routineId:rid,routineName:S.routines[rid].name})}
  if(k==="cardio"){Object.assign(base,{sport:sh.sport||"Hardlopen",title:(sh.title||"").trim()||sh.sport||"Hardlopen",durMin:num(sh.durMin),km:num(sh.km)});const sc=(sh.steps||"").trim();if(sc){const P=icuParse(sc);if(P.blocks.length){base.steps=sc.slice(0,3000);const T=icuTotals(P);if(!base.durMin&&T.min)base.durMin=Math.round(T.min);if(!base.km&&T.km)base.km=Math.round(T.km*10)/10;if(!(sh.title||"").trim()&&P.title)base.title=P.title.slice(0,60)}}}
  if(k==="other"){if(!(sh.title||"").trim()){toast("Vul in wat je gaat doen, bijvoorbeeld Voetbal.");document.getElementById("pa-title")?.focus();return}base.title=sh.title.trim()}
  const n=Math.max(1,parseInt(sh.repeat)||1),stem=uid();
  if(sh.forLink){if(!sh.date){toast("Kies een datum.");return}const pl={...base};delete pl.own;delete pl.updated;delete pl.routineId;
    const data={name:planTitle(base),dates:[...Array(n)].map((_,i)=>addDays(sh.date,7*i)),plan:pl};if(k==="routine")data.routine=pkgRoutine(S.routines[base.routineId]);
    if(await sendTo(sh.forLink,"plan",data)){UI.sheet=null;render()}return}
  await runJobs([...Array(n)].map((_,i)=>["plan",stem+"p"+i,{...base,date:addDays(sh.date,7*i)}]),put);
  UI.sheet=null;toastOk(n>1?`${n} weken ingepland`:"Ingepland");render();
}
function plItemSheet(sh){
  const p0=S.plan[sh.id];if(!p0)return null;
  const p={id:sh.id,...p0},k=planKind(p),done=planDoneFor(p),t=today();
  const tg=k==="cardio"?planTargets(p):"",txt=p.desc||p.note||"";
  let h=`<div class="sh"><h2>${esc(dayName(p.date))}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card plan k-${k} c-${planCat(p)}${done?" done":""}"><div class="ph"><span class="chip">${esc(planChip(p))}</span>${p.coach?`<span class="small muted">van ${esc(p.coach)}</span>`:""}</div><strong class="pt">${esc(planTitle(p))}</strong>${tg?`<span class="muted small">${tg}</span>`:""}${txt?`<p class="pdesc">${esc(txt)}</p>`:""}
    ${done?`<div class="pdone">✓ Gedaan: ${sessionSummary(done)}</div>${done.kind==="check"?`<button class="btn ghost" data-act="pl-uncheck" data-id="${p.id}">Toch niet gedaan</button>`:""}`:planItemBtn(p,p.date<t)}</div>
    ${k==="cardio"?icuBox(p):""}<div class="btnrow" style="margin-top:10px"><button class="btn ghost" data-act="wo-copy" data-id="${p.id}">Kopieer training</button><a class="btn ghost" href="${esc(gcalUrl(p))}" target="_blank" rel="noopener">Zet in Google Agenda</a></div><div class="card stack" style="margin-top:10px"><div class="grid2"><label class="f">Datum<input type="date" id="pl-date" value="${esc(p.date)}"></label><label class="f">Tijdstip <i>optioneel</i><input type="time" id="pl-time" value="${esc(p.time||"")}"></label></div><button class="btn" data-act="pl-move" data-id="${p.id}">Datum en tijd opslaan</button></div>`;
  h+=`<div style="margin-top:12px">${UI.confirm==="pl-del"?`<div class="confirm"><span>Uit je planning halen?${done&&done.kind!=="check"?" Je gelogde training blijft bewaard.":""}</span><div class="btnrow"><button class="btn danger" data-act="pl-del-yes" data-id="${p.id}">Verwijderen</button><button class="btn" data-act="confirm-no">Behouden</button></div></div>`:`<button class="btn ghost danger" data-act="pl-del">Uit planning verwijderen</button>`}</div>`;
  return h;
}
async function weekCopy(){
  const ws=UI.week||weekStart(today()),we=addDays(ws,6),items=planList();
  const src=items.filter(p=>p.date>=ws&&p.date<=we&&!p.coach);
  if(!src.length){toast("Er staat deze week nog niets in je eigen planning om te kopiëren.");return}
  const key=p=>[p.date,planKind(p),p.routineId||"",p.title||"",p.sport||""].join("|");
  const have=new Set(items.map(key)),stem=uid(),jobs=[];
  src.forEach((p,i)=>{const {id,doneAt,...rest}=p;const np={...rest,date:addDays(p.date,7),updated:Date.now()};if(!have.has(key(np)))jobs.push(["plan",stem+"c"+i,np])});
  if(!jobs.length){toast("Volgende week staat dit al in je planning.");return}
  await runJobs(jobs,put);UI.week=addDays(ws,7);toastOk(`${jobs.length} onderde${jobs.length>1?"len":"el"} gekopieerd naar volgende week`);render();window.scrollTo(0,0);
}
function shareSheet(sh){
  const can=!!navigator.share;
  return `<div class="sh"><h2>${sh.kind==="folder"?"Map":"Schema"} delen</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
    <div class="card stack"><p class="hp">Stuur deze code of link naar een vriend. Die kan "${esc(sh.name)}" dan met één tik aan zijn eigen schema's toevoegen. Zijn resultaten blijven van hemzelf.</p>
    <div class="sharecode" aria-label="Deelcode">${esc(sh.code)}</div>
    ${can?`<button class="btn primary" data-act="sh-native">Delen via WhatsApp, berichten…</button>`:""}
    <button class="btn ${can?"":"primary"}" data-act="sh-copy">Kopieer bericht met link</button>
    <p class="small muted" style="margin:0">Ontvanger vult de code in bij <b>Schema's → Gedeeld schema toevoegen</b>, of opent de link en logt in.</p></div>`;
}
function importSheet(sh){
  const d=sh.data||{},rs=d.routines||[];
  return `<div class="sh"><h2>${d.type==="folder"?"Gedeelde map":"Gedeeld schema"}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
    <div class="card stack"><div><strong style="font-family:var(--display);font-size:22px">${esc(d.name||"")}</strong>${d.by?`<div class="muted small">Gedeeld door ${esc(d.by)}</div>`:""}</div>
    ${rs.map(r=>`<div class="fitem"><div class="fi-n">${esc(r.name)}</div><div class="fi-x">${(r.items||[]).map(i=>esc(i.name)).join(" · ")}</div></div>`).join("")}
    <p class="small muted" style="margin:0">${d.type==="folder"?"Wordt toegevoegd als nieuwe map.":"Komt bij je schema's onder \"Zonder map\". Je kunt het daarna in een map zetten."} Oefeningen die je al hebt, delen hun records met je bestaande geschiedenis.</p>
    <button class="btn primary" data-act="sh-import">Toevoegen aan mijn schema's</button></div>`;
}
const EXTRA_SHEETS={"pl-add":plAddSheet,"pl-item":plItemSheet,"share":shareSheet,"import":importSheet};

