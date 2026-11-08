/* ---------- voortgang: grafieken per oefening en per duursport, per week ---------- */
const PC_WEEKS=8;
function pcWeeks(){const ws=weekStart(today());return [...Array(PC_WEEKS)].map((_,i)=>addDays(ws,-7*(PC_WEEKS-1-i)))}
const pcWk=d=>weekStart(d);
const pcLbl=w=>{const d=new Date(w+"T12:00:00");return d.getDate()+"/"+(d.getMonth()+1)};
/* klein staaf- of lijndiagram als SVG; lege weken blijven leeg */
function pcChart(vals,weeks,o={}){
  const W=320,H=96,pl=4,pr=4,pt=14,pb=16,n=vals.length,have=vals.filter(v=>v!=null);if(!have.length)return "";
  let mn=o.bar?0:Math.min(...have),mx=Math.max(...have);if(mx===mn){mx+=mx?Math.abs(mx)*0.1:1;mn=o.bar?0:mn-(Math.abs(mn)*0.1||1)}
  if(o.invert){}
  const x=i=>pl+(W-pl-pr)*(n===1?0.5:i/(n-1)),bw=(W-pl-pr)/n*0.62,y=v=>{let t=(v-mn)/(mx-mn);if(o.invert)t=1-t;return pt+(H-pt-pb)*(1-t)};
  let g="";
  if(o.bar)vals.forEach((v,i)=>{if(v==null||!v)return;const cx=pl+(W-pl-pr)*(i+0.5)/n,yy=y(v);g+=`<rect x="${(cx-bw/2).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(H-pb-yy).toFixed(1)}" rx="3" fill="var(--accent)" opacity="${i===n-1?1:.55}"/>`});
  else{const pts=vals.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
    g+=`<polyline points="${pts.map(p=>p.map(c=>c.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`+pts.map((p,k)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${k===pts.length-1?3.6:2.4}" fill="var(--accent)"/>`).join("")}
  const li=vals.map((v,i)=>v==null?-1:i).filter(i=>i>=0).pop(),lv=vals[li];
  const lx=o.bar?pl+(W-pl-pr)*(li+0.5)/n:x(li);
  g+=`<text x="${Math.min(W-2,Math.max(2,lx)).toFixed(1)}" y="${Math.max(10,y(lv)-5).toFixed(1)}" text-anchor="${li===n-1?"end":"middle"}" font-size="10" font-weight="700" fill="var(--fg)">${esc(o.fmt?o.fmt(lv):String(lv))}</text>`;
  g+=`<text x="${pl}" y="${H-3}" font-size="9" fill="var(--muted)">${pcLbl(weeks[0])}</text><text x="${W-pr}" y="${H-3}" font-size="9" text-anchor="end" fill="var(--muted)">deze week</text>`;
  return `<svg class="pcchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||"")}">${g}</svg>`}
/* verschil: laatste 2 weken met data tegenover de 4 weken daarvoor */
function pcTrend(vals,higher=true,done=false){const idx=vals.map((v,i)=>v==null?-1:i).filter(i=>i>=0&&!(done&&i===vals.length-1));if(idx.length<2)return null;
  const rec=idx.slice(-2).map(i=>vals[i]),old=idx.slice(0,-2).slice(-4).map(i=>vals[i]);if(!old.length)return null;
  const a=rec.reduce((s,v)=>s+v,0)/rec.length,b=old.reduce((s,v)=>s+v,0)/old.length;if(!b)return null;const d=(a-b)/b*(higher?1:-1);
  return{pct:d,st:d>0.015?"good":d<-0.03?"bad":"warn"}}
function pcBadge(t,txt){if(!t)return `<span class="pst">${txt||"Te weinig weken"}</span>`;const s=t.st==="good"?"Vooruit":t.st==="bad"?"Achteruit":"Gelijk";return `<span class="pst ${ST[t.st][1]}">${s} ${t.pct>0?"+":""}${Math.round(t.pct*100)}%</span>`}
function pcStrength(){
  const weeks=pcWeeks(),from=weeks[0],ses=sortedSessions().filter(s=>s.kind!=="cardio"&&s.date>=from),by={};
  for(const s of ses){const w=pcWk(s.date);for(const e of s.entries||[]){const k=entryKey(e);const o=by[k]||(by[k]={name:exName(e.exId,e.name),w:{},n:0,best:null});o.n++;
    for(const x of e.sets||[]){if(!(x.r>0))continue;const v=e1rm(x);if(!o.w[w]||v>o.w[w])o.w[w]=v;if(!o.best||better(x,o.best))o.best=x}}}
  const list=Object.values(by).filter(o=>Object.keys(o.w).length>=2).sort((a,b)=>b.n-a.n).slice(0,10);
  if(!list.length)return `<div class="card empty" style="margin-top:12px"><strong>Nog te weinig krachttrainingen</strong><p class="muted">Doe dezelfde oefening in minstens 2 verschillende weken, dan zie je hier je progressie.</p></div>`;
  return `<p class="small muted" style="margin:12px 0 8px">Per oefening je sterkste set per week, omgerekend naar één herhaling (zo kun je zware en lichte sets vergelijken). De laatste 2 weken tegenover de 4 weken daarvoor.</p><div class="pcgrid">`+list.map(o=>{const vals=weeks.map(w=>o.w[w]!=null?Math.round(o.w[w]*10)/10:null);
    return `<div class="card pccard"><div class="pchead"><b>${esc(o.name)}</b>${pcBadge(pcTrend(vals))}</div>${pcChart(vals,weeks,{fmt:v=>fmt1(v)+" kg",label:o.name})}<span class="small muted">Beste set: ${o.best?esc(setTxt(o.best)):"-"}</span></div>`}).join("")+`</div>`}
const PC_SPORTS=[["Hardlopen","run",s=>s.sport==="Hardlopen"],["Wielrennen","bike",s=>s.sport==="Wielrennen"],["Zwemmen","swim",s=>/zwem/i.test(s.sport||"")]];
function pcEndu(){
  const weeks=pcWeeks(),from=weeks[0],all=sortedSessions().filter(s=>s.kind==="cardio"&&s.date>=from);let h="";
  for(const [name,key,is] of PC_SPORTS){const ss=all.filter(is);if(!ss.length)continue;if(typeof spOn==="function"&&!spOn(key)&&!ss.length)continue;
    const swim=key==="swim",run=key==="run",W={};for(const s of ss){const w=pcWk(s.date),o=W[w]||(W[w]={km:0,min:0,kmT:0,minT:0,hrS:0,hrM:0,n:0});o.n++;o.km+=+s.km||0;o.min+=+s.durMin||0;if(s.km&&s.durMin){o.kmT+=+s.km;o.minT+=+s.durMin}if(s.avgHr&&s.durMin){o.hrS+=s.avgHr*s.durMin;o.hrM+=+s.durMin}}
    const km=weeks.map(w=>W[w]?Math.round(W[w].km*10)/10:null),spd=weeks.map(w=>W[w]&&W[w].kmT?(swim?W[w].minT/(W[w].kmT*10):run?W[w].minT/W[w].kmT:W[w].kmT/(W[w].minT/60)):null),hr=weeks.map(w=>W[w]&&W[w].hrM?Math.round(W[w].hrS/W[w].hrM):null);
    const sp=v=>swim?paceTxt(v,1).replace(" /km","")+" /100 m":run?paceTxt(v,1):fmt1(v)+" km/u";
    h+=`<h2>${esc(name)}</h2><div class="pcgrid">
      <div class="card pccard"><div class="pchead"><b>${swim?"Afstand":"Kilometers"} per week</b>${pcBadge(pcTrend(km,true,true))}</div>${pcChart(km.map(v=>v||null),weeks,{bar:true,fmt:v=>fmt1(v)+" km",label:name+" afstand"})}</div>
      <div class="card pccard"><div class="pchead"><b>${run||swim?"Gemiddeld tempo":"Gemiddelde snelheid"}</b>${pcBadge(pcTrend(spd,!(run||swim)))}</div>${pcChart(spd,weeks,{fmt:sp,invert:run||swim,label:name+" tempo"})||`<p class="small muted">Vul duur én afstand in om je tempo te zien.</p>`}</div>
      <div class="card pccard"><div class="pchead"><b>Gemiddelde hartslag</b>${pcBadge(null,hr.some(v=>v)?"Ter info":"Nog geen hartslag")}</div>${pcChart(hr,weeks,{fmt:v=>v+" bpm",label:name+" hartslag"})||`<p class="small muted">Vul je gemiddelde hartslag in, of plak je training uit je horloge-app.</p>`}<span class="small muted">Lagere hartslag bij hetzelfde tempo betekent dat je fitter wordt.</span></div></div>`}
  return h||`<div class="card empty" style="margin-top:12px"><strong>Nog geen duurtrainingen</strong><p class="muted">Log je hardloop-, fiets- of zwemtrainingen, dan zie je hier per week je afstand, tempo en hartslag.</p></div>`}
const PC_NOTE=`<p class="small muted" style="margin:12px 0 0">Kilometers: de laatste 2 hele weken tegenover de 4 weken daarvoor (deze week telt nog niet mee). Tempo en snelheid: de laatste 2 weken tegenover de 4 weken daarvoor.</p>`;
const PC_TABS=[["overzicht","Overzicht"],["kracht","Kracht"],["duur","Duursport"]];
const _viewProgressPc=viewProgress;viewProgress=function(){const t=PC_TABS.some(x=>x[0]===UI.pcTab)?UI.pcTab:"overzicht";
  return `<div class="seg seg3 pctabs" style="margin-top:12px">${PC_TABS.map(([k,l])=>`<button class="segb" data-act="pc-tab" data-v="${k}" aria-pressed="${t===k}">${l}</button>`).join("")}</div>`+(t==="kracht"?pcStrength():t==="duur"?PC_NOTE+pcEndu():_viewProgressPc())};
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="pc-tab"]');if(!b)return;UI.pcTab=b.dataset.v;if(UI.sheet&&UI.sheet.type==="hv-prog")renderSheet();else render()});

