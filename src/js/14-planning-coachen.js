/* ---------- planning & coachen ---------- */
function queueBanner(){
  const n=queue().length;if(!n)return "";
  return `<div class="banner qbanner"><span>${n} wijziging${n>1?"en":""} nog niet verstuurd. Dat gebeurt automatisch zodra je internet hebt.</span><button class="linkbtn" data-act="flush">Nu versturen</button></div>`;
}
function dayLabel(iso){
  const t=today();if(iso===t)return "Vandaag";if(iso===addDays(t,1))return "Morgen";if(iso===addDays(t,-1))return "Gisteren";
  const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("nl-NL",{weekday:"short",day:"numeric",month:"short"});
}
function planTargets(p){return [p.purpose,p.durMin?`± ${String(p.durMin).replace(".",",")} min`:null,p.km?`${fmt1(p.km)} km`:null].filter(Boolean).map(esc).join(" · ")}
function planSession(sessions,planId){return Object.entries(sessions||{}).map(([id,s])=>({id,...s})).find(s=>s.planId===planId)||null}
function viewCoach(){
  const c=UI.coach,people=S.people;
  let h=`<div class="wohead"><div class="title">Coachen</div><button class="linkbtn" data-act="coach-close">Terug</button></div>`;
  if(!people)return h+`<div class="card empty" style="margin-top:12px"><p class="muted">Sporters laden…</p></div>`;
  h+=`<div class="card stack" style="margin-top:12px"><label class="f">Sporter<select id="co-who"><option value="">Kies een sporter</option>${people.map(p=>`<option value="${p.id}" ${c.who===p.id?"selected":""}>${esc(p.name)}${p.id===pid?" (jij)":""}</option>`).join("")}</select></label></div>`;
  if(!c.who)return h+`<p class="muted small">Kies voor wie je trainingen wilt inplannen. Diegene ziet ze bovenaan in Trainen, en jij ziet hier terug wat er gelogd is.</p>`;
  if(!c.data)return h+`<p class="muted">Planning laden…</p>`;
  const name=personName(c.who);
  if(c.form){
    const f=c.form;
    h+=`<h2>${f.id?"Training aanpassen":"Training inplannen"} · ${esc(name)}</h2><div class="card stack">
      <label class="f">Datum<input type="date" id="co-date" value="${esc(f.date)}"></label>
      <div class="f">Sport${spCardioSeg("co-sport",f.sport)}</div>
      <label class="f">Titel<input type="text" id="co-title" value="${esc(f.title)}" placeholder="Bijv. Interval 6×400 m"></label>
      <div class="f">Soort training<div class="chips">${PURPOSES.map(p=>`<button class="chipb" data-act="co-purpose" data-v="${p}" aria-pressed="${f.purpose===p}">${p}</button>`).join("")}</div></div>
      <div class="grid2"><label class="f">Duur <i>optioneel</i><input type="text" inputmode="numeric" id="co-dur" value="${esc(f.durMin)}" placeholder="min"></label><label class="f">Afstand <i>optioneel</i><input type="text" inputmode="decimal" id="co-km" value="${esc(f.km)}" placeholder="km"></label></div>
      <label class="f">Uitleg<textarea id="co-desc" rows="5" placeholder="Bijv. 10 min inlopen · 6× 400 m op 5 km-tempo, 90 sec dribbelen · 10 min uitlopen. Hartslag zone 4.">${esc(f.desc)}</textarea></label>
      ${f.id?"":`<label class="f">Herhalen<select id="co-rep">${[["1","Eenmalig"],["2","2 weken, elke week"],["3","3 weken, elke week"],["4","4 weken, elke week"],["6","6 weken, elke week"],["8","8 weken, elke week"]].map(([v,l])=>`<option value="${v}" ${f.repeat===v?"selected":""}>${l}</option>`).join("")}</select></label>`}
      <div class="btnrow"><button class="btn primary" data-act="co-save">${f.id?"Opslaan":"Inplannen"}</button><button class="btn" data-act="co-cancel">Annuleren</button></div>
      ${f.id?(UI.confirm==="co-del"?`<div class="confirm"><span>Deze geplande training verwijderen? Een al gelogde training blijft bewaard.</span><div class="btnrow"><button class="btn danger" data-act="co-del-yes">Verwijderen</button><button class="btn" data-act="confirm-no">Behouden</button></div></div>`:`<div class="btnrow"><button class="btn ghost" data-act="co-copy">Kopiëren naar volgende week</button><button class="btn ghost danger" data-act="co-del">Verwijderen</button></div>`):""}
    </div>`;
    return h;
  }
  h+=`<button class="btn primary block" data-act="co-new" style="margin-top:12px">+ Training inplannen voor ${esc(name)}</button>`;
  const t=today(),all=Object.entries(c.data.plan).map(([id,p])=>({id,...p,done:planSession(c.data.sessions,id)}));
  const up=all.filter(p=>p.date>=t).sort((a,b)=>a.date.localeCompare(b.date));
  const past=all.filter(p=>p.date<t).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);
  const row=p=>{const st=p.done?`<span class="ok">✓ ${sessionSummary(p.done)}${p.done.avgHr?` · ${p.done.avgHr} bpm`:""}</span>${p.done.note?`<span class="l"> · "${esc(p.done.note)}"</span>`:""}`:p.date<t?`<span class="miss">Niet gelogd</span>`:`<span class="muted">Gepland</span>`;
    return `<button class="row coachrow" data-act="co-edit" data-id="${p.id}"><span class="n">${esc(p.title)}</span><span class="b none">${esc(dayLabel(p.date))}</span><span class="l">${esc(p.sport)}${planTargets(p)?" · "+planTargets(p):""}</span><span class="l">${st}</span></button>`};
  h+=`<h2>Komende trainingen</h2>${up.length?`<div class="recgroup">${up.map(row).join("")}</div>`:`<p class="muted small">Nog niets ingepland.</p>`}`;
  if(past.length){const done=past.filter(p=>p.done).length;h+=`<h2>Afgelopen · ${done} van ${past.length} gedaan</h2><div class="recgroup">${past.map(row).join("")}</div>`}
  return h;
}
function viewAdmin(){
  const people=S.people;
  let h=`<h2>Beheer</h2>`;
  if(!people)return h+`<div class="card"><p class="muted" style="margin:0">Accounts laden…</p></div>`;
  const others=people.filter(p=>p.id!==pid);
  h+=`<div class="card stack"><div class="adhead"><strong>Accounts (${people.length})</strong><button class="linkbtn" data-act="ad-refresh">Vernieuwen</button></div><div class="wlist">${people.map(p=>`<div class="arow"><span><b>${esc(p.name)}</b>${p.isAdmin?' <span class="chip">beheerder</span>':""}${p.hasPin?"":' <span class="chip">geen code</span>'}</span><span class="muted small">${p.sessions} training${p.sessions===1?"":"en"}${p.last?" · actief "+dateTxt(String(p.last).slice(0,10)):""}</span></div>`).join("")}</div>
    <p class="hp small muted">Alleen jij ziet deze lijst. Anderen loggen in met hun naam en code.</p>
    <p class="hp small muted">Trainingen inplannen voor iemand anders gaat via Samen trainen, met toestemming van die persoon.</p></div>`;
  if(!others.length)return h+`<p class="muted small">Er zijn nog geen andere accounts.</p>`;
  const opts=others.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
  h+=`<div class="card stack"><strong>Code vergeten</strong><p class="hp">Stel een nieuwe code in en geef die door. Diegene kan hem daarna zelf weer wijzigen.</p>
    <label class="f">Account<select id="ad-who">${opts}</select></label><label class="f">Nieuwe code<input type="text" id="ad-new" autocomplete="off" placeholder="minimaal 6 tekens"></label><button class="btn primary" data-act="ad-save">Nieuwe code instellen</button></div>`;
  h+=`<div class="card stack"><strong>Account verwijderen</strong>`;
  if(UI.confirm==="ad-del"&&UI.delWho){const p=people.find(x=>x.id===UI.delWho);
    h+=`<div class="confirm"><span>Account van <b>${esc(p?.name||"")}</b> definitief verwijderen? ${p&&p.sessions?`Alle ${p.sessions} training${p.sessions===1?"":"en"}, schema's en gegevens worden gewist.`:"Alle schema's en gegevens worden gewist."} Dit kan niet ongedaan worden gemaakt.</span><div class="btnrow"><button class="btn danger" data-act="ad-del-yes">Definitief verwijderen</button><button class="btn" data-act="confirm-no">Annuleren</button></div></div>`;
  }else h+=`<p class="hp">Alle trainingen en gegevens van dit account worden gewist.</p><label class="f">Account<select id="ad-delwho"><option value="">Kies een account</option>${opts}</select></label><button class="btn ghost danger" data-act="ad-del">Account verwijderen</button>`;
  return h+`</div>`;
}

