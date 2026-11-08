/* ---------- resultaten importeren (beheerder maakt code) ---------- */
function adminToolsV5(){
  return `<div class="card stack" style="margin-top:10px"><strong>Oude resultaten omzetten naar code</strong><p class="hp small">Plak hier het bestand dat Claude voor iemand heeft gemaakt. Je krijgt een code die je doorstuurt; die persoon vult hem in bij Schema's → Gedeeld schema toevoegen.</p>
    <textarea id="res-json" rows="4" placeholder='{"type":"results", ...}'></textarea><button class="btn" data-act="res-make">Code maken</button></div>`;
}
function checkResults(d){
  if(!d||d.type!=="results"||!Array.isArray(d.sessions)||!d.sessions.length)throw new Error("geen resultatenbestand");
  let n=0;for(const s of d.sessions){if(!Array.isArray(s.entries))throw new Error("training zonder oefeningen");for(const e of s.entries){if(!e.name||!Array.isArray(e.sets))throw new Error("oefening zonder naam of sets");n+=e.sets.length}}
  return n;
}
async function makeResultsCode(){
  let d;try{d=JSON.parse(document.getElementById("res-json")?.value||"");checkResults(d)}catch(e){toast("Dit is geen geldig resultatenbestand: "+e.message);return}
  d.by=S.me.name;
  try{const c=await rpc("kl_share_create",{p_code:code,p_profile:pid,p_pin:myPin(),p_data:d});UI.sheet={type:"share",code:c,name:d.name||"Resultaten",kind:"results"};render()}
  catch(e){if(e.code==="too_big")toast("Bestand is te groot. Splits het in delen.");else handleErr(e)}
}
async function importResults(d){
  const exMap=new Map(Object.entries(S.exercises).map(([id,x])=>[norm(x.name),id])),ex=[],ses=[];
  const resolve=(name,group)=>{const k=norm(name);if(exMap.has(k))return exMap.get(k);const id=uid();exMap.set(k,id);ex.push(["exercises",id,{name:String(name).slice(0,80),group:GROUPS.includes(group)?group:"Overig"}]);return id};
  d.sessions.forEach((s,i)=>{
    const date=/^\d{4}-\d{2}-\d{2}$/.test(s.date||"")?s.date:today();
    const entries=s.entries.map(e=>({exId:resolve(e.name,e.group),name:String(e.name),group:GROUPS.includes(e.group)?e.group:"Overig",sets:e.sets.map(x=>({k:+x.k||0,r:Math.round(+x.r||0)})).filter(x=>x.r>0)})).filter(e=>e.sets.length);
    if(entries.length)ses.push(["sessions",uid()+"i"+i,{date,ts:Date.parse(date+"T12:00:00")||Date.now(),routineId:null,routineName:String(s.name||"Geïmporteerde training").slice(0,80),entries,imported:true}]);
  });
  await runJobs(ex,put);await runJobs(ses,put);
  return ses.length;
}
function importSheetV5(sh){
  const d=sh.data||{};
  if(d.type==="results"){let n=0;try{n=checkResults(d)}catch(e){}
    return `<div class="sh"><h2>Resultaten importeren</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><div><strong style="font-family:var(--display);font-size:22px">${esc(d.name||"Resultaten")}</strong>${d.by?`<div class="muted small">Klaargezet door ${esc(d.by)}</div>`:""}</div>
      <p class="hp">${d.sessions.length} training${d.sessions.length===1?"":"en"} met samen ${n} sets. Ze komen in je eigen account te staan, met de datum erbij als die bekend is. Je records worden daarna opnieuw berekend.</p>
      <button class="btn primary" data-act="sh-import">Toevoegen aan mijn account</button></div>`}
  const rs=d.routines||[];
  return `<div class="sh"><h2>${d.type==="folder"?"Gedeelde map":"Gedeeld schema"}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
    <div class="card stack"><div><strong style="font-family:var(--display);font-size:22px">${esc(d.name||"")}</strong>${d.by?`<div class="muted small">Gedeeld door ${esc(d.by)}</div>`:""}</div>
    ${rs.map(r=>`<div class="fitem"><div class="fi-n">${esc(r.name)}</div><div class="fi-x">${(r.items||[]).map(i=>esc(i.name)).join(" · ")}</div></div>`).join("")}
    <p class="small muted" style="margin:0">${d.type==="folder"?"Wordt toegevoegd als nieuwe map.":"Komt bij je schema's onder \"Zonder map\". Je kunt het daarna in een map zetten."} Oefeningen die je al hebt, delen hun records met je bestaande geschiedenis.</p>
    <button class="btn primary" data-act="sh-import">Toevoegen aan mijn schema's</button></div>`;
}
async function importShareV5(){
  const d=UI.sheet&&UI.sheet.data;if(!d)return;UI.sheet=null;render();toast("Toevoegen…");
  if(d.type==="results"){const n=await importResults(d);UI.tab="records";lsSet(LS_TAB,"records");toastOk(`${n} training${n===1?"":"en"} toegevoegd aan je account`);render();window.scrollTo(0,0);return}
  if(d.type==="folder"){let name=String(d.name||"Gedeelde map");if(folderList().some(f=>norm(f.name)===norm(name)))name+=` (van ${d.by||"iemand"})`;await addFolderSet({name,routines:d.routines},"fd-"+uid())}
  else await addFolderSet({routines:d.routines},null);
  UI.tab="schemas";lsSet(LS_TAB,"schemas");if(d.type!=="folder"){UI.open["f:none"]=true;lsSet(LS_OPEN,UI.open)}
  toastOk(`"${d.name}" toegevoegd`);render();window.scrollTo(0,0);
}
EXTRA_SHEETS["food-add"]=foodAddSheet;EXTRA_SHEETS["prices"]=pricesSheet;

