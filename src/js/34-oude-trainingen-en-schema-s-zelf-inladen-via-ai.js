/* ---------- oude trainingen en schema's zelf inladen (via AI-opdracht of CSV) ---------- */
const IMP_MAX_BYTES=3e6,IMP_MAX_SES=1000,IMP_UNDO_DAYS=7;
const IMP_PROMPT=`Zet mijn trainingsgegevens om naar JSON voor de app Athlevon. Geef ALLEEN de JSON terug, zonder uitleg ervoor of erna.

Regels:
- Verzin niets. Staat iets er niet bij, laat het dan weg. Onbekende datum: "date": null.
- Datums als "JJJJ-MM-DD". Gewicht altijd in kg (zet lbs om: × 0,4536). Lichaamsgewicht-oefening: "k": 0.
- Elke set apart in "sets" met "k" (kg) en "r" (herhalingen). "3 × 10 met 50 kg" wordt drie keer {"k":50,"r":10}.
- "group" kies je uit: Borst, Rug, Schouders, Biceps, Triceps, Onderarmen, Core, Quadriceps, Hamstrings, Billen, Kuiten, Full body, Overig.
- Duurtrainingen (hardlopen, fietsen, zwemmen) zet je in "sessions" met "sport", "km" en "min" (duur in minuten), zonder "entries".
- Schema's (wat je van plan bent te doen, zonder resultaten) zet je in "routines".

Formaat:
{"type":"krachtlogboek","folder":"Mijn oude schema's",
 "sessions":[
  {"date":"2025-03-04","name":"Push","entries":[
    {"name":"Bench Press","group":"Borst","sets":[{"k":60,"r":10},{"k":60,"r":8}]},
    {"name":"Dips","group":"Triceps","sets":[{"k":0,"r":12}]}]},
  {"date":"2025-03-06","sport":"Hardlopen","km":8.2,"min":46}],
 "routines":[
  {"name":"Pull","items":[{"name":"Lat Pulldown","group":"Rug","sets":"3","reps":"8-12","note":""}]}]}

Mijn gegevens:
`;
const IMP_GROUPS=[[/hamstring|leg ?curl|nordic|rdl|romanian|good ?morning|stiff/i,"Hamstrings"],[/hip ?thrust|glute|bil|kickback|abduct/i,"Billen"],[/calf|kuit/i,"Kuiten"],
  [/squat|leg ?press|beenpers|lunge|uitval|leg ?ext|step.?up|hack/i,"Quadriceps"],[/deadlift|row|roei|pull.?up|chin|optrek|lat |pulldown|pullover|shrug/i,"Rug"],
  [/bench|bank|chest|borst|fly|flies|push.?up|opdruk|pec/i,"Borst"],[/tricep|dip|push.?down|skull|french/i,"Triceps"],[/curl/i,"Biceps"],
  [/shoulder|schouder|overhead|military|ohp|lateral|zijwaarts|face ?pull|arnold|raise/i,"Schouders"],[/plank|crunch|sit.?up|core|buik|ab |abs|leg raise|russian|hollow|dead ?bug/i,"Core"],[/wrist|pols|onderarm|grip|farmer/i,"Onderarmen"],[/burpee|thruster|clean|snatch|kettlebell swing/i,"Full body"]];
function impGroup(name,g){if(g==="Benen")return legGroup(name);if(GROUPS.includes(g))return g;for(const [re,x] of IMP_GROUPS)if(re.test(name||""))return x;return "Overig"}
const IMP_MON={jan:1,feb:2,mrt:3,mar:3,apr:4,mei:5,may:5,jun:6,jul:7,aug:8,sep:9,okt:10,oct:10,nov:11,dec:12};
function impDate(v){
  if(v==null||v==="")return null;let s=String(v).trim(),y,m,d,x;
  if((x=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)))[y,m,d]=[+x[1],+x[2],+x[3]];
  else if((x=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/))){[d,m,y]=[+x[1],+x[2],+x[3]];if(y<100)y+=2000;if(m>12&&d<=12)[d,m]=[m,d]}
  else if((x=s.match(/^(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})/i))){d=+x[1];m=IMP_MON[x[2].toLowerCase()];y=+x[3]}
  else if((x=s.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i))){m=IMP_MON[x[1].toLowerCase()];d=+x[2];y=+x[3]}
  if(!y||!m||!d||m>12||d>31)return undefined;
  const iso=`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`,t=new Date(iso+"T12:00:00");
  if(isNaN(t)||t.getDate()!==d)return undefined;return iso;
}
const impNum=v=>{if(typeof v==="number")return v;const n=parseFloat(String(v??"").replace(",",".").replace(/[^\d.\-]/g,""));return isNaN(n)?null:n};
function impExtract(txt){
  let s=String(txt||"").replace(/```(?:json)?/gi,"").trim();
  const a=s.search(/[\[{]/);if(a<0)throw new Error("er staat geen gegevensblok in");
  const open=s[a],close=open==="{"?"}":"]",b=s.lastIndexOf(close);if(b<=a)throw new Error("het gegevensblok is niet compleet (misschien niet helemaal gekopieerd?)");
  s=s.slice(a,b+1).replace(/[“”]/g,'"').replace(/,\s*([}\]])/g,"$1");
  try{return JSON.parse(s)}catch(e){throw new Error("het gegevensblok bevat een fout. Vraag de AI om het opnieuw te maken, of kopieer het hele antwoord")}
}
function impCardioSport(n){const t=norm(n);return /loop|run|hardlo|jog/.test(t)?"Hardlopen":/fiets|wiel|bike|cycl|ride|spinning/.test(t)?"Wielrennen":/zwem|swim/.test(t)?"Zwemmen":null}
function impNormalize(obj){
  const out={ses:[],cardio:[],routines:[],folder:"",skip:[],nSets:0};
  if(Array.isArray(obj))obj={sessions:obj};
  if(!obj||typeof obj!=="object")throw new Error("dit is geen trainingsbestand");
  if(obj.type==="routine")obj={routines:[obj]};
  out.folder=String(obj.folder||(obj.type==="folder"?obj.name:"")||"").trim().slice(0,60);
  const max=today(),sesIn=Array.isArray(obj.sessions)?obj.sessions:[],rIn=Array.isArray(obj.routines)?obj.routines:[];
  if(!sesIn.length&&!rIn.length)throw new Error("er staan geen trainingen of schema's in");
  if(sesIn.length>IMP_MAX_SES)throw new Error(`het zijn ${sesIn.length} trainingen; je kunt er maximaal ${IMP_MAX_SES} per keer inladen. Splits het bestand`);
  sesIn.forEach((s,i)=>{
    if(!s||typeof s!=="object"){out.skip.push(`Regel ${i+1}: onleesbaar`);return}
    const label=String(s.name||s.title||s.sport||`Training ${i+1}`).trim().slice(0,80);
    let date=impDate(s.date);if(date===undefined){out.skip.push(`${label}: datum "${String(s.date).slice(0,20)}" niet herkend`);return}
    if(date&&date>max){out.skip.push(`${label} (${date}): datum ligt in de toekomst`);return}
    if(date&&date<"2000-01-01"){out.skip.push(`${label}: datum voor 2000`);return}
    const sport=s.sport?impCardioSport(s.sport)||String(s.sport).slice(0,30):(!Array.isArray(s.entries)&&(s.km||s.min||s.durMin)?impCardioSport(label):null);
    if(sport&&!(Array.isArray(s.entries)&&s.entries.length)){
      const km=impNum(s.km),min=impNum(s.min??s.durMin??s.duration);
      if(!(min>0&&min<=1440)){out.skip.push(`${label}${date?" ("+date+")":""}: geen geldige duur in minuten`);return}
      if(km!=null&&!(km>=0&&km<=400)){out.skip.push(`${label}: afstand ${km} km is niet realistisch`);return}
      out.cardio.push({date,sport,name:label,km:km>0?Math.round(km*100)/100:null,min:Math.round(min*100)/100});return}
    if(!Array.isArray(s.entries)||!s.entries.length){out.skip.push(`${label}: geen oefeningen`);return}
    const entries=[];
    for(const e of s.entries.slice(0,40)){const name=String(e&&(e.name||e.exercise)||"").trim().slice(0,80);if(!name)continue;
      let sets=Array.isArray(e.sets)?e.sets:[];
      if(!sets.length&&(e.reps||e.r)){const n=Math.min(20,Math.max(1,Math.round(impNum(e.sets)||1)));sets=Array(n).fill({k:e.kg??e.k??e.weight??0,r:e.reps??e.r})}
      const clean=[];for(const x of sets.slice(0,50)){const k=impNum(x&&(x.k??x.kg??x.weight))||0,r=Math.round(impNum(x&&(x.r??x.reps))||0);
        if(r<=0)continue;if(k<0||k>500||r>200){out.skip.push(`${label}${date?" ("+date+")":""}: ${name} ${k} kg × ${r} is niet realistisch`);continue}clean.push({k:Math.round(k*100)/100,r})}
      if(clean.length){entries.push({name,group:impGroup(name,e.group),sets:clean});out.nSets+=clean.length}}
    if(entries.length)out.ses.push({date,name:label,entries});else out.skip.push(`${label}: geen geldige sets`)});
  rIn.slice(0,60).forEach((r,i)=>{const items=(Array.isArray(r&&r.items)?r.items:[]).slice(0,40).map(it=>cleanItem({...it,group:impGroup(it&&it.name,it&&it.group)})).filter(it=>it.name);
    if(items.length)out.routines.push({name:String(r.name||`Schema ${i+1}`).slice(0,80),items});else out.skip.push(`Schema "${String(r&&r.name||i+1).slice(0,40)}": geen oefeningen`)});
  if(!out.ses.length&&!out.cardio.length&&!out.routines.length)throw new Error("er is niets bruikbaars gevonden"+(out.skip.length?`: ${out.skip[0]}`:""));
  return out;
}
/* CSV: eigen tabel (Excel, Numbers, Google Spreadsheets) of export uit Strong / Hevy */
function impCsvRows(txt){
  txt=String(txt).replace(/^﻿/,"");const first=txt.split(/\r?\n/,1)[0]||"";
  const dl=[";","\t",","].sort((a,b)=>first.split(b).length-first.split(a).length)[0];
  const rows=[];let row=[],cur="",q=false;
  for(let i=0;i<txt.length;i++){const ch=txt[i];
    if(q){if(ch==='"'){if(txt[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}
    else if(ch==='"')q=true;else if(ch===dl){row.push(cur);cur=""}else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&txt[i+1]==="\n")i++;row.push(cur);cur="";if(row.some(c=>c.trim()))rows.push(row);row=[]}else cur+=ch}
  row.push(cur);if(row.some(c=>c.trim()))rows.push(row);return rows;
}
const IMP_COLS={date:["date","datum","start_time","start time","workout date","dag","starttijd"],workout:["workout name","workout","training","title","titel","schema","routine","naam training"],
  ex:["exercise name","exercise","exercise_title","oefening","oefening naam","naam"],kg:["weight","weight_kg","kg","gewicht","gewicht (kg)","weight (kg)","weight_lbs","lbs","gewicht kg"],
  reps:["reps","herhalingen","rep","aantal herhalingen","herh"],sets:["sets","aantal sets","series"],km:["distance","distance_km","km","afstand","afstand (km)"],
  min:["duration","duur","minuten","tijd","duur (min)","minutes"],sec:["duration_seconds","seconds","seconden"],unit:["weight unit","unit","eenheid"],type:["set_type","set type"],sport:["sport","activiteit","activity type","activity"]};
function impDurMin(v){const s=String(v||"").trim();if(!s)return null;let x;
  if((x=s.match(/^(\d+):(\d{1,2}):(\d{1,2})$/)))return +x[1]*60+ +x[2]+ +x[3]/60;if((x=s.match(/^(\d+):(\d{1,2})$/)))return +x[1]+ +x[2]/60;
  if(/[hum]/i.test(s)){const h=+(s.match(/(\d+)\s*(h|u)/i)||[,0])[1],m=+(s.match(/(\d+)\s*m/i)||[,0])[1];if(h||m)return h*60+m}return impNum(s)}
function impCsv(txt){
  const rows=impCsvRows(txt);if(rows.length<2)throw new Error("het bestand heeft geen regels onder de kopjes");
  const head=rows[0].map(h=>norm(h).replace(/^"|"$/g,"")),col={};
  for(const [k,names] of Object.entries(IMP_COLS)){const i=head.findIndex(h=>names.includes(h));if(i>=0)col[k]=i}
  if(col.ex==null&&col.sport==null)throw new Error(`geen kolom met de oefening gevonden. Gebruik bijvoorbeeld de kopjes: datum; oefening; kg; herhalingen (gevonden: ${rows[0].slice(0,6).join(", ")})`);
  const lbs=/lbs/.test(head[col.kg]||""),get=(r,k)=>col[k]!=null?String(r[col[k]]??"").trim():"";
  const map=new Map(),sessions=[];
  for(const r of rows.slice(1,20001)){
    const ds=get(r,"date"),wk=get(r,"workout"),ex=get(r,"ex"),date=impDate(ds),key=(date||ds)+"|"+wk;
    let s=map.get(key);if(!s){s={date:date===undefined?ds:date,name:wk||(ex&&!get(r,"reps")?ex:"Geïmporteerde training"),entries:[],_e:new Map()};map.set(key,s);sessions.push(s)}
    const reps=impNum(get(r,"reps")),km=impNum(get(r,"km")),min=col.sec!=null&&get(r,"sec")?impNum(get(r,"sec"))/60:impDurMin(get(r,"min")),sp=get(r,"sport")||ex;
    if(!(reps>0)&&(km>0||min>0)&&impCardioSport(sp)){sessions.push({date:s.date,sport:impCardioSport(sp),name:sp,km,min});continue}
    if(!ex||!(reps>0))continue;
    let k=impNum(get(r,"kg"))||0;if(lbs||/lb/i.test(get(r,"unit")))k=k*0.45359;
    let e=s._e.get(norm(ex));if(!e){e={name:ex,sets:[]};s._e.set(norm(ex),e);s.entries.push(e)}
    const n=col.sets!=null?Math.min(20,Math.max(1,Math.round(impNum(get(r,"sets"))||1))):1;for(let i=0;i<n;i++)e.sets.push({k:Math.round(k*100)/100,r:Math.round(reps)})}
  return{type:"krachtlogboek",sessions:sessions.filter(s=>s.sport||s.entries.length).map(({_e,...s})=>s)};
}
/* dubbelen herkennen */
const impKey=(date,name)=>(date||"?")+"|"+norm(name);
function impKnown(){const k=new Set();for(const s of Object.values(S.sessions||{}))k.add(impKey(s.date,s.routineName||s.sport));for(const it of (S.meta.imports&&S.meta.imports.list)||[])for(const x of it.keys||[])k.add(x);return k}
function impPrepare(obj,src){
  const N=impNormalize(obj),known=impKnown();let dup=0;const today0=today();
  const keep=a=>a.filter(s=>{const k=impKey(s.date||today0,s.name);if(known.has(k)){dup++;return false}known.add(k);return true});
  N.ses=keep(N.ses);N.cardio=keep(N.cardio);
  const have=new Set(Object.values(S.routines||{}).map(r=>norm(r.name)+"|"+(r.items||[]).map(i=>norm(exName(i.exId,""))).join(",")));
  N.routines=N.routines.filter(r=>{const k=norm(r.name)+"|"+r.items.map(i=>norm(i.name)).join(",");if(have.has(k)){dup++;return false}have.add(k);return true});
  N.dup=dup;N.src=src;
  const ds=[...N.ses,...N.cardio].map(s=>s.date).filter(Boolean).sort();N.from=ds[0];N.to=ds[ds.length-1];N.noDate=[...N.ses,...N.cardio].filter(s=>!s.date).length;
  N.nSets=N.ses.reduce((t,s)=>t+s.entries.reduce((u,e)=>u+e.sets.length,0),0);
  if(!N.ses.length&&!N.cardio.length&&!N.routines.length)throw new Error(dup?"alles in dit bestand staat al in je account":"er is niets bruikbaars gevonden");
  return N;
}
function impList(){return ((S.meta.imports&&S.meta.imports.list)||[]).slice().sort((a,b)=>b.at-a.at)}
async function impRun(N){
  const id="im"+uid(),at=Date.now(),exMap=new Map(Object.entries(S.exercises).map(([i,x])=>[norm(x.name),i])),ex=[],jobs=[];
  const resolve=(name,group)=>{const k=norm(name);if(exMap.has(k))return exMap.get(k);const i=uid()+ex.length;exMap.set(k,i);ex.push(["exercises",i,{name,group}]);return i};
  const keys=[],sids=[];
  N.ses.forEach((s,i)=>{const date=s.date||today(),sid=id+"s"+i;keys.push(impKey(date,s.name));sids.push(sid);
    jobs.push(["sessions",sid,{date,ts:(Date.parse(date+"T12:00:00")||at)+i,routineId:null,routineName:s.name,entries:s.entries.map(e=>({exId:resolve(e.name,e.group),name:e.name,group:e.group,sets:e.sets})),imported:true,importId:id,importAt:at}])});
  N.cardio.forEach((s,i)=>{const date=s.date||today(),sid=id+"c"+i,sport=CARDIO.includes(s.sport)?s.sport:"Anders";keys.push(impKey(date,s.name));sids.push(sid);
    jobs.push(["sessions",sid,{kind:"cardio",sport,date,ts:(Date.parse(date+"T12:00:00")||at)+i,routineName:sport==="Anders"?s.sport:sport,durMin:s.min,km:s.km,note:sport==="Anders"?s.sport:"",entries:[],imported:true,importId:id,importAt:at}])});
  let fid=null,rids=[];
  if(N.routines.length){let nm=N.folder||"Ingeladen schema's";if(folderList().some(f=>norm(f.name)===norm(nm)))nm+=` (${dateTxt(today())})`;fid="fd-"+uid();
    await put("folders",fid,{name:nm.slice(0,60),order:folderList().length});rids=await addRoutinesTo(N.routines,fid);UI.open["f:"+fid]=true;lsSet(LS_OPEN,UI.open)}
  await runJobs(ex,put);
  for(let i=0;i<jobs.length;i+=40){await runJobs(jobs.slice(i,i+40),put);if(jobs.length>80)toast(`Inladen… ${Math.min(i+40,jobs.length)} van ${jobs.length}`)}
  const list=impList().filter(x=>at-x.at<365*864e5).slice(0,19);
  list.unshift({id,at,n:N.ses.length,c:N.cardio.length,r:N.routines.length,src:N.src,keys:keys.slice(0,IMP_MAX_SES),fid,rids});
  await put("meta","imports",{list});
  return id;
}
async function impUndo(id){
  const it=impList().find(x=>x.id===id);if(!it)return;
  const sids=Object.entries(S.sessions).filter(([,s])=>s&&s.importId===id).map(([k])=>["sessions",k]);
  await runJobs(sids,del);
  if(it.fid&&S.folders[it.fid]){await runJobs(routinesIn(it.fid).map(([k])=>["routines",k]),del);await del("folders",it.fid)}
  await put("meta","imports",{list:impList().filter(x=>x.id!==id)});
  toastOk(`${sids.length} training${sids.length===1?"":"en"}${it.fid?" en de map":""} verwijderd`);render();
}
function impSummary(N){
  const p=[];if(N.ses.length)p.push(`${N.ses.length} krachttraining${N.ses.length===1?"":"en"} met samen ${N.nSets} sets`);if(N.cardio.length)p.push(`${N.cardio.length} duurtraining${N.cardio.length===1?"":"en"}`);if(N.routines.length)p.push(`${N.routines.length} schema${N.routines.length===1?"":"'s"}`);
  return p.join(", ").replace(/, ([^,]*)$/," en $1");
}
EXTRA_SHEETS["imp"]=function(sh){
  const head=t=>`<div class="sh"><h2>${t}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>`;
  if(sh.step==="ai")return head("Inladen met een AI")+`<div class="card stack">
      <p class="hp"><b>1.</b> Kopieer de opdracht hieronder en plak die in een AI-chat, zoals ChatGPT, Gemini of Claude. Zet je eigen gegevens eronder: tekst uit je notities, een Excel-bestand, een PDF of een foto van je schrift.</p>
      <button class="btn primary" data-act="imp-copy">Kopieer de opdracht</button>
      <details class="privdet"><summary>Bekijk de opdracht</summary><pre class="impprompt">${esc(IMP_PROMPT)}</pre></details>
      <p class="hp"><b>2.</b> Kopieer het hele antwoord van de AI en plak het hier:</p>
      <textarea id="imp-txt" rows="6" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder='{"type":"krachtlogboek", ...}'>${esc(sh.txt||"")}</textarea>
      <button class="btn primary" data-act="imp-check">Controleren</button>
      <p class="small muted" style="margin:0">Je gegevens deel je zelf met de AI die je kiest; Athlevon stuurt niets door. Een AI kan fouten maken: je ziet hierna eerst wat er wordt ingeladen.</p></div>
      <button class="linkbtn" data-act="imp-back">← Terug</button>`;
  if(sh.step==="preview"){const N=sh.N;
    return head("Controleer wat er wordt ingeladen")+`<div class="card stack"><p class="hp" style="margin:0"><b>${esc(impSummary(N))}</b>${N.from?`, van ${esc(dateTxt(N.from))} t/m ${esc(dateTxt(N.to))}`:""}.</p>
      ${N.noDate?`<p class="small muted" style="margin:0">${N.noDate} training${N.noDate===1?" zonder datum krijgt":"en zonder datum krijgen"} de datum van vandaag.</p>`:""}
      ${N.dup?`<p class="small muted" style="margin:0">${N.dup} ${N.dup===1?"onderdeel staat":"onderdelen staan"} al in je account en ${N.dup===1?"wordt":"worden"} overgeslagen.</p>`:""}
      ${[...N.ses.slice(0,3).map(s=>`<div class="fitem"><div class="fi-n">${esc(s.date?dateTxt(s.date):"Zonder datum")} · ${esc(s.name)}</div><div class="fi-x">${s.entries.map(e=>`${esc(e.name)} ${e.sets.map(x=>x.k?`${fmt1(x.k)} kg × ${x.r}`:`${x.r} herh.`).join(", ")}`).join(" · ")}</div></div>`),
         ...N.cardio.slice(0,2).map(s=>`<div class="fitem"><div class="fi-n">${esc(s.date?dateTxt(s.date):"Zonder datum")} · ${esc(s.name)}</div><div class="fi-x">${s.km?fmt1(s.km)+" km · ":""}${durTxt(s.min)}</div></div>`),
         ...N.routines.slice(0,2).map(r=>`<div class="fitem"><div class="fi-n">Schema · ${esc(r.name)}</div><div class="fi-x">${r.items.map(i=>esc(i.name)).join(" · ")}</div></div>`)].join("")}
      ${N.ses.length+N.cardio.length+N.routines.length>5?`<p class="small muted" style="margin:0">… en meer.</p>`:""}
      ${N.skip.length?`<details class="privdet"><summary>${N.skip.length} regel${N.skip.length===1?"":"s"} overgeslagen</summary><ul class="hl small">${N.skip.slice(0,30).map(x=>`<li>${esc(x)}</li>`).join("")}${N.skip.length>30?`<li>… en nog ${N.skip.length-30}</li>`:""}</ul></details>`:""}
      <button class="btn primary" data-act="imp-go" ${sh.busy?"disabled":""}>${sh.busy?"Bezig met inladen…":"Toevoegen aan mijn account"}</button>
      <p class="small muted" style="margin:0">Je records worden daarna opnieuw berekend. Klopt er iets niet? Je kunt het inladen tot ${IMP_UNDO_DAYS} dagen ongedaan maken.</p></div>
      <button class="linkbtn" data-act="imp-back">← Terug</button>`}
  const L=impList(),now=Date.now();
  return head("Oude trainingen of schema's inladen")+`<p class="hp small muted">Heb je eerdere resultaten of schema's in je notities, een Excel-bestand of een andere app? Zet ze hier in je account. Ze komen alleen in jouw account.</p>
    <div class="stack"><button class="card start" data-act="imp-ai"><span><span class="name">Met een AI</span><br><span class="muted small">Voor tekst, notities, foto's, PDF's en Excel. Je krijgt een opdracht die je in ChatGPT, Gemini of Claude plakt.</span></span><span class="go">Kies</span></button>
    <label class="card start" for="imp-file2" style="cursor:pointer"><span><span class="name">CSV-bestand</span><br><span class="muted small">Uit Strong, Hevy of je eigen tabel (gewicht in kg). In Excel, Numbers of Google Spreadsheets: Bestand → Exporteren/Downloaden als CSV.</span></span><span class="go">Kies</span></label>
    <input type="file" id="imp-file2" accept=".csv,.tsv,.txt,.json,text/csv,text/plain,application/json" hidden></div>
    <details class="privdet" style="margin-top:10px"><summary>Hoe moet mijn eigen tabel eruitzien?</summary><p class="hp small" style="margin:8px 0 0">Eén regel per set, met de kopjes <b>datum</b>, <b>training</b> (optioneel), <b>oefening</b>, <b>kg</b> en <b>herhalingen</b>. Een kolom <b>sets</b> mag ook: dan telt een regel als dat aantal gelijke sets. Voor duurtrainingen: <b>datum</b>, <b>sport</b>, <b>km</b> en <b>duur</b> (minuten of 0:45:30).</p><pre class="impprompt">datum;training;oefening;kg;herhalingen;sets;km;duur
04-03-2025;Push;Bench Press;60;10;3;;
04-03-2025;Push;Dips;0;12;3;;
06-03-2025;;Hardlopen;;;;8,2;46</pre></details>
    ${L.length?`<h2>Eerder ingeladen</h2><div class="stack">${L.map(x=>{const can=now-x.at<IMP_UNDO_DAYS*864e5;return `<div class="card libcard"><div><strong>${esc(new Date(x.at).toLocaleDateString("nl-NL",{day:"numeric",month:"long"}))}</strong><span class="muted small">${[x.n?x.n+" krachttraining"+(x.n===1?"":"en"):"",x.c?x.c+" duur":"",x.r?x.r+" schema"+(x.r===1?"":"'s"):""].filter(Boolean).join(" · ")}</span></div>${can?(UI.impUndo===x.id?`<button class="btn danger" data-act="imp-undo-yes" data-id="${x.id}">Zeker weten?</button>`:`<button class="btn" data-act="imp-undo" data-id="${x.id}">Ongedaan maken</button>`):`<span class="small muted">vast</span>`}</div>`}).join("")}</div>`:""}`;
};
async function impFromText(txt,src){
  if(txt.length>IMP_MAX_BYTES){toast("Dit is te veel in één keer. Splits het in delen van maximaal ± 3 MB.");return}
  try{const t=txt.trim(),json=/^[\[{]/.test(t)||/```|"type"\s*:|"sessions"\s*:/.test(t),csv=!json&&/[;,\t]/.test(t.split(/\r?\n/,1)[0])&&/\n/.test(t);
    if(!json&&!csv)throw new Error(src==="ai"?"er staat geen gegevensblok in. Plak eerst de opdracht met je gegevens in een AI-chat, en plak dan het antwoord van de AI hier":"dit lijkt gewone tekst. Kies dan \"Met een AI\"");
    const obj=json?impExtract(t):impCsv(t);UI.sheet={type:"imp",step:"preview",N:impPrepare(obj,src),txt:src==="ai"?txt:""};renderSheet()}
  catch(e){toast("Inladen lukt niet: "+(e.message||"onbekende fout")+".")}
}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;const act=b.dataset.act;if(!act.startsWith("imp-"))return;const sh=UI.sheet;
  switch(act){
    case "imp-open":UI.impUndo=null;UI.sheet={type:"imp",step:"start"};renderSheet();break;
    case "imp-ai":UI.sheet={type:"imp",step:"ai",txt:""};renderSheet();break;
    case "imp-back":UI.sheet={type:"imp",step:sh&&sh.step==="preview"&&sh.N&&sh.N.src==="ai"?"ai":"start",txt:sh&&sh.txt||""};renderSheet();break;
    case "imp-copy":try{await navigator.clipboard.writeText(IMP_PROMPT);toast("Opdracht gekopieerd. Plak hem in je AI-chat en zet je gegevens eronder.")}catch(e){toast("Kopiëren lukte niet; open \"Bekijk de opdracht\" en kopieer de tekst zelf.")}break;
    case "imp-check":{const v=document.getElementById("imp-txt")?.value||"";if(!v.trim()){toast("Plak eerst het antwoord van de AI.");return}sh.txt=v;await impFromText(v,"ai");break}
    case "imp-go":{if(!sh||!sh.N||sh.busy)return;sh.busy=true;renderSheet();
      try{const N=sh.N;await impRun(N);UI.sheet=null;
        if(N.ses.length||N.cardio.length){UI.tab="records";lsSet(LS_TAB,"records")}else{UI.tab="schemas";lsSet(LS_TAB,"schemas")}
        toastOk(`${impSummary(N)} ingeladen`);render();window.scrollTo(0,0)}
      catch(e){sh.busy=false;renderSheet();toast("Er ging iets mis bij het inladen. Wat al is opgeslagen, kun je ongedaan maken.")}break}
    case "imp-undo":UI.impUndo=b.dataset.id;renderSheet();break;
    case "imp-undo-yes":UI.impUndo=null;UI.sheet=null;render();await impUndo(b.dataset.id);break;
  }
});
document.addEventListener("change",ev=>{
  if(ev.target.id!=="imp-file2"||!ev.target.files||!ev.target.files[0])return;const f=ev.target.files[0];ev.target.value="";
  if(f.size>IMP_MAX_BYTES){toast("Dit bestand is te groot (maximaal ± 3 MB). Splits het in delen.");return}
  const rd=new FileReader();rd.onload=()=>impFromText(String(rd.result||""),"file");rd.onerror=()=>toast("Dit bestand kan niet gelezen worden.");rd.readAsText(f);
});

