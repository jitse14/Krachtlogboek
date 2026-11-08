/* ---------- 7.0: meekijken (trainingen, agenda) en kant-en-klare rollen bij Samen trainen ---------- */
PERMS.splice(PERMS.findIndex(p=>p[0]==="progress"),0,["sessions","Trainingen zien: al je gedane trainingen, met sets, tijden, hartslag en opmerkingen"],["agenda","Agenda zien: wat er in je planning staat, ook wat je zelf inplant"]);
PERM_SHORT.sessions="trainingen zien";PERM_SHORT.agenda="agenda zien";
const PERM_ROLES=[
 ["trainer","Trainer",{plan:true,schemas:true,results:true,sessions:true,agenda:true,progress:true}],
 ["maatje","Trainingsmaatje",{together:true,sessions:true,agenda:true}],
 ["voeding","Voedingscoach",{food:true,progress:true}],
 ["kijken","Alleen meekijken",{sessions:true,agenda:true}],
 ["klaar","Alleen klaarzetten",{plan:true,schemas:true,food:true}]];
function permRoles(id){return `<div class="f">Snel kiezen <i>daarna kun je zelf nog vinkjes aan- of uitzetten</i><div class="chips">${PERM_ROLES.map(([k,l])=>`<button class="chipb" data-act="perm-role" data-id="${id}" data-v="${k}">${l}</button>`).join("")}</div></div>`}
const _permEditor70=permEditor;permEditor=function(l,def){return permRoles(l.id)+_permEditor70(l,def)};
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="perm-role"]');if(!b)return;const r=PERM_ROLES.find(x=>x[0]===b.dataset.v);if(!r)return;
  for(const [k] of PERMS){const el=document.getElementById(`perm-${b.dataset.id}-${k}`);if(el&&k!=="direct")el.checked=!!r[2][k]}
  b.parentElement.querySelectorAll("[data-act]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));toast(`${r[1]}: vinkjes gezet. Pas ze gerust nog aan.`)});
/* meekijken als helper: één venster met tabbladen, alleen wat is toegestaan */
const hvCan=l=>({prog:!!l.perms.progress,ses:!!(l.perms.progress||l.perms.sessions),ag:!!(l.perms.progress||l.perms.agenda)});
function hvAgenda(){const t=today(),from=addDays(t,-7),to=addDays(t,28),items=planList().filter(p=>p.date>=from&&p.date<=to).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
  if(!items.length)return `<p class="small muted" style="margin-top:12px">Niets ingepland van vorige week tot over vier weken.</p>`;
  let h="",cur="";for(const p of items){if(p.date!==cur){cur=p.date;h+=`<h3 style="margin:14px 0 6px">${esc(dateTxt(p.date))}${p.date===t?" · vandaag":""}</h3>`}
    const done=planDoneFor(p);h+=`<div class="prow k-${planKind(p)} c-${planCat(p)}"><span class="pk">${esc(planChip(p))}</span><span class="pt">${esc(planTitle(p))}${p.time?` · ${esc(p.time)}`:""}</span><span class="small ${done?"":"muted"}">${done?"✓ gedaan":p.date<t?"niet gedaan":""}</span></div>`}
  return `<p class="small muted" style="margin:12px 0 0">Vorige week tot over vier weken.</p>`+h}
function hvSessions(){const recent=sortedSessions().slice(0,30);
  return `<h2>Gedane trainingen</h2>`+(recent.length?`<div class="recgroup">${recent.map(s=>`<button class="row logrow" data-act="hvp-ses" data-v="${esc(s.id)}"><span class="n">${esc(s.trail?"Trailrunnen":sesTitle(s))}</span><span class="b none">${s.kind==="cardio"?esc(cardioSummary(s)):(s.entries||[]).length+" oef."}</span><span class="l">${esc(dateTxt(s.date))}${s.feel?` · ${esc(hvFeel(s.feel))}`:""}${s.note||(s.entries||[]).some(e=>e.note)?" · 💬":""}</span></button>`).join("")}</div>`:`<p class="small muted">Nog geen trainingen.</p>`)+viewStrengthRecords()+viewCardioRecords()}
EXTRA_SHEETS["hv-prog"]=function(sh){
  const l=soc().outgoing.find(x=>x.id===sh.link)||{perms:{}},can=hvCan(l);
  let h=`<div class="sh"><h2>${esc(sh.name||"")}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>`;
  if(!sh.data)return h+`<p class="muted">Laden…</p>`;
  const tabs=[can.prog&&["voortgang","Voortgang"],can.ses&&["records","Trainingen"],can.ag&&["agenda","Agenda"]].filter(Boolean);
  const tab=tabs.some(x=>x[0]===sh.tab)?sh.tab:tabs[0][0];
  if(tabs.length>1)h+=`<div class="seg seg${tabs.length}">${tabs.map(([k,lb])=>`<button class="segb" data-act="hvp-tab" data-v="${k}" aria-pressed="${tab===k}">${lb}</button>`).join("")}</div>`;
  let body=withData(sh.data,()=>tab==="voortgang"?(nutrition().miss?`<p class="small muted" style="margin-top:12px">${esc(sh.name)} heeft het profiel nog niet helemaal ingevuld.</p>`+pcStrengthOnly():viewProgress()):tab==="agenda"?hvAgenda():hvSessions());
  body=body.replace(/<input[^>]*id="rec-q"[^>]*>/g,"").replace(/data-act="open-session"/g,'data-act="hvp-ses"').replace(/data-act="open-ex"/g,'data-act="hv-none"');
  return h+body+`<p class="small muted" style="margin-top:12px">Je ziet dit omdat ${esc(sh.name)} je toestemming gaf. Die kan ${esc(sh.name)} altijd intrekken.</p>`};
function pcStrengthOnly(){return ""}

