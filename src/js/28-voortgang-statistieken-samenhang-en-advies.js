/* ---------- voortgang: statistieken, samenhang en advies ---------- */
const ST={good:["Goed","st-good"],warn:["Let op","st-warn"],bad:["Bijsturen","st-bad"],none:["Te weinig gegevens","st-none"]};
const e1rm=s=>s.k>0?s.k*(1+s.r/30):s.r;
function daysBetween(a,b){return Math.round((Date.parse(b+"T12:00:00")-Date.parse(a+"T12:00:00"))/864e5)}
function weightTrend(from,to){
  const l=weightList().filter(x=>x.date>=from&&x.date<=to);if(l.length<2)return null;
  const span=daysBetween(l[0].date,l[l.length-1].date);if(span<6)return null;
  const xs=l.map(x=>daysBetween(from,x.date)),ys=l.map(x=>x.kg),n=l.length,mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;
  let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2}
  const perDay=sxx?sxy/sxx:0;return{perWeek:perDay*7,n,span,first:l[0],last:l[l.length-1],list:l};
}
function periodStats(days){
  const t=today(),from=addDays(t,-(days-1)),pFrom=addDays(from,-days),pTo=addDays(from,-1);
  const n=nutrition(),b=bodyMeta();
  const fdays=[];for(let i=0;i<days;i++){const d=addDays(from,i),its=logDay(d);if(its.length){const m=sumM(its);if(m.k>300)fdays.push({d,...m})}}
  const avg=k=>fdays.length?fdays.reduce((s,x)=>s+x[k],0)/fdays.length:null;
  const ses=sortedSessions().filter(s=>s.date>=from&&s.date<=t),prev=sortedSessions().filter(s=>s.date>=pFrom&&s.date<=pTo);
  const perWeekTarget=Object.values(b.sports||{}).reduce((s,x)=>s+(x.n||0),0);
  const plan=planList().filter(p=>p.date>=from&&p.date<=t&&planKind(p)!=="rest"),planDone=plan.filter(p=>planDoneFor(p)).length;
  const best=(list)=>{const m={};for(const s of list)for(const e of s.entries||[]){const k=entryKey(e);for(const x of e.sets||[]){if(!(x.r>0))continue;const v=e1rm(x);if(!m[k]||v>m[k].v)m[k]={v,name:exName(e.exId,e.name),set:x}}}return m};
  const bNow=best(ses),bPrev=best(prev);let up=0,same=0,down=0;const ups=[],downs=[];
  for(const [k,x] of Object.entries(bNow)){const p=bPrev[k];if(!p)continue;const d=(x.v-p.v)/p.v;if(d>0.015){up++;ups.push(x.name)}else if(d<-0.03){down++;downs.push(x.name)}else same++}
  const km=l=>l.filter(s=>s.kind==="cardio").reduce((s,x)=>s+(x.km||0),0),mins=l=>l.filter(s=>s.kind==="cardio").reduce((s,x)=>s+(x.durMin||0),0);
  const wt=weightTrend(addDays(t,-Math.max(days,14)+1),t);
  return{days,from,t,n,b,fdays,kcal:avg("k"),prot:avg("p"),carb:avg("c"),fat:avg("f"),ses,prev,str:ses.filter(s=>s.kind!=="cardio").length,cardio:ses.filter(s=>s.kind==="cardio").length,
    perWeekTarget,plan:plan.length,planDone,up,same,down,ups,downs,compared:up+same+down,km:km(ses),kmPrev:km(prev),min:mins(ses),wt,weighIns:weightList().filter(x=>x.date>=from).length};
}
function rateEval(g,pct){
  if(g==="onderhoud"){const a=Math.abs(pct);return a<=0.25?"good":a<=0.5?"warn":"bad"}
  const target=GOAL_RATE[g]||0;
  if(Math.sign(pct)!==Math.sign(target)||Math.abs(pct)<0.05)return Math.abs(pct)<0.1?"warn":"bad";
  const r=pct/target;return r>2?"bad":r>=0.5&&r<=1.6?"good":"warn";
}
function progressTiles(P){
  const n=P.n,g=P.b.goal,w=currentWeight(),tiles=[];
  if(P.wt&&w){const pct=P.wt.perWeek/w*100,st=g?rateEval(g,pct):"none";
    tiles.push({k:"gewicht",l:"Gewicht",v:Math.abs(P.wt.perWeek)<0.05?"± 0 kg/week":`${P.wt.perWeek>=0?"+":"−"}${fmt1(Math.abs(P.wt.perWeek))} kg/week`,sub:`${fmt1(P.wt.first.kg)} → ${fmt1(P.wt.last.kg)} kg`,st})}
  else tiles.push({k:"gewicht",l:"Gewicht",v:"—",sub:"Weeg je minstens 1× per week, op een vaste dag en tijd",st:"none"});
  const minDays=Math.min(4,Math.ceil(P.days/2));
  if(P.fdays.length>=minDays&&!n.miss){const d=(P.kcal-n.kcal)/n.kcal,a=Math.abs(d);
    tiles.push({k:"kcal",l:"Calorieën",v:`${nl(r10(P.kcal))} kcal`,sub:`doel ${nl(r10(n.kcal))} · ${d>=0?"+":"−"}${Math.round(a*100)}%`,st:a<=0.07?"good":a<=0.15?"warn":"bad"});
    const pr=P.prot/n.protein;tiles.push({k:"eiwit",l:"Eiwit",v:`${Math.round(P.prot)} g`,sub:`doel ${r5(n.protein)} g · ${Math.round(pr*100)}%`,st:pr>=0.9?"good":pr>=0.75?"warn":"bad"})}
  else{tiles.push({k:"kcal",l:"Calorieën",v:"—",sub:`Log je eten minstens ${minDays} dagen`,st:"none"});tiles.push({k:"eiwit",l:"Eiwit",v:"—",sub:"Komt uit je voedingsdagboek",st:"none"})}
  const weeks=P.days/7,tot=P.str+P.cardio;
  if(P.perWeekTarget){const r=tot/(P.perWeekTarget*weeks);tiles.push({k:"train",l:"Trainingen",v:`${tot}×`,sub:`doel ${Math.round(P.perWeekTarget*weeks)}× (${P.perWeekTarget}× per week)`,st:r>=0.9?"good":r>=0.6?"warn":"bad"})}
  else if(P.plan){const r=P.planDone/P.plan;tiles.push({k:"train",l:"Trainingen",v:`${P.planDone} van ${P.plan}`,sub:"geplande trainingen gedaan",st:r>=0.9?"good":r>=0.6?"warn":"bad"})}
  else tiles.push({k:"train",l:"Trainingen",v:`${tot}×`,sub:"Vul je sportweek in bij Profiel voor een doel",st:tot?"good":"none"});
  if(P.compared){const st=P.down>P.up?"bad":P.up>0?"good":"warn";tiles.push({k:"kracht",l:"Kracht",v:`${P.up} ↑ · ${P.same} = · ${P.down} ↓`,sub:"oefeningen t.o.v. de periode ervoor",st})}
  else if(P.str)tiles.push({k:"kracht",l:"Kracht",v:"—",sub:"Doe oefeningen vaker om te vergelijken",st:"none"});
  if(P.cardio||P.kmPrev){const d=P.kmPrev?(P.km-P.kmPrev)/P.kmPrev:1;tiles.push({k:"duur",l:"Duursport",v:`${fmt1(P.km)} km`,sub:P.kmPrev?`${d>=0?"+":"−"}${Math.round(Math.abs(d)*100)}% t.o.v. de periode ervoor`:`${P.cardio}× deze periode`,st:d>=-0.1?"good":d>=-0.35?"warn":"bad"})}
  if(P.plan&&P.perWeekTarget){const r=P.planDone/P.plan;tiles.push({k:"plan",l:"Planning",v:`${P.planDone} van ${P.plan}`,sub:"geplande trainingen gedaan",st:r>=0.9?"good":r>=0.6?"warn":"bad"})}
  return tiles;
}
function progressInsights(P,tiles){
  const n=P.n,g=P.b.goal,T=Object.fromEntries(tiles.map(t=>[t.k,t])),w=currentWeight(),out=[];
  const logged=P.fdays.length,wt=P.wt,pct=wt&&w?wt.perWeek/w*100:null,kcalDiff=P.kcal!=null&&!n.miss?P.kcal-n.kcal:null;
  // werkelijk verbruik uit dagboek + gewicht
  if(wt&&logged>=Math.min(10,P.days-2)&&P.days>=14){const real=P.kcal-wt.perWeek/7*7700;
    if(Math.abs(real-n.tdee)>150)var tdeeIns=({st:"info",t:`Op basis van wat je eet en hoe je gewicht verandert, lijkt je werkelijke verbruik ± ${nl(r10(real))} kcal per dag. De app rekende met ${nl(r10(n.tdee))} kcal. ${real>n.tdee?"Je verbrandt dus meer dan verwacht.":"Je verbrandt dus minder dan verwacht."} Pas je dagdoel gerust aan bij Voeding → Zelf aanpassen: ± ${nl(r10(real+(n.kcal-n.tdee)))} kcal past dan bij je doel.`})}
  if(g&&wt&&T.gewicht.st!=="good"){
    if(isBulk(g)){
      if(pct<=0.05){if(kcalDiff!=null&&kcalDiff< -100)out.push({st:"bad",t:`Je komt niet aan, en je eet gemiddeld ${nl(r10(-kcalDiff))} kcal per dag minder dan je doel. Dat verklaart het: zonder overschot groeit je lichaam niet. Voeg dagelijks iets calorierijks toe, zoals een extra boterham met pindakaas, een handje noten of een shake met volle melk.`});
        else if(kcalDiff!=null)out.push({st:"warn",t:`Je eet volgens je dagboek op je doel, maar je gewicht stijgt niet. Je verbruikt waarschijnlijk meer dan berekend. Verhoog je dagdoel met 150 à 200 kcal en kijk over 2 weken opnieuw.`});
        else out.push({st:"warn",t:"Je gewicht stijgt niet. Houd een paar weken je eten bij in het dagboek, dan ziet de app of je genoeg eet."})}
      else if(pct>GOAL_RATE[g]*1.6)out.push({st:"warn",t:`Je komt ${fmt1(wt.perWeek)} kg per week aan; dat is sneller dan bij een ${g==="bulk_lean"?"lean":"heavy"} bulk past. Een deel daarvan is waarschijnlijk vet. Verlaag je dagdoel met 100 à 200 kcal.`});
    }else if(isCut(g)){
      if(pct>=-0.05){if(kcalDiff!=null&&kcalDiff>100)out.push({st:"bad",t:`Je valt niet af, en je eet gemiddeld ${nl(r10(kcalDiff))} kcal per dag boven je doel. Kijk in je dagboek waar dat zit: vaak zijn het snacks, sauzen en drinken.`});
        else if(kcalDiff!=null)out.push({st:"warn",t:"Je eet volgens je dagboek op je doel, maar je gewicht daalt niet. Controleer of je alles registreert (ook olie, sauzen en drinken) of verlaag je dagdoel met 150 kcal."});
        else out.push({st:"warn",t:"Je gewicht daalt niet. Houd een paar weken je eten bij, dan ziet de app waar het zit."})}
      else if(pct<GOAL_RATE[g]*1.6||pct<-1)out.push({st:"warn",t:`Je valt ${fmt1(-wt.perWeek)} kg per week af. Dat is snel: je loopt kans op spierverlies en je houdt het moeilijker vol. Verklein je tekort met 150 à 250 kcal.`});
    }else if(g==="onderhoud")out.push({st:"warn",t:`Je gewicht ${pct>0?"stijgt":"daalt"} met ${fmt1(Math.abs(wt.perWeek))} kg per week, terwijl je op gewicht wilt blijven. Pas je dagdoel met ± ${nl(r10(Math.abs(wt.perWeek)/7*7700))} kcal per dag ${pct>0?"omlaag":"omhoog"} aan.`});
  }
  if(isCut(g)&&P.down>P.up&&P.down>0)out.push({st:"bad",t:`Je kracht daalt (${P.downs.slice(0,3).join(", ")}). Tijdens droogtrainen is dat een signaal dat je tekort te groot is of je te weinig eiwit eet. ${T.eiwit&&T.eiwit.st!=="good"&&T.eiwit.st!=="none"?"Je eiwit zit ook onder je doel; begin daar.":"Verklein je tekort wat en blijf zwaar trainen."}`});
  else if(P.down>P.up&&P.down>0)out.push({st:"warn",t:`Bij ${P.downs.slice(0,3).join(", ")} ben je minder sterk dan de periode ervoor. Slaap, stress, te weinig eten of te veel volume kunnen dat verklaren. Plan een lichtere week als het blijft dalen.`});
  else if(P.up)out.push({st:"good",t:`Je wordt sterker: vooruitgang bij ${P.ups.slice(0,3).join(", ")}${P.up>3?` en ${P.up-3} andere`:""}.${T.eiwit&&T.eiwit.st==="good"?" Je eiwit zit ook goed; dat helpt.":""}`});
  if(T.eiwit&&(T.eiwit.st==="bad"||T.eiwit.st==="warn")&&!out.some(o=>/eiwit/.test(o.t)))out.push({st:T.eiwit.st,t:`Je eet gemiddeld ${Math.round(P.prot)} g eiwit, je doel is ${r5(n.protein)} g. Een extra portie kwark, skyr, kipfilet of een shake overbrugt het verschil van ± ${Math.round(n.protein-P.prot)} g.`});
  if(T.train&&T.train.st==="bad")out.push({st:"bad",t:`Je trainde ${P.str+P.cardio}× in deze periode, minder dan je van plan was. Plan je trainingen vooraf in bij Planning; dat helpt om ze ook echt te doen.`});
  else if(T.train&&T.train.st==="warn")out.push({st:"warn",t:"Je trainde iets minder dan gepland. Een vaste dag en tijd per training maakt het makkelijker om vol te houden."});
  if(T.duur&&T.duur.st!=="good")out.push({st:T.duur.st,t:`Je liep of fietste ${fmt1(P.km)} km, minder dan de periode ervoor (${fmt1(P.kmPrev)} km). Was dat bewust (rustweek), dan is dat prima.`});
  if(typeof tdeeIns!=="undefined"&&tdeeIns)out.push(tdeeIns);
  if(logged<Math.ceil(P.days*0.6))out.push({st:"info",t:`Je hebt ${logged} van de ${P.days} dagen je eten geregistreerd. Hoe vaker je registreert, hoe beter de app de relatie tussen je voeding, gewicht en kracht kan laten zien. Probeer minstens 5 dagen per week.`});
  const wl=weightList().filter(x=>x.date>=P.from),wd=new Set(wl.map(x=>new Date(x.date+"T12:00:00").getDay()));
  if(P.weighIns<Math.ceil(P.days/7))out.push({st:"info",t:WEIGH_TIP+" "+WEIGH_CALM});
  else if(wl.length>=3&&wd.size>Math.max(2,Math.ceil(wl.length/2)))out.push({st:"info",t:"Je weegt op steeds verschillende dagen. Kies vaste dagen en een vast moment, bijvoorbeeld maandag en vrijdag voor het ontbijt; dan is je lijn betrouwbaarder. "+WEIGH_CALM});
  if(!out.some(o=>o.st==="bad"||o.st==="warn")&&tiles.filter(t=>t.st==="good").length>=2)out.unshift({st:"good",t:"Je bent goed op koers: je voeding, training en resultaten passen bij elkaar. Ga zo door."});
  return out;
}
function progressChart(P){
  const n=P.n,W=320,H=96,pad=4,days=P.days,bw=(W-2*pad)/days;
  if(n.miss)return "";
  const map=Object.fromEntries(P.fdays.map(x=>[x.d,x.k])),max=Math.max(n.kcal*1.4,...P.fdays.map(x=>x.k));
  let bars="";for(let i=0;i<days;i++){const d=addDays(P.from,i),k=map[d];if(!k)continue;const h=(H-14)*k/max,a=Math.abs(k-n.kcal)/n.kcal,c=a<=0.07?"var(--good)":a<=0.15?"var(--warn)":"var(--bad)";bars+=`<rect x="${(pad+i*bw+bw*0.15).toFixed(1)}" y="${(H-h).toFixed(1)}" width="${(bw*0.7).toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${c}"/>`}
  const ty=H-(H-14)*n.kcal/max;
  return `<div class="card"><div class="mh"><b>Calorieën per dag</b><span class="small muted">lijn = je doel</span></div><svg class="pchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Calorieën per dag ten opzichte van je doel">${bars}<line x1="0" x2="${W}" y1="${ty.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="var(--fg)" stroke-dasharray="4 4" stroke-width="1.2" opacity=".6"/></svg>${P.fdays.length?"":`<p class="small muted" style="margin:0">Nog geen dagen geregistreerd.</p>`}</div>`;
}
function viewProgress(){
  const days=UI.progDays||28,P=periodStats(days),tiles=progressTiles(P),ins=progressInsights(P,tiles);
  const g=GOALS.find(x=>x[0]===P.b.goal);
  const cnt={good:0,warn:0,bad:0};tiles.forEach(t=>{if(cnt[t.st]!=null)cnt[t.st]++});
  const known=cnt.good+cnt.warn+cnt.bad,overall=!known?"none":cnt.bad>=2||(cnt.bad&&cnt.bad>=cnt.good)?"bad":cnt.bad||cnt.warn>cnt.good?"warn":"good";
  const head={good:"Op koers",warn:"Bijna op koers",bad:"Bijsturen nodig",none:"Nog te weinig gegevens"}[overall];
  let h=`<div class="seg seg2" style="margin-top:12px"><button class="segb" data-act="pg-days" data-v="7" aria-pressed="${days===7}">Afgelopen week</button><button class="segb" data-act="pg-days" data-v="28" aria-pressed="${days===28}">Afgelopen 4 weken</button></div>
    <div class="card overall ${ST[overall][1]}"><span class="ml">${g?`Doel: ${esc(g[1])}`:"Nog geen doel gekozen"}</span><b>${head}</b><span class="small">${cnt.good} goed · ${cnt.warn} let op · ${cnt.bad} bijsturen</span></div>
    <div class="ptiles">${tiles.map(t=>`<div class="ptile ${ST[t.st][1]}"><span class="ml">${t.l}</span><b>${t.v}</b><span class="small">${esc(t.sub)}</span><span class="pst">${ST[t.st][0]}</span></div>`).join("")}</div>`;
  h+=`<h2>Wat dit betekent</h2>`+(ins.length?`<div class="stack">${ins.map(i=>`<div class="card insight in-${i.st}"><p>${esc(i.t)}</p></div>`).join("")}</div>`:`<p class="small muted">Registreer je trainingen, voeding en gewicht, dan verschijnt hier wat goed gaat en waar je kunt bijsturen.</p>`);
  if(P.wt)h+=`<h2>Gewicht</h2><div class="card">${sparkline(P.wt.list)}<p class="small muted" style="margin:6px 0 0">${P.wt.n} metingen · trend ${P.wt.perWeek>=0?"+":"−"}${fmt1(Math.abs(P.wt.perWeek))} kg per week${P.b.targetWeight?` · doel ${fmt1(P.b.targetWeight)} kg`:""}</p></div>`;
  h+=`<h2>Voeding</h2>`+progressChart(P);
  h+=`<p class="small muted" style="margin-top:12px">Groen = goed, oranje = let op, rood = bijsturen. Dit is een automatische inschatting op basis van wat je hebt geregistreerd, geen medisch advies.</p>`;
  return h;
}

document.addEventListener("click",ev=>{const b=ev.target.closest("[data-act]");if(!b)return;
  if(b.dataset.act==="rec-tab"){UI.recTab=b.dataset.v;render()}
  else if(b.dataset.act==="pg-days"){UI.progDays=+b.dataset.v;render()}});
