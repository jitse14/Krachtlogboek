/* ---------- duurcoach: trainingsplan duursport op maat ---------- */
const ESPORT=[["Hardlopen","Hardlopen"],["Wielrennen","Fietsen"],["Zwemmen","Zwemmen"]];
const EGOAL=[["fit","Fitter worden"],["afstand","Een afstand kunnen"],["sneller","Sneller worden"],["wedstrijd","Wedstrijd op datum"]];
const EWEEKS=[1,2,4,8];
function ecSessions(sp){return cardioSessions(sp).filter(s=>s.durMin)}
function ecBase(c){
  const l=ecSessions(c.sport),since=addDays(today(),-91),last3=l.slice(0,3);
  let longest=Math.max(0,...l.filter(s=>s.date>=since).map(s=>s.km||0));
  for(const a of archList())if(a.month>=since.slice(0,7)){const x=a.cardio&&a.cardio[c.sport];if(x&&x.longest&&x.longest.km>longest)longest=x.longest.km}
  const n28=l.filter(s=>s.date>=addDays(today(),-27)).length;
  const gap=l.length?daysBetween(l[0].date,today()):null;
  return{fromApp:last3.length>=3&&longest>0,last3:last3.map(s=>({km:s.km||0,min:s.durMin,date:s.date})),longest,freq:n28?Math.max(1,Math.round(n28/4)):0,gap};
}
function ecInput(c){
  const b=ecBase(c);
  if(b.fromApp&&!c.manual)return{...b,src:"app"};
  const rows=(c.rows||[]).map(r=>({km:num(r.km)||0,min:num(r.min)||0})).filter(r=>r.min>0);
  return{last3:rows,longest:num(c.longest)||Math.max(0,...rows.map(r=>r.km)),freq:c.freq===""||c.freq==null?null:+c.freq,gap:c.gap==null||c.gap===""?null:+c.gap,src:"hand",fromApp:false};
}
function ecProfile(){
  const b=bodyMeta(),w=currentWeight(),n=nutrition(),other=Object.entries(b.sports||{}).filter(([,x])=>x&&x.n).map(([k,x])=>[(SPORTS.find(s=>s[0]===k)||[k,k])[1],x.n]);
  const bmi=w&&b.height?w/Math.pow(b.height/100,2):null;
  return{b,w,bmi,age:b.age,goal:b.goal,work:(WORK.find(x=>x[0]===b.work)||[])[1],steps:b.steps,other,strength:(b.sports&&b.sports.kracht&&b.sports.kracht.n)||0,kcal:n.miss?null:n.kcal};
}
const ROUND=(x,st)=>Math.max(st,Math.round(x/st)*st);
function ecBuild(c){
  const I=ecInput(c),P=ecProfile(),sp=c.sport,swim=sp==="Zwemmen",bike=sp==="Wielrennen",run=sp==="Hardlopen";
  const warn=[],why=[],weeks=c.goal==="wedstrijd"&&c.race?Math.max(1,Math.min(16,Math.ceil((daysBetween(c.start,c.race)+1)/7))):+c.weeks;
  const D=+c.days,newbie=c.newbie||I.last3.length===0;
  const fq=I.freq==null?Math.min(D,2):I.freq,gap=I.gap;
  let df=gap==null?1:gap<=14?1:gap<=28?0.85:gap<=90?0.7:0.55;if(fq===0)df=Math.min(df,0.75);
  const avgKm0=I.last3.length?I.last3.reduce((s,r)=>s+r.km,0)/I.last3.length:0,avgMin=I.last3.length?I.last3.reduce((s,r)=>s+r.min,0)/I.last3.length:20,avgKm=avgKm0*df;
  const pace=avgKm0?avgMin/avgKm0:(run?7:bike?3:2.5); // min per km (zwemmen: min per 100 m ~ als km*10)
  const freq=Math.max(1,fq);
  const stepKm=run?0.5:bike?5:0.1,stepMin=5;
  const maxLong={Hardlopen:c.variant==="ultra"?45:32,Wielrennen:180,Zwemmen:5}[sp];
  const recEvery=(P.age&&P.age>=50)||newbie?3:4;
  let start=avgKm*freq,long0=Math.min(I.longest||avgKm0,Math.max(avgKm0*1.3,(I.longest||0)*0.7));
  if(df<1&&!newbie){long0=Math.max(run?4:bike?20:0.4,long0*df);start=Math.max(start,(run?4:bike?20:0.4)*freq);why.push(`${fq===0?"Je doet deze sport nu niet":"Je laatste training is al even geleden"}${gap!=null&&gap>14?` (± ${gap>=60?Math.round(gap/30)+" maanden":Math.round(gap/7)+" weken"})`:""}. Je conditie en vooral je pezen en spieren zijn dan minder gewend. Het plan start daarom op ± ${Math.round(df*100)}% van je eerdere niveau en bouwt de eerste 3 weken extra rustig op.`)}
  if(P.b.work==="fysiek"){start*=0.9;why.push("Je hebt lichamelijk zwaar werk, daarom start het plan iets rustiger.")}
  if(D>fq)why.push(`Je traint nu ${fq===0?"niet":`± ${fq}× per week`} en wilt naar ${D}×. Het plan voegt de extra trainingen geleidelijk en kort toe, en je totale volume stijgt hooguit 20% per week.`);
  if(P.strength&&P.strength+D>6)warn.push(`Samen met ${P.strength}× krachttraining uit je profiel train je ${P.strength+D}× per week. Plan minstens 1 volledige rustdag en doe zware beendagen niet vlak voor een lange training.`);
  if(isCut(P.goal))why.push("Je voedingsdoel is afvallen of droogtrainen: de lange trainingen blijven rustig, en eet vóór en na een lange training gewoon koolhydraten.");
  if(isBulk(P.goal))why.push("Je voedingsdoel is een bulk: duurtraining kost extra energie. Tel je duurtrainingen mee in je sportweek bij Profiel, dan klopt je dagdoel.");
  if(run&&P.bmi&&P.bmi>=30){warn.push("Met je huidige gewicht is hardlopen zwaar voor je gewrichten. Het plan bouwt extra rustig op; fietsen of zwemmen is een goed alternatief.");}
  const target=c.goal==="afstand"||c.goal==="wedstrijd"?num(c.dist):null;
  const plan=[];let vol=start,long=long0,s0note="",prevTot=0;var easyKmW=0,qKmW=0;
  const DAYPOS={1:[5],2:[2,5],3:[1,3,5],4:[0,2,4,5],5:[0,1,3,4,5],6:[0,1,2,3,4,5]}[D];
  let qStep=0;
  for(let w=0;w<weeks;w++){
    const rec=w>0&&(w+1)%recEvery===0,taper=c.goal==="wedstrijd"&&w===weeks-1&&weeks>1;
    if(w>0&&!rec&&!taper)qStep++;
    const slow=df<1&&w<=3;
    if(w>0&&!rec&&!taper){vol=vol*(slow?1.05:1.08);long=Math.min(long*(slow?1.06:1.1),long+(run?(slow?1:1.5):bike?(slow?5:10):0.3),maxLong);if(target)long=Math.min(long,Math.max(target,long0))}
    let wVol=rec?vol*0.75:taper?vol*0.6:vol,wLong=rec?long*0.8:taper?long*0.6:long;
    const sessions=[];
    if(newbie&&!swim){
      const step=Math.min(8,1+Math.floor(w*0.75)),runMin=run?Math.min(10,1+step):0;
      for(let i=0;i<D;i++)sessions.push({type:"easy",title:run?`Wandelen en hardlopen: ${Math.min(8,4+step)}× (${runMin} min rennen, ${Math.max(1,3-Math.floor(step/3))} min wandelen)`:`Rustig fietsen`,min:run?Math.min(45,25+w*3):ROUND(30+w*5,stepMin),km:null,note:"Zo rustig dat je makkelijk kunt praten. Warm 5 minuten op met wandelen."});
    }else{
      const minS=run?3:bike?15:0.6,nBase=Math.max(1,I.freq==null?D:fq);
      const n=Math.min(D,nBase>=D?D:nBase+1+Math.floor(w/2));
      const q=n>=3&&c.level!=="beg"?(c.goal==="sneller"&&n>=4?2:1):(c.goal==="sneller"&&n>=2&&c.level!=="beg"?1:0),easyN=Math.max(0,n-1-q),f=rec?0.8:taper?0.6:1;
      const easyKm=Math.min(Math.max(minS,avgKm*0.7*Math.pow(1.04,w))*f,Math.max(minS,wLong*0.8)),qKm=Math.max(run?5:bike?25:0.8,avgKm*0.8*f);
      let eN=easyN,qN=q,eK=easyKm,qK=qKm;
      if(prevTot&&!rec&&!taper){const allow=Math.max(0,prevTot*1.2-wLong);
        while(eN+qN>0&&eN*eK+qN*qK>allow){const per=allow/(eN+qN);if(per>=minS){eK=Math.min(eK,per);qK=Math.min(qK,per);break}if(qN)qN--;else eN--}}
      for(let i=0;i<eN;i++)sessions.push({type:"easy"});
      for(let i=0;i<qN;i++)sessions.push({type:i===0&&(w%2===0||c.goal==="sneller")?"interval":"tempo"});
      sessions.push({type:"long"});
      var easyKmW=eK,qKmW=qK;
      for(const s of sessions){
        const km=s.type==="long"?wLong:s.type==="easy"?easyKmW:qKmW,k=Math.max(stepKm,Math.round(km/stepKm)*stepKm);
        const easyP=pace*(run?1.08:bike?1.06:1.05),tempoP=pace*0.93,intP=pace*0.88;
        const pTxt=p=>run?paceTxt(p,1).replace(" /km","")+" min/km":bike?fmt1(60/p)+" km/u":`${fmt1(p/10)} min per 100 m`;
        if(swim){const m=ROUND(km*pace,stepMin);Object.assign(s,{km:null,min:Math.max(20,m)})}
        else Object.assign(s,{km:+k.toFixed(1),min:Math.round(k*(s.type==="long"?easyP*1.03:s.type==="easy"?easyP:tempoP))});
        if(s.type==="easy")Object.assign(s,{title:"Rustige duurtraining",note:`Zone 2: je kunt nog praten.${avgKm&&!swim?` Richttempo ± ${pTxt(easyP)}.`:""}`});
        if(s.type==="long")Object.assign(s,{title:taper?"Korte, rustige training (taperen)":"Lange rustige training",note:`Rustig en gelijkmatig${avgKm&&!swim?`, ± ${pTxt(easyP*1.03)}`:""}. ${s.km>=(run?15:bike?80:3)?"Neem water en koolhydraten mee (30-60 g per uur).":"Drink voor en na voldoende."}`});
        const IN=run?"inlopen":bike?"rustig infietsen":"rustig inzwemmen",UIT=run?"uitlopen":bike?"rustig uitfietsen":"rustig uitzwemmen";
        if(s.type==="tempo")Object.assign(s,{title:"Tempotraining",note:`10 min ${IN}, dan ${Math.max(10,Math.min(Math.round(s.min*0.6/5)*5,10+5*Math.min(qStep,6)-(rec?5:0)))} min op tempo${avgKm&&!swim?` (± ${pTxt(tempoP)})`:""}: comfortabel zwaar${swim?"":", praten gaat in korte zinnen"}. 10 min ${UIT}.`});
        if(s.type==="interval"){const reps=(run?Math.min(10,4+Math.floor(qStep*0.75)):bike?Math.min(8,4+qStep):Math.min(12,6+qStep))-(rec?1:0),rep=run?"800 m":bike?"4 min":"100 m";
          Object.assign(s,{title:"Intervaltraining",note:`10-15 min ${IN}, dan ${reps}× ${rep} snel${avgKm&&!swim?` (± ${pTxt(intP)})`:""} met ${run?"2 min wandelen of dribbelen":bike?"3 min rustig fietsen":"30 s rust"} ertussen. 10 min ${UIT}.`})}
      }
    }
    if(c.variant)for(const s of sessions){if(!s.note)continue;if(c.variant==="trail")s.note+=" Trail: loop op tijd en gevoel, niet op tempo, en wandel steile klimmen.";if(c.variant==="ultra"&&(s.type==="long"||s.type==="easy"))s.note+=s.type==="long"?" Ultra: oefen eten en drinken onderweg (± 200-300 kcal per uur) en wandel de klimmen.":" Ultra: rustig, en loop waar het kan op onverhard."}
    // dagen: lange training op de laatste dag
    const order=[...sessions.filter(s=>s.type!=="long")],lng=sessions.find(s=>s.type==="long");
    const mix=[];const qs=order.filter(s=>s.type!=="easy"),es=order.filter(s=>s.type==="easy");
    while(qs.length||es.length){if(es.length)mix.push(es.shift());if(qs.length)mix.push(qs.shift())}
    if(lng)mix.push(lng);
    const ws=addDays(c.start,w*7);
    const POS={1:[5],2:[2,5],3:[1,3,5],4:[0,2,4,5],5:[0,1,3,4,5],6:[0,1,2,3,4,5]}[mix.length]||DAYPOS;
    mix.forEach((s,i)=>{s.date=addDays(ws,POS[i]??i)});
    if(c.goal==="wedstrijd"&&c.race&&w===weeks-1){const raceS={type:"race",title:`Wedstrijd${target?` ${fmt1(target)} km`:""}`,date:c.race,km:target,min:target&&!swim?Math.round(target*pace):null,note:"Succes! Rustig starten en je eigen tempo lopen."};
      const keep=mix.filter(s=>s.date<c.race);if(keep.length)keep[keep.length-1].title="Kort losmaken (20-30 min, met 3 versnellingen)",keep[keep.length-1].km=keep[keep.length-1].km&&+Math.min(keep[keep.length-1].km,run?5:20).toFixed(1);mix.length=0;mix.push(...keep,raceS)}
    const tot=mix.reduce((t,s)=>t+(s.km||(swim?(s.min||0)/pace:0)),0);if(!rec&&!taper)prevTot=tot;
    plan.push({week:w+1,rec,taper,sessions:mix,km:swim?0:tot,min:mix.reduce((t,s)=>t+(s.min||0),0)});
  }
  if(target&&!swim){const reach=plan.reduce((m,wk)=>Math.max(m,...wk.sessions.map(s=>s.type==="long"||s.type==="race"?s.km||0:0)),0);
    if(c.goal==="afstand"&&reach+0.05<target){const need=Math.ceil(Math.log(target/Math.max(long0,0.5))/Math.log(1.1)*recEvery/(recEvery-1))+1;warn.push(`Veilig opbouwen tot ${fmt1(target)} km past niet in ${weeks} ${weeks===1?"week":"weken"}: je komt tot ± ${fmt1(reach)} km. Reken op ± ${need} weken; het plan bouwt nooit sneller op dan 10% per week om blessures te voorkomen.`)}
    if(c.goal==="wedstrijd"&&long0<target*0.5&&run)warn.push(`Je langste training is ${fmt1(long0)} km. Voor ${fmt1(target)} km is dat weinig tijd; loop de wedstrijd rustig of kies een kortere afstand.`)}
  why.unshift(`Je basis: ${I.last3.length?`gemiddeld ${!swim&&avgKm?fmt1(avgKm)+" km in ":""}${Math.round(avgMin)} min per training`:"nieuw in deze sport"}${I.longest&&!swim?`, langste ${fmt1(I.longest)} km in de laatste 3 maanden`:""}${freq?`, ± ${freq}× per week`:""} (${I.src==="app"?"uit je logboek":"zelf ingevuld"}).`);
  if(c.variant==="ultra"&&target>42)warn.push("Voor een ultra is meestal 16-24 weken opbouw nodig, met in het weekend lange duurlopen op twee dagen achter elkaar. Dit schema bouwt veilig op; plan je wedstrijd ruim vooruit.");
  if(s0note)why.push(s0note);
  why.push(`Het plan bouwt hooguit ± 10% per week op, met elke ${recEvery}e week een rustigere week. 80% van je trainingen is rustig; dat is de veiligste en snelste manier om beter te worden.`);
  return{plan,why,warn,weeks,I,P};
}
function viewEnduranceCoach(){
  const c=UI.ec;
  if(c.result){const R=c.result,t=today();
    let h=`<div class="wohead"><div class="title">Jouw ${esc(c.sport==="Wielrennen"?"fiets":c.sport.toLowerCase())}plan</div><button class="linkbtn" data-act="ec-back">← Aanpassen</button></div>`;
    if(R.warn.length)h+=`<div class="stack" style="margin-top:10px">${R.warn.map(w=>`<div class="card insight in-warn"><p>${esc(w)}</p></div>`).join("")}</div>`;
    h+=`<div class="card" style="margin-top:10px"><ul class="hl">${R.why.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`;
    for(const wk of R.plan)h+=`<h2>Week ${wk.week}${wk.rec?" · rustigere week":wk.taper?" · taperen":""} <span class="small muted">${wk.km?fmt1(wk.km)+" km · ":""}${durTxt(wk.min)}</span></h2><div class="recgroup">${wk.sessions.map(s=>`<div class="row" style="cursor:default"><span class="n">${esc(s.title)}</span><span class="b none">${s.km?fmt1(s.km)+" km":s.min?durTxt(s.min):""}</span><span class="l">${esc(dayName(s.date))}${s.km&&s.min?` · ± ${durTxt(s.min)}`:""} · ${esc(s.note)}</span></div>`).join("")}</div>`;
    h+=`<div class="card stack" style="margin-top:14px"><button class="btn primary" data-act="ec-save">Zet in mijn planning</button><p class="small muted" style="margin:0">Voel je pijn die niet binnen een dag weg is, sla dan een training over en bouw daarna rustiger op. Dit plan volgt algemene trainingsrichtlijnen en is geen persoonlijk advies van een trainer of arts.</p></div>`;
    return h;}
  const B=ecBase(c),P=ecProfile(),chips=(k,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="chipb" data-act="ec-set" data-k="${k}" data-v="${v}" aria-pressed="${String(c[k])===String(v)}">${esc(l)}</button>`).join("")}</div>`;
  const useApp=B.fromApp&&!c.manual;
  let h=`<div class="wohead"><div class="title">Sportschema op maat</div><button class="linkbtn" data-act="ec-close">Annuleren</button></div>
    <div class="card stack" style="margin-top:10px">
      <div class="f">Welke sport?${chips("sport",ESPORT)}</div>
      <div class="f">Wat wil je bereiken?${chips("goal",EGOAL)}</div>
      ${c.goal==="afstand"||c.goal==="wedstrijd"?`<label class="f">Afstand<input type="text" inputmode="decimal" id="ec-dist" value="${esc(c.dist||"")}" placeholder="km, bijv. 10 of 21,1"></label>`:""}
      ${c.goal==="wedstrijd"?`<label class="f">Datum wedstrijd<input type="date" id="ec-race" value="${esc(c.race||"")}"></label>`:`<div class="f">Hoe lang moet het plan zijn?${chips("weeks",EWEEKS.map(v=>[v,v===1?"1 week":v+" weken"]))}</div>`}
      <div class="f">Hoeveel trainingen per week?${chips("days",[2,3,4,5,6].map(v=>[v,String(v)]))}</div>
      <div class="f">Je niveau${chips("level",[["beg","Beginner"],["int","Gemiddeld"],["adv","Gevorderd"]])}</div>
      <label class="f">Start op<input type="date" id="ec-start" value="${esc(c.start)}"></label>
    </div>
    <h2>Je basis <span class="small muted">· belangrijk om blessures te voorkomen</span></h2><div class="card stack">`;
  if(useApp)h+=`<p class="hp" style="margin:0">Uit je logboek:</p>${B.last3.map(s=>`<div class="fline"><span class="fq">${s.km?fmt1(s.km)+" km":""}</span><span class="fn">${esc(dateTxt(s.date))} · ${durTxt(s.min)}${s.km&&c.sport==="Hardlopen"?" · "+paceTxt(s.min,s.km):""}</span></div>`).join("")}<span class="small muted">Langste training laatste 3 maanden: <b>${fmt1(B.longest)} km</b> · nu ± ${B.freq}× per week</span><button class="linkbtn" data-act="ec-manual">Klopt niet? Zelf invullen</button>`;
  else{const rows=c.rows||(c.rows=[{},{},{}]);
    h+=`<p class="hp" style="margin:0">${B.last3.length?"Er staan nog te weinig trainingen in je logboek.":"Er staat nog niets in je logboek."} Vul je laatste 3 trainingen in, zodat het plan aansluit bij wat je nu kunt:</p>
      ${rows.map((r,i)=>`<div class="grid2"><label class="f sub">Training ${i+1} · km<input type="text" inputmode="decimal" id="ec-km-${i}" value="${esc(r.km||"")}" placeholder="${c.sport==="Zwemmen"?"bijv. 1,5":"km"}"></label><label class="f sub">minuten<input type="text" inputmode="numeric" id="ec-min-${i}" value="${esc(r.min||"")}" placeholder="min"></label></div>`).join("")}
      <label class="f">Langste training in de laatste 3 maanden<input type="text" inputmode="decimal" id="ec-long" value="${esc(c.longest||"")}" placeholder="km"></label>
      <div class="f">Hoe vaak train je nu per week?${chips("freq",[1,2,3,4,5,6].map(v=>[v,String(v)]))}</div>
      <label class="check"><input type="checkbox" id="ec-new" ${c.newbie?"checked":""}><span>Ik ben (bijna) nieuw in deze sport</span></label>
      ${B.fromApp?`<button class="linkbtn" data-act="ec-manual">← Toch mijn logboek gebruiken</button>`:""}`}
  h+=`</div><h2>Uit je profiel</h2><div class="card"><ul class="hl small">
      <li>${P.w?`Gewicht ${fmt1(P.w)} kg${P.bmi?` · BMI ${fmt1(P.bmi)}`:""}`:"Nog geen gewicht"}${P.age?` · ${P.age} jaar`:""}</li>
      <li>Voedingsdoel: ${esc((GOALS.find(g=>g[0]===P.goal)||[,"nog niet gekozen"])[1])}${P.kcal?` · ${nl(r10(P.kcal))} kcal per dag`:""}</li>
      <li>Dagelijkse beweging: ${esc(P.work||"niet ingevuld")}${P.steps?` · ± ${nl(P.steps)} stappen`:""}</li>
      <li>Sporten per week: ${P.other.length?P.other.map(([n,x])=>`${esc(n)} ${x}×`).join(", "):"niet ingevuld"}</li></ul>
      <p class="small muted" style="margin:6px 0 0">Klopt dit niet? Pas het aan bij <button class="linkbtn inl" data-act="go-profile">Profiel</button>.</p></div>
    <button class="btn primary block" style="margin-top:14px" data-act="ec-make">Maak mijn plan</button>`;
  return h;
}
function ecRead(){const c=UI.ec,g=id=>document.getElementById(id);
  if(g("ec-dist"))c.dist=g("ec-dist").value;if(g("ec-race"))c.race=g("ec-race").value;if(g("ec-start"))c.start=g("ec-start").value||c.start;
  if(g("ec-long"))c.longest=g("ec-long").value;if(g("ec-new"))c.newbie=g("ec-new").checked;
  if(c.rows)c.rows.forEach((r,i)=>{if(g("ec-km-"+i))r.km=g("ec-km-"+i).value;if(g("ec-min-"+i))r.min=g("ec-min-"+i).value})}
async function ecSave(){
  const R=UI.ec.result,c=UI.ec,stem=uid(),jobs=[];
  R.plan.forEach(wk=>wk.sessions.forEach((s,i)=>{const sport=["Hardlopen","Wielrennen"].includes(c.sport)?c.sport:"Anders";
    jobs.push(["plan",stem+"e"+wk.week+"_"+i,{type:"cardio",sport,title:(c.sport==="Zwemmen"?"Zwemmen: ":"")+s.title,km:s.km||null,durMin:s.min||null,note:s.note,purpose:s.type==="long"?"Lange duur":s.type==="easy"?"Rustige duur":s.type==="tempo"?"Tempo":s.type==="interval"?"Interval":s.type==="race"?"Wedstrijd":"",own:true,date:s.date,updated:Date.now()}])}));
  await runJobs(jobs,put);await put("meta","ecoach",{sport:c.sport,goal:c.goal,days:c.days,weeks:c.weeks,level:c.level,dist:c.dist||""});
  UI.ec=null;UI.week=weekStart(c.start);toastOk(`${jobs.length} trainingen ingepland`);render();window.scrollTo(0,0);
}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;const act=b.dataset.act;if(!act.startsWith("ec-"))return;
  const c=UI.ec;
  switch(act){
    case "ec-open":{const s=S.meta.ecoach||{};UI.ec={sport:s.sport||"Hardlopen",goal:s.goal||"fit",days:s.days||3,weeks:s.weeks||4,level:s.level||"",dist:s.dist||"",race:"",start:addDays(weekStart(today()),7),manual:false,rows:null,freq:0,newbie:false,longest:""};UI.tab="plan";lsSet(LS_TAB,"plan");render();window.scrollTo(0,0);break}
    case "ec-close":UI.ec=null;render();window.scrollTo(0,0);break;
    case "ec-set":{ecRead();const k=b.dataset.k,raw=b.dataset.v,v=/^\d+$/.test(raw)?+raw:raw;c[k]=c[k]===v&&k==="level"?"":v;if(k==="sport"){c.rows=null;c.manual=false}render();break}
    case "ec-manual":ecRead();c.manual=!c.manual;render();break;
    case "ec-make":{ecRead();const I=ecInput(c);
      if(c.goal!=="wedstrijd"&&!c.weeks){toast("Kies hoe lang het plan moet zijn.");return}
      if((c.goal==="afstand"||c.goal==="wedstrijd")&&!(num(c.dist)>0)&&c.sport!=="Zwemmen"){toast("Vul de afstand in die je wilt halen.");return}
      if(c.goal==="wedstrijd"&&(!c.race||c.race<=c.start)){toast("Kies een wedstrijddatum na de startdatum.");return}
      if(!c.newbie&&I.src==="hand"){if(I.last3.length<3){toast("Vul je laatste 3 trainingen in (km en minuten), of vink aan dat je nieuw bent in deze sport.");return}if(!I.longest){toast("Vul je langste training van de laatste 3 maanden in.");return}if(!I.freq){toast("Kies hoe vaak je nu per week traint.");return}}
      c.result=ecBuild(c);render();window.scrollTo(0,0);break}
    case "ec-back":c.result=null;render();window.scrollTo(0,0);break;
    case "ec-save":await ecSave();break;
  }
});

