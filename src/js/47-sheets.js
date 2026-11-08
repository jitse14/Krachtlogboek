/* ---------- sheets ---------- */
function renderSheet(){
  const el=document.getElementById("sheet");
  if(!UI.sheet||!pid){el.hidden=true;el.innerHTML="";return}
  el.hidden=false;let inner="";const sh=UI.sheet;
  if(sh.type==="pick"){
    const q=UI.pickQ.trim(),ql=norm(q);
    const takenKeys=new Set((sh.mode==="draft"?(draft?draft.entries.map(e=>e.exId):[]):(UI.edit?UI.edit.items.map(i=>i.exId):[])).map(exKey));
    const seen=new Set();
    const list=Object.entries(S.exercises).sort((a,b)=>a[1].name.localeCompare(b[1].name)).filter(([,x])=>{const k=norm(x.name);if(seen.has(k))return false;seen.add(k);return !ql||k.includes(ql)});
    const exact=Object.values(S.exercises).some(x=>norm(x.name)===ql);
    inner=`<div class="sh"><h2>Oefening kiezen</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
      <input type="search" id="pk-q" placeholder="Zoek of typ een nieuwe oefening" value="${esc(UI.pickQ)}" autocomplete="off">`;
    if(q&&!exact)inner+=`<div class="card stack" style="margin-top:10px"><div><span class="muted small">Nieuwe oefening</span><br><strong>${esc(q)}</strong></div><label class="f">Spiergroep<select id="pk-g">${GROUPS.map(g=>`<option ${g===UI.pickG?"selected":""}>${g}</option>`).join("")}</select></label><button class="btn primary" data-act="create-ex">Toevoegen</button></div>`;
    inner+=`<div class="card" style="margin-top:10px;padding:4px 12px">`+(list.length?list.map(([id,x])=>{const t=takenKeys.has(norm(x.name));return `<button class="pickitem" data-act="pick-ex" data-id="${id}" ${t?"disabled":""}><span>${esc(x.name)}${t?' <span class="muted small">· al toegevoegd</span>':""}</span><span class="chip">${esc(x.group)}</span></button>`}).join(""):`<p class="muted small" style="padding:10px 0;margin:0">${Object.keys(S.exercises).length?"Geen oefening gevonden. Typ de naam om hem aan te maken.":"Je oefeningenlijst is nog leeg. Typ hierboven de naam van je eerste oefening."}</p>`)+`</div>`;
  }else if(sh.type==="ex"){
    const x=S.exercises[sh.id];if(!x){UI.sheet=null;el.hidden=true;return}
    const hist=historyFor(sh.id),b=bestFor(sh.id);
    inner=`<div class="sh"><h2>${esc(x.name)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
      <div class="card stack"><label class="f">Naam<input type="text" id="ex-name" value="${esc(sh.name)}"></label><label class="f">Spiergroep${groupSelect("ex-g",sh.group)}</label><div class="codeinput"><input type="text" id="ex-newg" placeholder="Eigen spiergroep, bijv. Adductoren" autocomplete="off"><button class="btn" data-act="grp-add">Toevoegen</button></div><button class="btn primary" data-act="save-ex">Wijzigingen opslaan</button></div>
      <h2>Geschiedenis</h2>${hist.length?`<div class="hist">`+hist.map(hh=>`<div class="h"><div class="d">${dateTxt(hh.date)} · ${esc(hh.name||"Training")}</div><div class="s">${hh.sets.map(shortSet).join(" · ")}</div></div>`).join("")+`</div>`:`<p class="muted">Nog niet gelogd.</p>`}
      ${b?`<p class="small muted">Record: <strong style="color:var(--pr)">${setTxt(b.set)}</strong> op ${dateTxt(b.date)}</p>`:""}
      <div style="margin-top:14px">${UI.confirm==="del-ex"?`<div class="confirm"><span>Oefening verwijderen uit je lijst? Gelogde trainingen blijven bewaard, maar de oefening verdwijnt uit records en schema's.</span><div class="btnrow"><button class="btn danger" data-act="del-ex-yes">Verwijderen</button><button class="btn" data-act="confirm-no">Behouden</button></div></div>`:`<button class="btn ghost danger" data-act="del-ex">Oefening verwijderen</button>`}</div>`;
  }else if(sh.type==="session"){
    const s=S.sessions[sh.id];if(!s){UI.sheet=null;el.hidden=true;return}
    if(s.kind==="cardio"){const v=speed(s.durMin,s.km);
      inner=`<div class="sh"><h2>${esc(s.sport)} · ${dateTxt(s.date)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>${s.planTitle?`<p class="small muted" style="margin:0 0 8px">Geplande training: <b>${esc(s.planTitle)}</b></p>`:""}<div class="card"><div class="calc">
        <div><span>Duur</span><b>${durTxt(s.durMin)}</b></div>${s.km?`<div><span>Afstand</span><b>${fmt1(s.km)} km</b></div>`:""}${v?`<div><span>Gem. snelheid</span><b>${fmt1(v)} km/u</b></div>`:""}${v&&s.sport==="Hardlopen"?`<div><span>Tempo</span><b>${paceTxt(s.durMin,s.km)}</b></div>`:""}${s.avgHr?`<div><span>Gem. hartslag</span><b>${s.avgHr} bpm</b></div>`:""}${s.maxHr?`<div><span>Max. hartslag</span><b>${s.maxHr} bpm</b></div>`:""}${s.purpose?`<div><span>Soort training</span><b>${esc(s.purpose)}</b></div>`:""}</div>${s.note?`<p class="hp" style="margin-top:10px">${esc(s.note)}</p>`:""}</div>`;
    }else inner=`<div class="sh"><h2>${esc(s.routineName||"Training")} · ${dateTxt(s.date)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="hist">`+
      (s.entries||[]).map(e=>`<div class="h"><div class="d">${esc(exName(e.exId,e.name))}</div><div class="s">${e.sets.map(shortSet).join(" · ")}</div>${exNoteTxt(e)}</div>`).join("")+`</div>`+(s.feel?`<p class="hp" style="margin:10px 0 0"><b>Hoe ging het:</b> ${esc(hvFeel(s.feel))}</p>`:"")+(s.note?`<div class="card" style="margin-top:10px"><span class="ml">Opmerking</span><p class="hp" style="margin:4px 0 0;white-space:pre-wrap">${esc(s.note)}</p></div>`:"");
    inner+=`<div style="margin-top:14px">${UI.confirm==="del-session"?`<div class="confirm"><span>Deze training verwijderen? Records worden opnieuw berekend.</span><div class="btnrow"><button class="btn danger" data-act="del-session-yes">Verwijderen</button><button class="btn" data-act="confirm-no">Behouden</button></div></div>`:`<button class="btn ghost danger" data-act="del-session">Training verwijderen</button>`}</div>`;
  }
  if(EXTRA_SHEETS[sh.type]){inner=EXTRA_SHEETS[sh.type](sh);if(inner==null){UI.sheet=null;el.hidden=true;el.innerHTML="";return}}
  el.innerHTML=`<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true">${inner}</div></div>`;
}

let toastT=null;
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true},3200)}

