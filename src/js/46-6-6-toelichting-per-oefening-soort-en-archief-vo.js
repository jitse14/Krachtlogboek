/* ---------- 6.6: toelichting per oefening, soort en archief voor mappen/schema's, startvraag ---------- */
/* toelichting bij een oefening tijdens de training (ingeklapt tot je erop tikt) */
function exNoteUI(e,i){const v=e.note||"";
  if(!v&&!e._noteOpen)return `<button class="linkbtn exnote-open" data-act="en-open" data-i="${i}">+ Toelichting bij deze oefening</button>`;
  return `<label class="f exnote">Toelichting <i>optioneel</i><textarea id="en-${i}" rows="2" maxlength="500" placeholder="Bijv. houding, dropset gedaan, eerste set is startgewicht, of: reps zijn seconden">${esc(v)}</textarea></label>`}
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="en-open"]');if(!b||!draft)return;const e=draft.entries[+b.dataset.i];if(!e)return;e._noteOpen=true;saveDraft();render();setTimeout(()=>document.getElementById("en-"+b.dataset.i)?.focus(),30)});
document.addEventListener("input",ev=>{const m=(ev.target.id||"").match(/^en-(\d+)$/);if(!m||!draft)return;const e=draft.entries[+m[1]];if(e){e.note=ev.target.value;saveDraft()}});
const exNoteTxt=e=>e&&e.note?`<div class="small exnote-v">💬 ${esc(e.note)}</div>`:"";

/* soort van een map of schema zelf kiezen (anders bepaalt de app het) */
const CAT_OPT=[["","Automatisch"],["kracht","Fitness"],["hiit","HIIT"],["cali","Calisthenics"]];
function catChips(act,cur){return `<div class="f">Soort <i>bepaalt de kleur in je planning</i><div class="chips">${CAT_OPT.map(([v,l])=>`<button class="chipb" data-act="${act}" data-v="${v}" aria-pressed="${(cur||"")===v}">${l}</button>`).join("")}</div></div>`}
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="cat-fd"],[data-act="cat-re"]');if(!b)return;const o=b.dataset.act==="cat-fd"?UI.folderEdit:UI.edit;if(!o)return;
  if(b.dataset.act==="cat-fd"){const n=document.getElementById("fd-name");if(n)o.name=n.value}else{const n=document.getElementById("re-name");if(n)o.name=n.value}
  o.cat=b.dataset.v;b.parentElement.querySelectorAll("[data-act]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)))});
const _routineCat66=routineCat;routineCat=function(rid,rname,hiit){const r=S.routines[rid],f=r&&S.folders&&S.folders[r.folderId];if(r&&r.cat)return r.cat;if(f&&f.cat)return f.cat;return _routineCat66(rid,rname,hiit)};
const _folderCat66=folderCat;folderCat=function(fid){const f=S.folders&&S.folders[fid];if(f&&f.cat&&!routinesInAll(fid).some(([,r])=>!r.archived&&r.cat&&r.cat!==f.cat))return f.cat;return _folderCat66(fid)};

/* archief: uit het zicht, maar alles blijft bewaard */
const _folderListAll=folderList,_routinesInAll=routinesIn;
function routinesInAll(fid){return _routinesInAll(fid)}
folderList=function(){return _folderListAll().filter(f=>!f.archived)};
routinesIn=function(fid){return _routinesInAll(fid).filter(([,r])=>!r.archived)};
function archiveView(){const fs=_folderListAll().filter(f=>f.archived),rs=Object.entries(S.routines).filter(([,r])=>r.archived&&!(r.folderId&&S.folders[r.folderId]&&S.folders[r.folderId].archived));
  const n=fs.length+rs.length;if(!n)return "";
  return `<details class="card archbox" style="margin-top:12px" ${UI.archOpen?"open":""}><summary><b>Archief</b> <span class="small muted">${n} ${n===1?"onderdeel":"onderdelen"} · uit het zicht, maar bewaard</span></summary><div class="stack" style="margin-top:8px">
    ${fs.map(f=>`<div class="fline archrow"><span class="fn">📁 ${esc(f.name)} <span class="small muted">· ${_routinesInAll(f.id).length} schema's</span></span><button class="linkbtn" data-act="arch-back" data-k="f" data-id="${f.id}">Terugzetten</button></div>`).join("")}
    ${rs.map(([id,r])=>`<div class="fline archrow"><span class="fn">${esc(r.name)}${r.folderId&&S.folders[r.folderId]?` <span class="small muted">· ${esc(S.folders[r.folderId].name)}</span>`:""}</span><button class="linkbtn" data-act="arch-back" data-k="r" data-id="${id}">Terugzetten</button></div>`).join("")}
    <p class="small muted" style="margin:0">Gearchiveerde mappen en schema's zie je niet bij Trainen, Planning of Schema's. Je gelogde trainingen en records blijven altijd staan.</p></div></details>`}
document.addEventListener("toggle",ev=>{if(ev.target.classList&&ev.target.classList.contains("archbox"))UI.archOpen=ev.target.open},true);
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act="arch-fd"],[data-act="arch-re"],[data-act="arch-back"]');if(!b)return;const id=b.dataset.id,y=window.scrollY;
  if(b.dataset.act==="arch-fd"){const f=S.folders[id];if(!f)return;await put("folders",id,{...f,archived:true});toastOk(`Map "${f.name}" gearchiveerd`)}
  else if(b.dataset.act==="arch-re"){const r=S.routines[id];if(!r)return;await put("routines",id,{...r,archived:true});toastOk(`"${r.name}" gearchiveerd`)}
  else{const col=b.dataset.k==="f"?"folders":"routines",o=S[col][id];if(!o)return;const {archived,...rest}=o;await put(col,id,rest);toastOk(`"${o.name}" staat weer bij je schema's`)}
  render();window.scrollTo(0,y)});

/* nieuwe gebruiker: waarvoor ga je de app gebruiken? */
const SU_USE=[["train","Trainen en schema's",true],["plan","Planning en sportschema op maat",true],["food","Voeding",true],["records","Voortgang",true],["kennis","Kennis per sport",true]];
function setupSheet(sh){const a=sh.a;
  return `<div class="sh"><h2>Waarvoor ga je Athlevon gebruiken?</h2><button class="ib" data-act="su-skip" aria-label="Overslaan">✕</button></div><div class="card stack">
    <p class="hp small" style="margin:0">Kies wat je wilt zien. Zo blijft de app overzichtelijk. Je kunt dit later altijd aanpassen bij <b>Profiel → Instellingen</b>.</p>
    <div class="f">Onderdelen<div class="chips">${SU_USE.map(([k,l])=>k==="train"?`<button class="chipb" aria-pressed="true" disabled>${l}</button>`:`<button class="chipb" data-act="su-tab" data-v="${k}" aria-pressed="${!a.hide.includes(k)}">${l}</button>`).join("")}</div></div>
    <div class="f">Welke sporten doe je?<div class="chips">${SPF.map(([k,l])=>`<button class="chipb" data-act="su-sp" data-v="${k}" aria-pressed="${!a.sports.includes(k)}">${l}</button>`).join("")}</div></div>
    <button class="btn primary" data-act="su-save">Klaar</button><button class="linkbtn" data-act="su-skip">Alles laten staan</button></div>`}
EXTRA_SHEETS["setup"]=setupSheet;
function suDue(){return pid&&S.ready&&loadedAt&&!UI.sheet&&!draft&&!UI.cardio&&!(S.meta&&S.meta.tabs)&&!Object.keys(S.sessions||{}).length&&!(S.me&&S.me.isAdmin)}
let suShown=false;
const _render66=render;render=function(){const r=_render66.apply(this,arguments);if(!suShown&&suDue()){setTimeout(()=>{if(!suShown&&suDue()){suShown=true;UI.sheet={type:"setup",a:{hide:[],sports:[]}};renderSheet()}},400)}return r};
/* na het sluiten van de rondleiding opnieuw kijken */
document.addEventListener("click",ev=>{if(ev.target.closest('[data-act="intro-done"],[data-act="close-sheet"]'))setTimeout(()=>{if(!suShown&&suDue())render()},300)});
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act^="su-"]');if(!b)return;const sh=UI.sheet;if(!sh||sh.type!=="setup")return;const a=sh.a,v=b.dataset.v;
  if(b.dataset.act==="su-tab"){a.hide=a.hide.includes(v)?a.hide.filter(x=>x!==v):[...a.hide,v];renderSheet();return}
  if(b.dataset.act==="su-sp"){if(!a.sports.includes(v)&&SPF.length-a.sports.length<=1){toast("Kies minstens één sport.");return}a.sports=a.sports.includes(v)?a.sports.filter(x=>x!==v):[...a.sports,v];renderSheet();return}
  if(b.dataset.act==="su-skip"){UI.sheet=null;renderSheet();await put("meta","tabs",{...tabsMeta(),setup:true});render();return}
  if(b.dataset.act==="su-save"){UI.sheet=null;renderSheet();await put("meta","tabs",{...tabsMeta(),hide:a.hide,sports:a.sports,setup:true});render();toastOk("Ingesteld. Aanpassen kan bij Profiel → Instellingen.")}});

