/* ---------- schema's ---------- */
function viewSchemas(){
  if(UI.edit)return viewEditor();
  if(UI.cg)return viewCoachGen();
  const folders=folderList(),loose=routinesIn(null);
  let h=`<button class="card start" style="margin-top:16px" data-act="sc-open" data-v="f"><span><span class="name">Sportschema op maat</span><br><span class="muted small">Al je sporten in één verantwoord weekplan, met een map met schema's die elke week een stapje zwaarder worden</span></span><span class="go">Start</span></button><h2>Jouw schema's</h2>`;
  if(UI.folderEdit)h+=`<div class="card stack" style="margin-bottom:10px"><label class="f">${UI.folderEdit.id?"Map hernoemen":"Nieuwe map"}<input type="text" id="fd-name" value="${esc(UI.folderEdit.name)}" placeholder="Bijv. Fitness 4 dagen" autocomplete="off"></label>${catChips("cat-fd",UI.folderEdit.cat)}<div class="btnrow"><button class="btn primary" data-act="fd-save">Opslaan</button><button class="btn" data-act="fd-cancel">Annuleren</button></div></div>`;
  if(!folders.length&&!loose.length)h+=`<div class="card empty"><strong>Nog geen schema's</strong><p class="muted">Maak een map, bijvoorbeeld "Fitness 4 dagen", en zet daar je schema's in. Of voeg hieronder een voorbeeldmap toe.</p></div>`;
  h+=`<div class="stack">`+folders.map(folderCard).join("")+(loose.length?folderCard({id:null,name:"Zonder map"}):"")+`</div>`;
  h+=`<div class="btnrow" style="margin-top:12px"><button class="btn primary" data-act="new-routine">+ Nieuw schema</button><button class="btn" data-act="fd-new">+ Nieuwe map</button></div>`;
  h+=`<h2>Oude trainingen of schema's</h2><button class="card start" data-act="imp-open"><span><span class="name">Inladen in je account</span><br><span class="muted small">Uit je notities, Excel, een andere app of een foto van je schrift</span></span><span class="go">Start</span></button>`;
  h+=`<h2>Gedeeld schema toevoegen</h2><div class="card stack"><p class="hp">Heeft iemand een schema of map met je gedeeld? Vul de deelcode in.</p><div class="codeinput"><input type="text" id="sh-code" placeholder="Bijv. 7KQ2MX" autocapitalize="characters" autocomplete="off" maxlength="8"><button class="btn primary" data-act="sh-lookup">Bekijken</button></div></div>`;
  h+=archiveView();if(LIB.some(spLibOk))h+=`<h2>Voorbeeldmappen</h2><div class="stack">`+LIB.filter(spLibOk).map(l=>{const has=folders.some(f=>f.lib===l.id);
    return `<div class="card libcard"><div><strong>${esc(l.name)}</strong><span class="muted small">${l.routines.length} schema's · ${esc(l.desc)}</span></div><button class="btn ${has?"":"primary"}" data-act="lib-add" data-id="${l.id}" ${has?"disabled":""}>${has?"Toegevoegd ✓":"Toevoegen"}</button></div>`}).join("")+`</div>`;
  return h;
}
function folderCard(f){
  const k="f:"+(f.id||"none"),open=isOpen(k),rs=routinesIn(f.id);
  let h=`<section class="card folder${f.id?` fc-${folderCat(f.id)}`:""}"><button class="fhead" data-act="fd-toggle" data-id="${k}" aria-expanded="${open}"><span class="ficon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span><span class="fname">${esc(f.name)}</span><span class="fcount">${rs.length}</span><span class="chev" aria-hidden="true">${open?"▾":"▸"}</span></button>`;
  if(!open)return h+`</section>`;
  h+=`<div class="fbody">`;
  h+=rs.length?rs.map(([id,r])=>`<div class="fitem"><div class="fi-n">${esc(r.name)}</div><div class="fi-x">${(r.items||[]).map(i=>esc(exName(i.exId))).join(" · ")||"Nog geen oefeningen"}</div><div class="btnrow"><button class="btn" data-act="edit-routine" data-id="${id}">Bewerken</button><button class="btn" data-act="share-routine" data-id="${id}">Delen</button><button class="btn primary" data-act="start-from-schema" data-id="${id}">Start</button></div><button class="linkbtn small" style="justify-self:start" data-act="arch-re" data-id="${id}">Archiveren</button></div>`).join(""):`<p class="muted small" style="margin:8px 0">Nog geen schema's in deze map.</p>`;
  if(f.id){
    if(UI.confirm==="fd-del:"+f.id)h+=`<div class="confirm" style="margin-top:10px"><span>Map "${esc(f.name)}" verwijderen? Je gelogde trainingen en records blijven altijd bewaard.</span><div class="stack"><button class="btn danger" data-act="fd-del-all" data-id="${f.id}">Map én ${rs.length} schema's verwijderen</button><button class="btn" data-act="fd-del-keep" data-id="${f.id}">Alleen de map, schema's naar "Zonder map"</button><button class="btn ghost" data-act="confirm-no">Annuleren</button></div></div>`;
    else h+=`<div class="factions"><button class="linkbtn" data-act="new-routine" data-id="${f.id}">+ Schema in deze map</button><button class="linkbtn" data-act="share-folder" data-id="${f.id}">Map delen</button><button class="linkbtn" data-act="fd-rename" data-id="${f.id}">Naam en soort</button><button class="linkbtn" data-act="arch-fd" data-id="${f.id}">Archiveren</button><button class="linkbtn danger" data-act="fd-del" data-id="${f.id}">Verwijderen</button></div>`;
  }
  return h+`</div></section>`;
}
async function folderSave(){
  const fe=UI.folderEdit,name=(document.getElementById("fd-name")?.value||fe.name||"").trim();
  if(!name){toast("Geef de map een naam.");document.getElementById("fd-name")?.focus();return}
  if(fe.id)await put("folders",fe.id,{...S.folders[fe.id],name,cat:fe.cat||null});
  else{const id="fd-"+uid();await put("folders",id,{name,order:folderList().length,lib:null,cat:fe.cat||null});UI.open["f:"+id]=true;lsSet(LS_OPEN,UI.open)}
  UI.folderEdit=null;toastOk(fe.id?"Map hernoemd":"Map aangemaakt");render();
}
async function folderDelete(fid,withRoutines){
  const rs=routinesIn(fid);
  if(withRoutines)await runJobs(rs.map(([id])=>["routines",id]),del);
  else await runJobs(rs.map(([id,r])=>["routines",id,{...clone(r),folderId:null}]),put);
  await del("folders",fid);UI.confirm=null;toastOk("Map verwijderd");render();
}
function trainStartList(){
  const groups=folderList().map(f=>({k:"t:"+f.id,name:f.name,rs:routinesIn(f.id)})).concat([{k:"t:none",name:"Zonder map",rs:routinesIn(null)}]).filter(g=>g.rs.length);
  if(!groups.length)return `<div class="card empty"><strong>Nog geen schema's</strong><p class="muted">Maak eerst een schema, of log meteen een losse training.</p><div class="btnrow"><button class="btn primary" data-act="new-routine">Schema maken</button><button class="btn" data-act="start" data-id="">Losse training</button></div></div>`;
  return `<div class="stack">`+groups.map(g=>{const open=groups.length===1||isOpen(g.k);
    return `<section class="tgroup"><button class="fhead plain" data-act="fd-toggle" data-id="${g.k}" aria-expanded="${open}"><span class="fname">${esc(g.name)}</span><span class="fcount">${g.rs.length}</span><span class="chev" aria-hidden="true">${open?"▾":"▸"}</span></button>${open?`<div class="stack">${g.rs.map(([id,r])=>{const last=sortedSessions().find(s=>s.routineId===id);return `<button class="card start" data-act="start" data-id="${id}"><span><span class="name">${esc(r.name)}</span><br><span class="muted small">${(r.items||[]).length} oefeningen${last?" · laatst "+dateTxt(last.date):""}</span></span><span class="go">Start</span></button>`}).join("")}</div>`:""}</section>`}).join("")
    +`<button class="btn block" data-act="start" data-id="">Losse training zonder schema</button></div>`;
}

