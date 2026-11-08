/* ---------- sportschema: hoe ging het? en weekcheck met bijsturing ---------- */
const FEELS=[["licht","Te licht"],["goed","Goed"],["zwaar","Zwaar, maar te doen"],["tezwaar","Te zwaar"],["pijn","Pijn of klachten"]];
const FEEL_TXT={licht:"Fijn! De app houdt er rekening mee: volgende keer mag het iets zwaarder.",goed:"Top, zo doorgaan.",zwaar:"Goed gedaan. Herstel goed: eten, drinken en slapen.",
  tezwaar:"Bedankt. De volgende keer houdt de app het iets rustiger aan. Je kunt het ook aangeven in je weekcheck.",pijn:"Neem rust en doe niets wat pijn doet. Houdt het aan of wordt het erger, overleg dan met een fysiotherapeut of huisarts. Geef het ook aan in je weekcheck."};
function fbAsk(sid){if(!S.sessions[sid])return;UI.sheet={type:"feel",sid};renderSheet()}
function fbAfterSave(id,rec){const p=rec&&rec.planId&&S.plan[rec.planId];if(p&&p.scp)setTimeout(()=>fbAsk(id),350)}
EXTRA_SHEETS["feel"]=function(sh){const s=S.sessions[sh.sid];if(!s)return"";
  return `<div class="sh"><h2>Hoe ging het?</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><p class="hp" style="margin:0">${esc(s.kind==="cardio"?s.sport:s.routineName||"Training")} · ${esc(dateTxt(s.date))}. Je antwoord helpt je sportschema bij te sturen.</p>
    <div class="stack">${FEELS.map(([v,l])=>`<button class="btn${v==="goed"?" primary":""}" data-act="fb-feel" data-v="${v}">${l}</button>`).join("")}</div>
    <button class="linkbtn" data-act="close-sheet">Overslaan</button></div>`};
function scSesFeel(s){return s&&s.feel||null}
/* de vorige sessie met deze oefening (voor het doel van vandaag) */
function lastSessionFor(exId){const k=exKey(exId);for(const s of sortedSessions())if((s.entries||[]).some(x=>entryKey(x)===k))return s;return null}
function wcWeekItems(sp,wn){return planList().filter(p=>p.scp===sp.stem&&p.scw===wn)}
function wcStats(items){
  const st={planned:items.filter(p=>planKind(p)!=="rest").length,done:0,feel:{},prs:0,km:0,kmDone:0};
  for(const p of items){const s=planDoneFor(p);if(p.km)st.km+=p.km;if(!s)continue;st.done++;const f=scSesFeel(s);if(f)st.feel[f]=(st.feel[f]||0)+1;if(s.km)st.kmDone+=s.km;
    for(const e of s.entries||[]){const k=entryKey(e);let best=null;for(const o of Object.values(S.sessions))if(o.date<s.date)for(const x of o.entries||[])if(entryKey(x)===k)for(const t of x.sets||[])if(t.r>0&&better(t,best))best=t;
      if(best&&e.sets.some(t=>better(t,best)))st.prs++}}
  return st;
}
function wcDue(){
  const sp=S.meta.scplan;if(!sp||!sp.stem||!sp.start)return null;
  const t=today(),cur=Math.floor(daysBetween(sp.start,t)/7),dow=(new Date(t+"T12:00:00").getDay()+6)%7;
  let wn=(dow>=5?cur:cur-1)+1;if(wn<1||wn>sp.weeks)return null;
  if((sp.checks||{})[wn]||UI.wcSkip===wn)return null;
  const items=wcWeekItems(sp,wn);if(!items.length)return null;
  return{wn,sp,st:wcStats(items),last:wn===sp.weeks};
}
function wcHarderReasons(st){const r=[];
  if(st.planned&&st.done/st.planned<0.8)r.push(`je deed ${st.done} van de ${st.planned} trainingen`);
  if(st.feel.tezwaar)r.push(`je gaf ${st.feel.tezwaar}× "te zwaar" aan`);
  if(st.feel.pijn)r.push("je gaf pijn of klachten aan");
  if(st.done>=2&&(st.feel.zwaar||0)>=Math.ceil(st.done/2))r.push("de meeste trainingen voelden zwaar");
  return r}
function wcCard(){
  const W=wcDue();if(!W)return"";const {wn,st}=W,f=st.feel;
  const bits=[`Je deed ${st.done} van de ${st.planned} training${st.planned===1?"":"en"}`];if(st.prs)bits.push(`${st.prs} nieuw${st.prs>1?"e":""} record${st.prs>1?"s":""}`);
  const fl=FEELS.filter(([v])=>f[v]).map(([v,l])=>`${f[v]}× ${l.toLowerCase()}`);if(fl.length)bits.push(fl.join(", "));
  let h=`<div class="card insight in-info wccard" style="margin-top:12px"><p><b>Weekcheck · week ${wn} van je sportschema</b><br>${esc(bits.join(" · "))}.</p>`;
  if(UI.wcWarn===wn){const r=wcHarderReasons(st);
    h+=`<p class="hp" style="margin:8px 0 0"><b>We raden zwaarder nu af:</b> ${esc(r.join(", "))}. Het schema zo houden is veiliger en geeft je lijf tijd om te wennen.</p>
      <div class="btnrow" style="margin-top:8px"><button class="btn primary" data-act="wc-ans" data-v="good">Zo laten</button><button class="btn" data-act="wc-force">Toch zwaarder</button></div></div>`;return h}
  h+=W.last?`<p class="hp" style="margin:8px 0 0">Dit was de laatste week van je schema. Hoe ging het?</p>`:`<p class="hp" style="margin:8px 0 0">Hoe ging deze week? Het schema past de komende weken daarop aan.</p>`;
  h+=`<div class="wcbtns"><button class="btn" data-act="wc-ans" data-v="lighter">Rustiger aan</button><button class="btn primary" data-act="wc-ans" data-v="good">Goed zo</button><button class="btn" data-act="wc-ans" data-v="harder">Mag zwaarder</button><button class="btn" data-act="wc-ans" data-v="pain">Ik heb klachten</button></div><button class="linkbtn" data-act="wc-later">Later</button>`;
  if(W.last)h+=`<button class="btn block" style="margin-top:8px" data-act="sc-open">Nieuw sportschema maken</button>`;
  return h+`</div>`;
}
const WC_NOTE={
  lighter:{str:"Rustiger aan na je weekcheck: zelfde gewichten als vorige week, 1 set minder per oefening, en stop 2-3 herhalingen voor het falen.",hiit:"Rustiger aan na je weekcheck: 1 ronde minder en wat meer rust tussen de oefeningen.",c:"Bijgesteld na je weekcheck: iets korter en rustiger. ",t:""},
  pain:{str:"Je gaf klachten aan: train pijnvrij. Sla oefeningen over die pijn doen of kies een lichtere variant. Houden de klachten aan of worden ze erger, ga dan naar een fysiotherapeut of je huisarts.",hiit:"Je gaf klachten aan: kies rustige varianten zonder sprongen en stop als iets pijn doet.",c:"Je gaf klachten aan: rustig en pijnvrij. Doet het pijn, stop dan. ",t:"Je gaf klachten aan: speel alleen als het pijnvrij gaat."},
  harder:{str:"Het mag zwaarder: probeer bij je eerste 2 oefeningen een stap zwaarder (± 2,5 kg) of voeg 1 set toe. Techniek blijft belangrijker dan gewicht.",hiit:"Het mag zwaarder: 1 ronde extra, of 5 s langer werken en 5 s korter rust.",c:"Bijgesteld na je weekcheck: iets langer. ",t:""}};
async function wcApply(wn,ans,override){
  const sp=S.meta.scplan;if(!sp)return;UI.wcWarn=null;
  const jobs=[];
  if(ans!=="good"){const nx=wn+1,N=WC_NOTE[ans];
    for(const p of planList().filter(p=>p.scp===sp.stem&&p.scw>wn&&!planDoneFor(p))){const {id,...q}=p;let ch=false;const k=planKind(p);
      if(k==="cardio"){const f=ans==="lighter"?(p.scw===nx?0.9:0.95):ans==="pain"?(p.scw===nx?0.7:0.85):1.05;
        if(p.km){q.km=Math.round(p.km*f*10)/10;ch=true}if(p.durMin){q.durMin=Math.round(p.durMin*f);ch=true}
        if(ans==="pain"&&p.scw===nx&&["tempo","interval"].includes(p.qual)){q.title=String(q.title||"").replace(/Tempotraining|Intervaltraining/,"Rustige duurtraining");q.purpose="Rustige duur";q.qual="easy";q.note="";ch=true}
        if(p.scw===nx){let nt=q.note||"";for(const x of Object.values(WC_NOTE))nt=nt.split(x.c).join("");q.note=N.c+nt;ch=true}}
      else if(k==="routine"&&p.scw===nx){q.prog={...(p.prog||{}),adj:ans};q.note=p.prog&&p.prog.hiit?N.hiit:N.str;ch=true}
      else if(k==="other"&&p.scw===nx&&N.t){q.note=N.t;ch=true}
      if(ch){q.updated=Date.now();jobs.push(["plan",id,q])}}}
  await runJobs(jobs,put);
  await put("meta","scplan",{...sp,checks:{...(sp.checks||{}),[wn]:{a:ans,at:Date.now(),ov:!!override}}});
  const msg={good:"Top! Je schema gaat zo verder.",lighter:"Je schema is bijgesteld: volgende week iets rustiger.",harder:"Je schema wordt vanaf volgende week iets zwaarder.",pain:"Volgende week is rustiger en zonder snelle trainingen. Blijven de klachten, ga dan naar een fysiotherapeut of je huisarts."}[ans];
  toastOk(msg+(override?" Je koos dit zelf, tegen het advies in: let goed op signalen van je lijf.":""));render();
}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;const act=b.dataset.act;
  if(act==="fb-feel"){const sh=UI.sheet,s=sh&&S.sessions[sh.sid];if(!s)return;const v=b.dataset.v;UI.sheet=null;renderSheet();await put("sessions",sh.sid,{...s,feel:v});toast(FEEL_TXT[v]);render();return}
  if(!act.startsWith("wc-"))return;const W=wcDue();if(!W)return;
  if(act==="wc-later"){UI.wcSkip=W.wn;render();return}
  if(act==="wc-force"){await wcApply(W.wn,"harder",true);return}
  if(act==="wc-ans"){const v=b.dataset.v;if(v==="harder"&&wcHarderReasons(W.st).length){UI.wcWarn=W.wn;render();return}await wcApply(W.wn,v,false)}
});

