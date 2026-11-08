/* ---------- samen trainen: de hele training en de voortgang zien (met toestemming) ---------- */
const hvFeel=f=>((FEELS.find(x=>x[0]===f)||[,f])[1]);
/* volledige weergave van een training; werkt op eigen en gedeelde gegevens */
function sessionFullHtml(s){
  let h="";
  if(s.planTitle)h+=`<p class="small muted" style="margin:0 0 8px">Geplande training: <b>${esc(s.planTitle)}</b></p>`;
  if(s.kind==="cardio"){const min=+s.durMin||0,km=+s.km||0,v=min&&km?speed(min,km):null;
    h+=`<div class="card"><div class="calc">${min?`<div><span>Duur</span><b>${durTxt(min)}</b></div>`:""}${km?`<div><span>Afstand</span><b>${fmt1(km)} km</b></div>`:""}${v?`<div><span>Gem. snelheid</span><b>${fmt1(v)} km/u</b></div>`:""}${v&&s.sport==="Hardlopen"?`<div><span>Tempo</span><b>${paceTxt(min,km)}</b></div>`:""}${s.avgHr?`<div><span>Gem. hartslag</span><b>${esc(s.avgHr)} bpm</b></div>`:""}${s.maxHr?`<div><span>Max. hartslag</span><b>${esc(s.maxHr)} bpm</b></div>`:""}${s.purpose?`<div><span>Soort training</span><b>${esc(s.purpose)}</b></div>`:""}</div></div>`}
  else h+=`<div class="hist">${(s.entries||[]).map(e=>`<div class="h"><div class="d">${esc(e.name||exName(e.exId))}</div><div class="s">${(e.sets||[]).map(shortSet).join(" · ")}</div>${exNoteTxt(e)}</div>`).join("")||`<p class="muted small">Geen sets.</p>`}</div>`;
  if(s.feel)h+=`<p class="hp" style="margin:10px 0 0"><b>Hoe ging het:</b> ${esc(hvFeel(s.feel))}</p>`;
  if(s.note)h+=`<div class="card" style="margin-top:10px"><span class="ml">Opmerking</span><p class="hp" style="margin:4px 0 0;white-space:pre-wrap">${esc(s.note)}</p></div>`;
  return h;
}
function sesTitle(s){return s.kind==="cardio"?(s.sport||"Duurtraining"):(s.routineName||"Training")}
EXTRA_SHEETS["hv-ses"]=function(sh){
  const s=sh.ses;if(!s)return null;
  return `<div class="sh"><h2>${esc(sesTitle(s))} · ${esc(dateTxt(s.date))}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
    <p class="small muted" style="margin:0 0 8px">Van ${esc(sh.name||"")}</p>${sessionFullHtml(s)}
    ${sh.back?`<button class="btn block" style="margin-top:14px" data-act="hv-back">← Terug</button>`:""}`};
/* andermans gegevens tijdelijk tonen met de gewone voortgangsweergave */
function withData(D,fn){const keep={};for(const c of COLLS){keep[c]=S[c];S[c]=(D&&D[c])||{}}try{return fn()}finally{for(const c of COLLS)S[c]=keep[c]}}
EXTRA_SHEETS["hv-prog"]=function(sh){
  let h=`<div class="sh"><h2>Voortgang ${esc(sh.name||"")}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>`;
  if(!sh.data)return h+`<p class="muted">Laden…</p>`;
  const tab=sh.tab||"voortgang";
  h+=`<div class="seg seg2"><button class="segb" data-act="hvp-tab" data-v="voortgang" aria-pressed="${tab==="voortgang"}">Voortgang</button><button class="segb" data-act="hvp-tab" data-v="records" aria-pressed="${tab==="records"}">Trainingen en records</button></div>`;
  let body=withData(sh.data,()=>{
    if(tab==="voortgang")return nutrition().miss?`<p class="small muted" style="margin-top:12px">${esc(sh.name)} heeft het profiel nog niet helemaal ingevuld.</p>`:viewProgress();
    const recent=sortedSessions().slice(0,15);
    return `<h2>Laatste trainingen</h2>`+(recent.length?`<div class="recgroup">${recent.map(s=>`<button class="row logrow" data-act="hvp-ses" data-v="${esc(s.id)}"><span class="n">${esc(sesTitle(s))}</span><span class="b none">${s.kind==="cardio"?esc(cardioSummary(s)):(s.entries||[]).length+" oef."}</span><span class="l">${esc(dateTxt(s.date))}${s.feel?` · ${esc(hvFeel(s.feel))}`:""}${s.note?" · 💬":""}</span></button>`).join("")}</div>`:`<p class="small muted">Nog geen trainingen.</p>`)
      +viewStrengthRecords()+viewCardioRecords()});
  body=body.replace(/<input[^>]*id="rec-q"[^>]*>/g,"").replace(/data-act="open-session"/g,'data-act="hvp-ses"').replace(/data-act="open-ex"/g,'data-act="hv-none"');
  return h+body+`<p class="small muted" style="margin-top:12px">Je ziet dit omdat ${esc(sh.name)} je toestemming gaf. Die kan ${esc(sh.name)} altijd intrekken.</p>`};
async function openHelpProgress(link){const l=soc().outgoing.find(x=>x.id===link);UI.sheet={type:"hv-prog",link,name:l?l.name:"",data:null,tab:"voortgang"};render();
  try{const d=await rpc("kl_help_progress",{p_code:code,p_profile:pid,p_pin:myPin(),p_link:link});if(UI.sheet&&UI.sheet.type==="hv-prog"&&UI.sheet.link===link){UI.sheet.data=d||{};renderSheet()}}
  catch(e){UI.sheet=null;render();if(e.code==="no_perm"){toast("Je hebt hier geen toestemming (meer) voor.");loadSocial()}else handleErr(e)}}
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act^="hv"]');if(!b)return;const act=b.dataset.act,sh=UI.sheet;
  if(act==="hv-prog"){await openHelpProgress(+b.dataset.id);return}
  if(act==="hv-ses"&&sh&&sh.type==="help-view"&&sh.data){const p=sh.data.plan.find(x=>x.id===b.dataset.v);if(!p||!p.session)return;const l=soc().outgoing.find(x=>x.id===sh.link);
    UI.sheet={type:"hv-ses",ses:p.session,name:l?l.name:"",back:sh};renderSheet();document.querySelector(".sheet")?.scrollTo(0,0);return}
  if(act==="hvp-ses"&&sh&&sh.type==="hv-prog"&&sh.data){const s=(sh.data.sessions||{})[b.dataset.v];if(!s)return;UI.sheet={type:"hv-ses",ses:s,name:sh.name,back:sh};renderSheet();return}
  if(act==="hvp-tab"&&sh&&sh.type==="hv-prog"){sh.tab=b.dataset.v;renderSheet();return}
  if(act==="hv-back"&&sh&&sh.back){UI.sheet=sh.back;renderSheet();return}
});
/* pg-days binnen het voortgangsvenster van een ander */
document.addEventListener("click",ev=>{const b=ev.target.closest('.sheet [data-act="pg-days"]');if(b&&UI.sheet&&UI.sheet.type==="hv-prog"){setTimeout(()=>renderSheet(),0)}});

