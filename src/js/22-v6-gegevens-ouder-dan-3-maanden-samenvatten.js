/* ---------- v6: gegevens ouder dan 3 maanden samenvatten ---------- */
const KEEP_DAYS=92;
let compacting=false;
const monthTxt=m=>new Date(m+"-15T12:00:00").toLocaleDateString("nl-NL",{month:"long",year:"numeric"});
function runEfforts(s){const out={};if(!isRunBike(s.sport))return out;
  for(const d of (s.sport==="Wielrennen"?BIKE_D:RUN_D)){let sec=null,est=false;if(s.efforts&&s.efforts[String(d)])sec=s.efforts[String(d)];else if(s.km&&s.durMin&&s.km>=d-0.05){sec=s.durMin*60/s.km*d;est=Math.abs(s.km-d)>0.05}if(sec)out[String(d)]={sec:Math.round(sec),est}}
  return out}
async function compactOld(){
  if(compacting||!pid||S.mode!=="cloud"||queue().length)return;
  const cutoff=addDays(today(),-KEEP_DAYS),id=pid;
  const oldS=Object.entries(S.sessions).filter(([,s])=>s&&s.date&&s.date<cutoff&&!(s.importAt&&Date.now()-s.importAt<IMP_UNDO_DAYS*864e5));
  const oldF=Object.entries(S.foodlog).filter(([d])=>d<cutoff);
  const oldP=Object.entries(S.plan).filter(([,p])=>p&&p.date&&p.date<cutoff);
  if(!oldS.length&&!oldF.length&&!oldP.length)return;
  compacting=true;
  try{
    const arch={},get=m=>arch[m]||(arch[m]=clone(S.archive[m]||{month:m,n:0,str:{},cardio:{},food:{days:0,k:0,p:0,c:0,f:0},done:[]}));
    for(const [sid,s] of oldS){const a=get(s.date.slice(0,7));if(a.done.includes(sid))continue;a.done.push(sid);a.n++;
      if(s.kind==="cardio"){const c=a.cardio[s.sport]||(a.cardio[s.sport]={n:0,km:0,min:0,longest:null,eff:{}});c.n++;c.km+=s.km||0;c.min+=s.durMin||0;
        if(s.km&&(!c.longest||s.km>c.longest.km))c.longest={km:s.km,date:s.date};
        for(const [d,e] of Object.entries(runEfforts(s)))if(!c.eff[d]||e.sec<c.eff[d].sec)c.eff[d]={...e,date:s.date}}
      else for(const e of s.entries||[]){const k=entryKey(e),r=a.str[k]||(a.str[k]={name:exName(e.exId,e.name),group:exGroup(e.exId,e.group),best:null,date:null,sessions:0});r.sessions++;
        for(const st of e.sets||[])if(st.r>0&&better(st,r.best)){r.best={k:st.k,r:st.r};r.date=s.date}}}
    for(const [d,doc] of oldF){const a=get(d.slice(0,7)),key="f:"+d;if(a.done.includes(key))continue;a.done.push(key);const its=(doc&&doc.items)||[];if(!its.length)continue;const t=sumM(its);a.food.days++;a.food.k+=t.k;a.food.p+=t.p;a.food.c+=t.c;a.food.f+=t.f}
    if(pid!==id)return;
    await runJobs(Object.entries(arch).map(([m,a])=>["archive",m,a]),put);
    if(queue().length||pid!==id)return;
    await runJobs([...oldS.map(([k])=>["sessions",k]),...oldF.map(([k])=>["foodlog",k]),...oldP.map(([k])=>["plan",k])],del);
    render();
  }finally{compacting=false}
}
function archList(){return Object.values(S.archive||{}).filter(a=>a&&a.month).sort((a,b)=>b.month.localeCompare(a.month))}
function bestFor(exId){
  const k=exKey(exId);let best=null,date=null;
  for(const s of Object.values(S.sessions))for(const e of s.entries||[])if(entryKey(e)===k)for(const st of e.sets||[])if(st.r>0&&better(st,best)){best=st;date=s.date}
  for(const a of archList()){const r=a.str&&a.str[k];if(r&&r.best&&better(r.best,best)){best=r.best;date=r.date}}
  return best?{set:best,date}:null;
}
function lastFor(exId){
  const k=exKey(exId);
  for(const s of sortedSessions()){const e=(s.entries||[]).find(x=>entryKey(x)===k);if(e&&e.sets&&e.sets.length)return{sets:e.sets,date:s.date,name:s.routineName}}
  for(const a of archList()){const r=a.str&&a.str[k];if(r&&r.best)return{sets:[r.best],date:r.date,name:"samenvatting"}}
  return null;
}
function historyFor(exId){
  const k=exKey(exId),out=[];
  for(const s of sortedSessions()){const e=(s.entries||[]).find(x=>entryKey(x)===k);if(e&&e.sets&&e.sets.length)out.push({date:s.date,name:s.routineName,sets:e.sets})}
  for(const a of archList()){const r=a.str&&a.str[k];if(r&&r.best)out.push({date:r.date,name:`Samenvatting ${monthTxt(a.month)} · ${r.sessions}× getraind · beste set`,sets:[r.best]})}
  return out;
}
function distRecords(sport){
  const ds=sport==="Wielrennen"?BIKE_D:RUN_D,list=cardioSessions(sport),out=[];
  for(const d of ds){
    let best=null;
    for(const s of list){const e=runEfforts(s)[String(d)];if(e&&(!best||e.sec<best.sec))best={...e,date:s.date,id:s.id}}
    for(const a of archList()){const e=a.cardio&&a.cardio[sport]&&a.cardio[sport].eff[String(d)];if(e&&(!best||e.sec<best.sec))best={...e,id:null}}
    if(best)out.push({d,...best});
  }
  return out;
}
function viewCardioRecords(){
  const all=cardioSessions(),arch=archList();
  const archN=sp=>arch.reduce((t,a)=>t+((a.cardio&&a.cardio[sp]&&a.cardio[sp].n)||0),0);
  const sports=new Set([...all.map(s=>s.sport),...arch.flatMap(a=>Object.keys(a.cardio||{}))]);
  if(!sports.size&&!arch.length)return "";
  const month=today().slice(0,7);let h="";
  for(const sp of ["Hardlopen","Wielrennen"].filter(spCardioOk)){
    if(!sports.has(sp))continue;
    const l=cardioSessions(sp),n=l.length+archN(sp);
    const kmMonth=l.filter(s=>(s.date||"").startsWith(month)).reduce((t,s)=>t+(s.km||0),0);
    const longest=Math.max(0,...l.map(s=>s.km||0),...arch.map(a=>(a.cardio&&a.cardio[sp]&&a.cardio[sp].longest&&a.cardio[sp].longest.km)||0));
    const recs=distRecords(sp);
    h+=`<h2>${sp}</h2><div class="recgroup"><div class="row" style="cursor:default"><span class="n">Deze maand</span><span class="b">${fmt1(kmMonth)} km</span><span class="l">${n} ${n===1?"training":"trainingen"} totaal · langste ${fmt1(longest)} km</span></div>`+
      recs.map(r=>`<${r.id?`button class="row" data-act="open-session" data-id="${r.id}"`:`div class="row" style="cursor:default"`}><span class="n">${distLbl(r.d)}</span><span class="b">${r.est?"≈ ":""}${durTxt(r.sec/60)}</span><span class="l">${sp==="Hardlopen"?paceTxt(r.sec/60,r.d):fmt1(r.d/(r.sec/3600))+" km/u"} · ${dateTxt(r.date)}${r.est?" · o.b.v. gemiddeld tempo":""}</span></${r.id?"button":"div"}>`).join("")+`</div>`;
  }
  if(sports.has("Hardlopen")||sports.has("Wielrennen"))h+=`<p class="small muted">≈ = berekend met het gemiddelde tempo van een langere training.</p>`;
  const others=[...sports].filter(s=>!isRunBike(s)).sort();
  if(others.length){
    h+=`<h2>Overige sporten</h2><div class="recgroup">`+others.map(nm=>{const l=cardioSessions(nm),n=l.length+archN(nm),mins=l.filter(s=>(s.date||"").startsWith(month)).reduce((t,s)=>t+(s.durMin||0),0);
      return `<div class="row" style="cursor:default"><span class="n">${esc(nm)}</span><span class="b">${n}×</span><span class="l">${mins?`Deze maand ${Math.floor(mins/60)?Math.floor(mins/60)+" u ":""}${Math.round(mins%60)} min`:"Deze maand nog niet"}${l.length?` · laatst ${dateTxt(l[0].date)}`:""}</span></div>`}).join("")+`</div>`;
  }
  if(arch.length)h+=`<h2>Eerdere maanden</h2><div class="recgroup">${arch.slice(0,24).map(a=>{const c=Object.entries(a.cardio||{}).map(([s,x])=>`${esc(s)} ${x.n}×${x.km?` (${fmt1(x.km)} km)`:""}`).join(" · "),strN=a.n-Object.values(a.cardio||{}).reduce((t,x)=>t+x.n,0),fd=a.food&&a.food.days;
    return `<div class="row" style="cursor:default"><span class="n">${monthTxt(a.month)}</span><span class="b none">${a.n} training${a.n===1?"":"en"}</span><span class="l">${strN?`Kracht ${strN}×`:""}${strN&&c?" · ":""}${c}${fd?` · voeding gemiddeld ${nl(a.food.k/fd)} kcal (${fd} dagen)`:""}</span></div>`}).join("")}</div><p class="small muted">Details ouder dan 3 maanden worden samengevat. Je records blijven altijd bewaard.</p>`;
  return h;
}

document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;
  switch(b.dataset.act){
    case "consent-yes":await giveConsent();break;
    case "consent-no":UI.confirm="self-del";render();setTimeout(()=>document.getElementById("sd-pin")?.focus(),30);break;
    case "self-del":UI.confirm="self-del";render();setTimeout(()=>document.getElementById("sd-pin")?.focus(),30);break;
    case "self-del-yes":await selfDelete();break;
    case "go-privacy":UI.tab="privacy";lsSet(LS_TAB,"privacy");UI.sheet=null;render();window.scrollTo(0,0);break;
    case "login-privacy":UI.login="privacy";render();window.scrollTo(0,0);break;
  }
});

