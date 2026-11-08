/* ---------- cardio ---------- */
const CARDIO=["Hardlopen","Wielrennen","Anders"];
const OTHER_SPORTS=["Voetbal","Handbal","Volleybal","Basketbal","Hockey","Tennis","Padel","Squash","Zwemmen","Wandelen","Roeien","Spinning","Yoga","Boksen"];
const PURPOSES=["Rustige duur","Lange duur","Tempo","Interval","Herstel","Wedstrijd","Training","Gezellig"];
const RUN_D=[1,5,10,15,20,21.0975,25,30,35,40,42.195];
const BIKE_D=[10,25,40,50,60,70,80,90,100,110,120,130,140,150];
const distLbl=d=>d===21.0975?"Halve marathon":d===42.195?"Marathon":(String(d).replace(".",",")+" km");
function durTxt(min){if(!min)return"—";const t=Math.round(min*60),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return h?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${m}:${String(s).padStart(2,"0")}`}
function paceTxt(min,km){if(!min||!km)return"—";const p=min/km;let m=Math.floor(p),s=Math.round((p-m)*60);if(s===60){m++;s=0}return `${m}:${String(s).padStart(2,"0")} /km`}
function speed(min,km){return min&&km?km/(min/60):null}
const isRunBike=s=>s==="Hardlopen"||s==="Wielrennen";
function cardioDraftMin(c){return (num(c.h)||0)*60+(num(c.m)||0)+(num(c.s)||0)/60}
function saveCardioDraft(){if(pid)lsSet(cardioKey(),UI.cardio)}
function newCardio(sport,plan){
  const rb=isRunBike(sport);
  UI.cardio={sport:rb?sport:"Anders",other:!rb&&sport&&sport!=="Anders"?sport:"",date:today(),h:"",m:"",s:"",km:"",avgHr:"",maxHr:"",purpose:plan?.purpose||"",note:"",planId:plan?.id||null,efforts:null,gpx:null};
  saveCardioDraft();render();window.scrollTo(0,0);
}
function cardioLive(){
  const c=UI.cardio,min=cardioDraftMin(c),km=num(c.km),v=speed(min,km);
  return v?`<b>${fmt1(v)} km/u</b>${c.sport==="Hardlopen"?` · ${paceTxt(min,km)}`:""}`:`<span class="muted">Vul duur en afstand in</span>`;
}
function viewCardio(){
  const c=UI.cardio,pl=c.planId?S.plan[c.planId]:null,rb=isRunBike(c.sport);
  const list=spOtherList();if(c.other&&!list.includes(c.other)&&OTHER_SPORTS.includes(c.other))list.push(c.other);
  return `<div class="wohead"><div class="title">${rb?"Duurtraining loggen":"Sport loggen"}</div></div>${pl?`<div class="card plan" style="margin-top:12px"><span class="ml">Geplande training · ${esc(dayLabel(pl.date))}</span><strong>${esc(planTitle({id:c.planId,...pl}))}</strong>${planTargets(pl)?`<span class="muted small">${planTargets(pl)}</span>`:""}${pl.desc||pl.note?`<p class="pdesc">${esc(pl.desc||pl.note)}</p>`:""}</div>`:""}<div class="card stack" style="margin-top:12px">
    <div class="f">Sport${spCardioSeg("c-sport",c.sport)}</div>
    ${trailSeg(c)}
    ${rb?``
      :`<div class="f">Welke sport?<div class="chips">${list.map(s=>`<button class="chipb" data-act="c-other" data-v="${esc(s)}" aria-pressed="${c.other===s}">${esc(s)}</button>`).join("")}</div></div>
      ${spOn("other")||(c.other&&!OTHER_SPORTS.includes(c.other))?`<label class="f">Andere sport <i>vrij invullen</i><input type="text" id="c-other" value="${esc(list.includes(c.other)&&OTHER_SPORTS.includes(c.other)?"":c.other)}" placeholder="Bijv. klimmen, schaatsen, dansen" autocomplete="off"></label>`:""}`}
    <label class="f">Datum<input type="date" id="c-date" value="${esc(c.date)}"></label>
    <div class="f">Duur<div class="grid3"><input type="text" inputmode="numeric" id="c-h" value="${esc(c.h)}" placeholder="uur" aria-label="Uren"><input type="text" inputmode="numeric" id="c-m" value="${esc(c.m)}" placeholder="min" aria-label="Minuten"><input type="text" inputmode="numeric" id="c-s" value="${esc(c.s)}" placeholder="sec" aria-label="Seconden"></div></div>
    <label class="f">Afstand${rb?"":" <i>optioneel</i>"}<input type="text" inputmode="decimal" id="c-km" value="${esc(c.km)}" placeholder="km"></label>
    ${rb?`<div class="livespeed" id="c-live">${cardioLive()}</div>`:""}
    <div class="grid2"><label class="f">Gem. hartslag <i>optioneel</i><input type="text" inputmode="numeric" id="c-avg" value="${esc(c.avgHr)}" placeholder="bpm"></label><label class="f">Max. hartslag <i>optioneel</i><input type="text" inputmode="numeric" id="c-max" value="${esc(c.maxHr)}" placeholder="bpm"></label></div>
    <div class="f">Soort training<div class="chips">${PURPOSES.map(p=>`<button class="chipb" data-act="c-purpose" data-v="${p}" aria-pressed="${c.purpose===p}">${p}</button>`).join("")}</div></div>
    <label class="f">Toelichting<textarea id="c-note" rows="3" placeholder="Hoe ging het? Wat was het doel? Bijv. rustig ritje met vrienden, zware benen na beendag.">${esc(c.note)}</textarea></label>
    ${togetherRow("c")}<div class="btnrow"><button class="btn primary" data-act="c-save">Opslaan</button><button class="btn" data-act="c-cancel">Annuleren</button></div></div>`;
}
async function saveCardio(){
  const c=UI.cardio,min=cardioDraftMin(c),km=num(c.km);
  if(!min){toast("Vul de duur in.");return}
  const sport=isRunBike(c.sport)?c.sport:((c.other||"").trim()||"Anders");
  const id=uid();
  const rec={kind:"cardio",sport,date:c.date||today(),ts:Date.now(),routineName:c.trail&&sport==="Hardlopen"?"Trailrunnen":sport,...(c.trail&&sport==="Hardlopen"?{trail:true}:{}),durMin:Math.round(min*100)/100,km:km||null,avgHr:num(c.avgHr),maxHr:num(c.maxHr),purpose:c.purpose||null,note:(c.note||"").trim(),entries:[]};
  if(c.efforts&&isRunBike(sport)){rec.efforts=c.efforts;rec.source="gpx"}
  if(c.planId&&S.plan[c.planId]){rec.planId=c.planId;rec.planTitle=planTitle({id:c.planId,...S.plan[c.planId]})}
  UI.cardio=null;saveCardioDraft();const ok=await put("sessions",id,rec);
  toast(ok?`${sport} opgeslagen`:"Geen internet: training bewaard op je telefoon. Wordt automatisch verstuurd zodra je verbinding hebt.");render();window.scrollTo(0,0);fbAfterSave(id,rec);
}
/* GPX: alleen tijd, afstand, hartslag en snelste afstanden worden bewaard, niet de route zelf */
function parseGpx(txt){
  const doc=new DOMParser().parseFromString(txt,"application/xml");
  if(doc.getElementsByTagName("parsererror").length)throw new Error("geen geldig GPX-bestand");
  const pts=[...doc.getElementsByTagName("trkpt")].map(p=>{
    const t=p.getElementsByTagName("time")[0];let hr=null;
    for(const el of p.getElementsByTagName("*"))if(/(^|:)hr$/i.test(el.nodeName)){hr=parseFloat(el.textContent);break}
    return{lat:parseFloat(p.getAttribute("lat")),lon:parseFloat(p.getAttribute("lon")),t:t?Date.parse(t.textContent):NaN,hr};
  }).filter(p=>isFinite(p.lat)&&isFinite(p.lon)&&isFinite(p.t));
  if(pts.length<2)throw new Error("geen route met tijden gevonden");
  const R=6371000,rad=x=>x*Math.PI/180;
  const cum=[0];
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;cum.push(cum[i-1]+2*R*Math.asin(Math.sqrt(h)))}
  const totalM=cum[cum.length-1],secs=(pts[pts.length-1].t-pts[0].t)/1000;
  const typeEl=doc.getElementsByTagName("type")[0],type=typeEl?typeEl.textContent.toLowerCase():"";
  const sport=/cycl|bik|ride|fiets|^1$/.test(type)?"Wielrennen":/run|loop|^9$/.test(type)?"Hardlopen":null;
  const hrs=pts.map(p=>p.hr).filter(x=>x>30&&x<240);
  const avgHr=hrs.length?Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length):null,maxHr=hrs.length?Math.round(Math.max(...hrs)):null;
  const best=dm=>{let j=0,bestS=Infinity;for(let i=1;i<pts.length;i++){if(cum[i]<dm)continue;while(j+1<i&&cum[i]-cum[j+1]>=dm)j++;const over=(cum[i]-cum[j])-dm,seg=cum[j+1]-cum[j]||1;const tStart=pts[j].t+Math.min(1,over/seg)*(pts[j+1].t-pts[j].t);const s=(pts[i].t-tStart)/1000;if(s>0&&s<bestS)bestS=s}return isFinite(bestS)?Math.round(bestS):null};
  const d=new Date(pts[0].t);
  return{date:isoOf(d),secs,km:totalM/1000,sport,avgHr,maxHr,best,name:(doc.getElementsByTagName("name")[0]||{}).textContent||""};
}
async function importGpx(file){
  try{
    const g=parseGpx(await file.text()),c=UI.cardio;
    if(g.secs<=0||g.km<0.2)throw new Error("te korte activiteit");
    if(g.sport&&g.sport!==c.sport)c.sport=g.sport;
    const ds=c.sport==="Wielrennen"?BIKE_D:RUN_D,efforts={};
    for(const d of ds)if(g.km>=d){const s=g.best(d*1000);if(s)efforts[String(d)]=s}
    const t=Math.round(g.secs);
    Object.assign(c,{date:g.date,h:String(Math.floor(t/3600)||""),m:String(Math.floor(t%3600/60)),s:String(t%60),km:String(Math.round(g.km*100)/100).replace(".",","),avgHr:g.avgHr?String(g.avgHr):c.avgHr,maxHr:g.maxHr?String(g.maxHr):c.maxHr,efforts,gpx:`${file.name.slice(0,40)} · ${fmt1(g.km)} km`});
    saveCardioDraft();render();
    const n=Object.keys(efforts).length;toast(`GPX ingelezen: ${fmt1(g.km)} km in ${durTxt(g.secs/60)}${n?` · ${n} snelste afstand${n>1?"en":""} berekend`:""}`);
  }catch(e){toast("Dit bestand kon niet gelezen worden: "+(e.message||"onbekende fout")+". Gebruik een GPX-export van één activiteit.")}
}
function cardioSessions(sport){return sortedSessions().filter(s=>s.kind==="cardio"&&(!sport||s.sport===sport))}
function cardioSummary(s){return [s.km?fmt1(s.km)+" km":null,durTxt(s.durMin),s.km&&s.durMin&&isRunBike(s.sport)?(s.sport==="Hardlopen"?paceTxt(s.durMin,s.km):fmt1(speed(s.durMin,s.km))+" km/u"):null].filter(Boolean).join(" · ")}
function distRecords(sport){
  const ds=sport==="Wielrennen"?BIKE_D:RUN_D,list=cardioSessions(sport),out=[];
  for(const d of ds){
    let best=null;
    for(const s of list){
      let sec=null,est=false;
      if(s.efforts&&s.efforts[String(d)])sec=s.efforts[String(d)];
      else if(s.km&&s.durMin&&s.km>=d-0.05){sec=s.durMin*60/s.km*d;est=Math.abs(s.km-d)>0.05}
      if(sec&&(!best||sec<best.sec))best={sec,est,date:s.date,id:s.id};
    }
    if(best)out.push({d,...best});
  }
  return out;
}
function viewCardioRecords(){
  const all=cardioSessions();if(!all.length)return "";
  const month=today().slice(0,7);let h="";
  for(const sp of ["Hardlopen","Wielrennen"].filter(spCardioOk)){
    const l=cardioSessions(sp);if(!l.length)continue;
    const kmMonth=l.filter(s=>(s.date||"").startsWith(month)).reduce((t,s)=>t+(s.km||0),0);
    const recs=distRecords(sp);
    h+=`<h2>${sp}</h2><div class="recgroup"><div class="row" style="cursor:default"><span class="n">Deze maand</span><span class="b">${fmt1(kmMonth)} km</span><span class="l">${l.length} ${l.length===1?"training":"trainingen"} totaal · langste ${fmt1(Math.max(...l.map(s=>s.km||0)))} km</span></div>`+
      recs.map(r=>`<button class="row" data-act="open-session" data-id="${r.id}"><span class="n">${distLbl(r.d)}</span><span class="b">${r.est?"≈ ":""}${durTxt(r.sec/60)}</span><span class="l">${sp==="Hardlopen"?paceTxt(r.sec/60,r.d):fmt1(r.d/(r.sec/3600))+" km/u"} · ${dateTxt(r.date)}${r.est?" · o.b.v. gemiddeld tempo":""}</span></button>`).join("")+`</div>`;
  }
  if(cardioSessions("Hardlopen").length||cardioSessions("Wielrennen").length)h+=`<p class="small muted">≈ = berekend met het gemiddelde tempo van een langere training.</p>`;
  const others={};for(const s of all)if(!isRunBike(s.sport))(others[s.sport]=others[s.sport]||[]).push(s);
  const names=Object.keys(others).sort();
  if(names.length){
    h+=`<h2>Overige sporten</h2><div class="recgroup">`+names.map(n=>{const l=others[n],mins=l.filter(s=>(s.date||"").startsWith(month)).reduce((t,s)=>t+(s.durMin||0),0);
      return `<div class="row" style="cursor:default"><span class="n">${esc(n)}</span><span class="b">${l.length}×</span><span class="l">${mins?`Deze maand ${Math.floor(mins/60)?Math.floor(mins/60)+" u ":""}${Math.round(mins%60)} min`:"Deze maand nog niet"} · laatst ${dateTxt(l[0].date)}</span></div>`}).join("")+`</div>`;
  }
  return h;
}

