/* ---------- sportschema op maat: meerdere sporten in één verantwoord weekplan ---------- */
const SC_F=[["kracht","Krachttraining"],["cali","Calisthenics"],["hiit","HIIT"]];
const DOW_S=["ma","di","wo","do","vr","za","zo"],DOW_L=["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"];
const SC_ENDU=["Hardlopen","Wielrennen","Zwemmen","Trailrunnen","Ultrarunnen"];
const SC_RUN=["Hardlopen","Trailrunnen","Ultrarunnen"];
const SC_TEAM=["Voetbal","Hockey","Handbal","Volleybal","Basketbal","Tennis","Padel"];
const SC_LIST=["Fitness","Hardlopen","Wielrennen","Zwemmen",...SC_TEAM,"Trailrunnen","Ultrarunnen"];
const SC_DEFN={Fitness:3,Hardlopen:2,Wielrennen:1,Zwemmen:1};
const SC_WEEKS=[1,2,4,6,8];
const SC_GAP=[[7,"Deze of vorige week"],[21,"2-4 weken geleden"],[60,"1-3 maanden geleden"],[120,"Langer dan 3 maanden"]];
const SC_MULTI={duo:{label:"Duathlon",need:["Hardlopen","Wielrennen"],dists:[["sprint","Sprint: 5 km lopen, 20 km fietsen, 2,5 km lopen",{Hardlopen:5,Wielrennen:20}],["std","Standaard: 10 km lopen, 40 km fietsen, 5 km lopen",{Hardlopen:10,Wielrennen:40}],["mid","Middellang: bijv. 10 km lopen, 60 km fietsen, 10 km lopen",{Hardlopen:10,Wielrennen:60}],["long","Lang: bijv. 10 km lopen, 150 km fietsen, 30 km lopen",{Hardlopen:30,Wielrennen:150}]]},
  tri:{label:"Triathlon",need:["Zwemmen","Wielrennen","Hardlopen"],dists:[["ss","Supersprint: 400 m zwemmen, 10 km fietsen, 2,5 km lopen",{Zwemmen:0.4,Wielrennen:10,Hardlopen:2.5}],["sprint","Sprint: 750 m zwemmen, 20 km fietsen, 5 km lopen",{Zwemmen:0.75,Wielrennen:20,Hardlopen:5}],["od","Olympisch (kwart): 1,5 km zwemmen, 40 km fietsen, 10 km lopen",{Zwemmen:1.5,Wielrennen:40,Hardlopen:10}],["half","Halve: 1,9 km zwemmen, 90 km fietsen, 21,1 km lopen",{Zwemmen:1.9,Wielrennen:90,Hardlopen:21.1}],["full","Hele: 3,8 km zwemmen, 180 km fietsen, 42,2 km lopen",{Zwemmen:3.8,Wielrennen:180,Hardlopen:42.2}]]}};
const scKind=n=>n==="Fitness"?"f":SC_ENDU.includes(n)?"e":"t";
const scLabel=n=>n==="Wielrennen"?"Fietsen":n;
const scBaseSport=n=>SC_RUN.includes(n)?"Hardlopen":n;
const scVariant=n=>n==="Trailrunnen"?"trail":n==="Ultrarunnen"?"ultra":"";
const scSel=c=>c.order.filter(n=>c.sp[n]&&c.sp[n].n>0);
const scEndu=c=>scSel(c).filter(n=>scKind(n)==="e");
const scMultiOk=(c,t)=>!!SC_MULTI[t]&&SC_MULTI[t].need.every(n=>scEndu(c).includes(n));
const scMulti=c=>c.multi&&c.multi.type&&scMultiOk(c,c.multi.type)?c.multi:null;
function scGoal(c,n){const m=scMulti(c);if(m&&SC_MULTI[m.type].need.includes(n)){const d=(SC_MULTI[m.type].dists.find(x=>x[0]===m.dist)||SC_MULTI[m.type].dists[0])[2];return{goal:"wedstrijd",dist:n==="Zwemmen"?"":String(d[n]||""),race:m.race||"",multi:true}}
  const g=c.eg[n]||(c.eg[n]={goal:"fit",dist:"",race:""});return g}
const scNeedLong=(c,n)=>["afstand","wedstrijd"].includes(scGoal(c,n).goal);
const scHasRace=c=>scEndu(c).some(n=>scGoal(c,n).goal==="wedstrijd");
function scRaceWeeks(c){let m=0;for(const n of scEndu(c)){const g=scGoal(c,n);if(g.goal==="wedstrijd"&&g.race&&g.race>c.start)m=Math.max(m,Math.min(16,Math.ceil((daysBetween(c.start,g.race)+1)/7)))}return m}
function scDefaults(pre){
  const cd=coachDefaults(),sv=S.meta.scoach||{},es=S.meta.ecoach||{};
  const sp={};(sv.sports||[]).forEach(x=>{sp[x.name]={n:x.n,days:x.days||[]}});
  if(!Object.keys(sp).length){if(pre!=="e")sp.Fitness={n:3,days:[]};if(pre!=="f")sp[es.sport||"Hardlopen"]={n:2,days:[]}}
  const avail=sv.avail||DOW_S.map(()=>({on:true,from:"",to:""}));
  return{sp,order:Object.keys(sp),custom:sv.custom||[],f:{likes:(cd.likes||[]).filter(x=>x!=="cardio").length?(cd.likes||[]).filter(x=>x!=="cardio"):["kracht"],goal:cd.goal||"fit",min:cd.min||"",equip:cd.equip||[],focus:cd.focus||[],seed:0},
    eg:sv.eg||(es.sport?{[es.sport]:{goal:es.goal||"fit",dist:es.dist||"",race:""}}:{}),multi:sv.multi?{...sv.multi,race:""}:{type:"",dist:"sprint",race:""},longOn:sv.longOn!=null?sv.longOn:true,longSport:sv.longSport||"",longDay:sv.longDay??5,
    dbl:sv.dbl||"nodig",basis:{},inj:(cd.inj||[]).filter(i=>INJ.some(x=>x[0]===i)),injTxt:"",wish:"",level:sv.level||cd.level||"",weeks:SC_WEEKS.includes(sv.weeks)?sv.weeks:4,start:addDays(weekStart(today()),7),avail,result:null};
}
function scExtraLong(c){if(!c.longOn)return null;const o=scEndu(c).filter(n=>!scNeedLong(c,n));if(o.includes(c.longSport))return c.longSport;return o.length<scEndu(c).length?null:o[0]||null}
function scPrimary(c){const e=scEndu(c);return e.includes(c.longSport)?c.longSport:e.find(n=>scNeedLong(c,n))||e[0]||null}
function scBasis(c,n){return c.basis[n]||(c.basis[n]={manual:false,rows:null,freq:null,gap:null,newbie:false,longest:""})}
function scInj(c){const set=new Set(c.inj);const t=(c.injTxt||"").toLowerCase();for(const [w,k] of INJ_WORDS)if(t.includes(w))set.add(k);return [...set]}
function scMin(it,c){if(it.k==="s")return +(c.f.min||60);if(it.k==="t")return 90;return Math.max(20,Math.round(it.x.min||45))}
function winLen(w){if(!w||!w.from||!w.to)return null;const [a,b]=w.from.split(":").map(Number),[x,y]=w.to.split(":").map(Number);const m=(x*60+y)-(a*60+b);return m>0?m:null}
function overlap(a,b){if(a==="light"||b==="light"||a==="hiit"||b==="hiit")return false;if(a==="full"||b==="full")return true;return a===b}
function clsOf(key){return/^FB/.test(key)?"full":/^UP/.test(key)?"upper":/^LO|LEGS/.test(key)?"legs":key==="PUSH"?"push":key==="PULL"?"pull":key==="HIIT"?"hiit":"light"}
const legsy=a=>a&&((a.k==="s"&&(a.cls==="full"||a.cls==="legs"||a.cls==="hiit"))||a.k==="t");
const hardC=a=>a&&a.k==="c"&&a.hard;
const hardish=a=>a&&(hardC(a)||a.k==="t"||(a.k==="s"&&a.cls==="hiit"));
/* kosten van twee trainingen op opeenvolgende dagen */
function scPair(a,b){let p=0;
  if(a.k==="s"&&b.k==="s")p+=overlap(a.cls,b.cls)?10:0.5;
  if(legsy(a)&&hardC(b))p+=5;
  if(legsy(a)&&b.k==="c"&&b.race)p+=6;
  if(a.k==="c"&&(a.long||a.race)&&legsy(b))p+=3;
  if(a.k==="c"&&b.k==="c"){if(a.run&&b.run)p+=4+(a.hard||b.hard?4:0);else p+=1+(a.hard&&b.hard?2:0)}
  if(hardish(a)&&hardish(b))p+=4;
  return p}
/* kosten van twee trainingen op dezelfde dag */
function scSame(a,b){let p=0;
  if(a.k==="s"&&b.k==="s")p+=10;
  if(a.run&&b.run)p+=8;
  if((legsy(a)&&hardC(b))||(legsy(b)&&hardC(a)))p+=4;
  if(hardish(a)&&hardish(b))p+=5;
  if(a.race||b.race)p+=8;
  return p}
const SC_DBLPEN={nee:40,nodig:7,ja:2};
function scCost(days,c,ctx,sev){
  let cost=0,streak=0,severe=0;const dp=SC_DBLPEN[c.dbl||"nodig"];
  for(let d=0;d<7;d++){const A=days[d]||[],B=days[(d+1)%7]||[],wrap=d===6?0.5:1;
    if(A.length){streak++;if(streak>=3)cost+=2;if(streak>=5)cost+=3;
      for(const a of A)if(a.k==="c"&&a.long&&c.longDay!=null&&c.longDay>=0&&d!==c.longDay)cost+=4;
      const wl=ctx.win[d],tm=A.reduce((t,a)=>t+scMin(a,c),0);if(wl&&tm>wl+5){cost+=8;severe++}
      const pref=ctx.pref[d]||[];for(const a of A)if(pref.length&&!pref.includes(a.sp))cost+=6;for(const s of pref)if(!A.some(a=>a.sp===s))cost+=6;
      if(A.length>1){const forced=A.every(a=>a.only&&a.only.length===1&&a.only[0]===d);cost+=(forced?0:dp)+scSame(A[0],A[1]);if(scSame(A[0],A[1])>=5)severe++}}
    else{streak=0;cost+=(ctx.pref[d]||[]).length*6}
    for(const a of A)for(const b of B){const p=scPair(a,b);if(p>=5&&d<6)severe++;cost+=p*wrap}}
  return sev?severe:cost;
}
/* exact: hooguit 1 training per dag */
function scExact(items,c,ctx,allowed){
  const n=items.length,days=[...Array(7)].map(()=>[]),used=Array(n).fill(false);let best=null,bestCost=Infinity;
  if(n>allowed.length)return null;
  const rec=(fi,placed)=>{
    if(placed===n){const cst=scCost(days,c,ctx);if(cst<bestCost-1e-9){bestCost=cst;best=days.map(x=>x.slice())}return}
    if(fi>=allowed.length||allowed.length-fi<n-placed)return;
    const d=allowed[fi];rec(fi+1,placed);const seen=new Set();
    for(let i=0;i<n;i++){if(used[i])continue;const it=items[i];if(it.only&&!it.only.includes(d))continue;if(seen.has(it.sig))continue;seen.add(it.sig);used[i]=true;days[d]=[it];rec(fi+1,placed+1);days[d]=[];used[i]=false}
  };
  rec(0,0);return best?{days:best,cost:bestCost}:null;
}
/* lokaal zoeken: ook 2 trainingen per dag */
function scLocal(items,c,ctx,allowed){
  const ok=(it,d)=>allowed.includes(d)&&(!it.only||it.only.includes(d));
  if(items.some(it=>![0,1,2,3,4,5,6].some(d=>ok(it,d))))return null;
  let seed=items.length*7919+allowed.length;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  let best=null,bestCost=Infinity;
  for(let r=0;r<40;r++){
    const days=[...Array(7)].map(()=>[]),order=items.map((_,i)=>i).sort((a,b)=>((items[b].only?1:0)-(items[a].only?1:0))||rnd()-0.5);
    let fail=false;
    for(const i of order){const it=items[i];let bd=-1,bc=Infinity;
      for(const d of [0,1,2,3,4,5,6]){if(!ok(it,d)||days[d].length>=2)continue;days[d].push(it);const cst=scCost(days,c,ctx)+rnd()*0.01;days[d].pop();if(cst<bc){bc=cst;bd=d}}
      if(bd<0){fail=true;break}days[bd].push(it)}
    if(fail)continue;
    let cur=scCost(days,c,ctx),improved=true,guard=0;
    while(improved&&guard++<60){improved=false;
      for(let d=0;d<7;d++)for(let j=0;j<days[d].length;j++){const it=days[d][j];
        for(let e=0;e<7;e++){if(e===d||!ok(it,e))continue;
          if(days[e].length<2){days[d].splice(j,1);days[e].push(it);const cst=scCost(days,c,ctx);if(cst<cur-1e-9){cur=cst;improved=true;break}days[e].pop();days[d].splice(j,0,it)}
          else for(let k=0;k<days[e].length;k++){const o=days[e][k];if(!ok(o,d))continue;days[d][j]=o;days[e][k]=it;const cst=scCost(days,c,ctx);if(cst<cur-1e-9){cur=cst;improved=true;break}days[d][j]=it;days[e][k]=o}
          if(improved)break}
        if(improved)break}}
    if(cur<bestCost){bestCost=cur;best=days.map(x=>x.slice())}}
  return best?{days:best,cost:bestCost}:null;
}
function scForcedDouble(items){const m={};for(const it of items)if(it.only&&it.only.length===1){m[it.only[0]]=(m[it.only[0]]||0)+1}return Object.values(m).some(v=>v>1)}
function scPlace(items,c,ctx,allowed){
  const mode=c.dbl||"nodig",forced=scForcedDouble(items);
  if(mode==="ja"){const L=scLocal(items,c,ctx,allowed),E=!forced&&items.length<=allowed.length?scExact(items,c,ctx,allowed):null;return E&&(!L||E.cost<=L.cost)?E:L}
  if(!forced&&items.length<=allowed.length){const E=scExact(items,c,ctx,allowed);if(E)return E}
  if(mode==="nee"&&!forced)return null;
  return scLocal(items,c,ctx,allowed);
}
/* waarschuwingen voor één week, ook na eigen aanpassingen */
function scWeekWarn(wk,c){
  const out=[],ds=wk.days;
  for(let d=0;d<7;d++){const A=ds[d].its,B=d<6?ds[d+1].its:[];
    if(A.length&&!(wk.allowed||[0,1,2,3,4,5,6]).includes(d))out.push(`Op ${DOW_L[d]} had je aangegeven niet te kunnen.`);
    if(A.length>1)out.push(`Op ${DOW_L[d]} staan ${A.length} trainingen${scSame(A[0],A[1])>=5?"; die combinatie is zwaar, dus houd er één rustig":""}. Doe de belangrijkste eerst en eet goed tussendoor.`);
    const wl=winLen(c.avail[d]),tm=A.reduce((t,a)=>t+scMin(a,c),0);if(wl&&tm>wl+5)out.push(`Op ${DOW_L[d]} heb je ${wl} min, maar de training${A.length>1?"en duren":" duurt"} ± ${tm} min.`);
    for(const a of A)for(const b of B){const n1=DOW_L[d],n2=DOW_L[d+1];
      if(a.k==="s"&&b.k==="s"&&overlap(a.cls,b.cls))out.push(`Op ${n1} en ${n2} train je dezelfde spiergroepen; die krijgen dan geen herstel.`);
      else if(legsy(a)&&hardC(b))out.push(`${a.k==="t"?scLabel(a.sp):"Een beendag"} op ${n1} vlak voor een zware duurtraining op ${n2}.`);
      else if(a.run&&b.run)out.push(`Twee dagen achter elkaar hardlopen (${n1} en ${n2}); dat verhoogt de kans op blessures.`);
      else if(hardish(a)&&hardish(b))out.push(`Twee zware trainingen achter elkaar (${n1} en ${n2}).`)}}
  return [...new Set(out)];
}
function scBuild(c){
  const sel=scSel(c),warn=[],why=[],inj=scInj(c),prim=scPrimary(c);
  const allowed=[0,1,2,3,4,5,6].filter(d=>c.avail[d].on!==false);
  const total=sel.reduce((t,n)=>t+c.sp[n].n,0),cap=(c.dbl||"nodig")==="nee"?1:2;
  if(!total)return{error:"Kies minstens één sport met een aantal per week."};
  if(total>allowed.length*cap)return{error:cap===1?`Je wilt ${total} trainingen per week, maar je kunt maar op ${allowed.length} dagen trainen. Kies minder trainingen, meer dagen, of sta 2 trainingen op één dag toe.`:`Je wilt ${total} trainingen per week; dat past zelfs met 2 per dag niet in ${allowed.length} dagen.`};
  for(const n of sel){const bad=(c.sp[n].days||[]).filter(d=>!allowed.includes(d));if(bad.length)return{error:`${scLabel(n)} staat op ${bad.map(d=>DOW_L[d]).join(" en ")}, maar daar heb je aangegeven niet te kunnen. Pas de vaste dagen of je beschikbaarheid aan.`}}
  const nF=c.sp.Fitness&&c.sp.Fitness.n||0;
  const fc={...c.f,level:c.level,days:nF,likes:c.f.likes.length?c.f.likes:["kracht"],inj,wish:c.wish,csport:""};
  const F=nF?buildPlan(fc):null;
  const raceW=scRaceWeeks(c),full=raceW||+c.weeks||4,show=c.weeks==="race"&&raceW?raceW:Math.min(full,+c.weeks||full);
  const E={};
  const mul=scMulti(c),ecOf=(n,wks)=>{const b=scBasis(c,n),g=scGoal(c,n),race=g.goal==="wedstrijd"&&!wks;return ecBuild({sport:scBaseSport(n),variant:scVariant(n),goal:race?"wedstrijd":g.goal==="wedstrijd"?"afstand":g.goal,days:c.sp[n].n,weeks:wks||full,level:c.level,dist:g.dist,race:race?g.race:"",start:c.start,manual:b.manual,rows:b.rows,freq:b.freq,gap:b.gap,newbie:b.newbie,longest:b.longest})};
  for(const n of scEndu(c)){E[n]=ecOf(n);if(E[n].weeks<full&&scGoal(c,n).goal!=="wedstrijd")E[n]=ecOf(n,full)}
  const xl=scExtraLong(c),keepLong=n=>scNeedLong(c,n)||n===xl;
  const forced=scEndu(c).filter(n=>scNeedLong(c,n));
  if(!c.longOn&&forced.length)why.push(`Voor je doel bij ${forced.map(n=>scLabel(n).toLowerCase()).join(" en ")} is een lange training nodig; die blijft daarom in het schema.`);
  if(mul)why.unshift(`Je traint voor een ${SC_MULTI[mul.type].label.toLowerCase()} (${(SC_MULTI[mul.type].dists.find(x=>x[0]===mul.dist)||SC_MULTI[mul.type].dists[0])[1].replace(/^[^:]*: /,"")}) op ${dateTxt(mul.race)}. Elke sport bouwt op naar die afstand, met vanaf week 2 koppeltrainingen (direct lopen na het fietsen) en een rustigere laatste week.`);
  if(raceW&&show<raceW)why.unshift(`Je ziet de eerste ${show} ${show===1?"week":"weken"} van je schema naar je wedstrijd (${raceW} weken). Maak daarna een nieuw schema; de coach gebruikt dan je nieuwe trainingen als basis.`);
  const runInj=inj.filter(i=>INJ_RUN.includes(i)),runs=scEndu(c).filter(n=>SC_RUN.includes(n));
  if(runInj.length&&runs.length)warn.push(`Je hebt klachten die door hardlopen erger kunnen worden (${runInj.map(i=>(INJ.find(x=>x[0]===i)||[,i])[1].toLowerCase()).join(", ")}). Het hardlopen start daarom 20% rustiger en zonder snelle trainingen in de eerste 2 weken. Doet het pijn tijdens of na het lopen, stop dan en overleg met een fysiotherapeut. Fietsen of zwemmen belast minder.`);
  if(c.injTxt&&c.injTxt.trim())why.push(`Je gaf aan: "${c.injTxt.trim()}". De coach houdt rekening met wat hij herkent; overleg bij twijfel met een fysiotherapeut of je arts.`);
  const pref=[...Array(7)].map(()=>[]);for(const n of sel)for(const d of (c.sp[n].days||[]))pref[d].push(n);
  if(pref.some(p=>p.length>1))warn.push(`Je hebt ${pref.map((p,d)=>p.length>1?DOW_L[d]:"").filter(Boolean).join(" en ")} voor meer dan één sport gekozen. Dat kan; de coach zet dan 2 trainingen op die dag. Houd er rekening mee dat dat zwaar is.`);
  const ctx={win:c.avail.map(w=>winLen(w)),pref};
  const fItems=F?F.week.map((x,i)=>x.t==="c"?null:{k:"s",sp:"Fitness",r:x.r,cls:clsOf(x.r.key),sig:"s"+x.r.key+i}).filter(Boolean):[];
  const out=[];let sevMax=0,dblUsed=false;const tooLong=new Set();
  for(let w=0;w<show;w++){
    const ws=addDays(c.start,w*7),items=fItems.map(x=>({...x}));let raceDay=null;
    for(const n of scEndu(c)){const wk=E[n].plan[w];if(!wk)continue;
      for(let s of wk.sessions){s={...s};
        if(s.type==="long"&&!keepLong(n)){s.type="easy";s.title="Rustige duurtraining";s.km=s.km?+(s.km*0.6).toFixed(1):s.km;s.min=Math.round((s.min||45)*0.6);s.note="Zone 2: je kunt nog praten."}
        if(SC_RUN.includes(n)&&runInj.length){if(w<2&&(s.type==="interval"||s.type==="tempo")){s.type="easy";s.title="Rustige duurtraining";s.note="Rustig, je kunt nog praten. Geen snelle stukken zolang je klachten hebt."}if(s.km)s.km=+(s.km*0.8).toFixed(1);if(s.min)s.min=Math.round(s.min*0.8)}
        if(mul&&n==="Wielrennen"&&s.type==="long"&&w>0&&!E[n].plan[w].rec&&!E[n].plan[w].taper)s.note=(s.note||"")+" Koppeltraining: loop direct na het fietsen 10-20 min rustig; zo went je lijf aan de wissel.";
        const it={k:"c",sp:n,x:s,run:SC_RUN.includes(n),hard:["interval","tempo","long","race"].includes(s.type),long:s.type==="long",race:s.type==="race",sig:"c"+n+s.type};
        if(s.type==="race"){const d=daysBetween(ws,s.date);if(d>=0&&d<7){raceDay=d;it.only=[d]}}
        items.push(it)}}
    if(mul){const rs=items.filter(i=>i.race);if(rs.length){const D=SC_MULTI[mul.type],dd=(D.dists.find(x=>x[0]===mul.dist)||D.dists[0]);rs.forEach(r=>items.splice(items.indexOf(r),1));
      items.push({k:"c",sp:D.label,x:{type:"race",title:`wedstrijd (${dd[1].split(":")[0].toLowerCase()})`,date:mul.race,km:null,min:120,note:"Succes! Start rustig, eet en drink op de fiets, en loop je eigen tempo. "+dd[1].replace(/^[^:]*: /,"")+"."},hard:true,race:true,long:false,run:false,only:[raceDay],sig:"race"})}}
    for(const n of sel.filter(n=>scKind(n)==="t"))for(let i=0;i<c.sp[n].n;i++)items.push({k:"t",sp:n,name:n,sig:"t"+n});
    for(const n of sel){const fd=c.sp[n].days||[];const its=items.filter(i=>i.sp===n&&!i.race);if(fd.length&&fd.length>=its.length){its.forEach(i=>{i.only=fd});if(fd.length===its.length)its.forEach((i,k)=>{i.only=[fd[k]]})}else if(fd.length)its.slice(0,fd.length).forEach((i,k)=>{i.only=[fd[k]]})}
    const allowW=raceDay!=null?allowed.filter(d=>d<=raceDay):allowed;
    const wk=scWeek({week:w+1,ws,items,allowed:allowW,raceDay},c,ctx);
    if(!wk.days){warn.push(`Week ${w+1} kon niet worden ingedeeld.`);continue}
    if(wk.dropped)warn.push(`In week ${w+1} paste niet alles; ${wk.dropped} rustige training${wk.dropped>1?"en zijn":" is"} weggelaten.`);
    sevMax=Math.max(sevMax,wk.sev);if(wk.days.some(x=>x.its.length>1))dblUsed=true;
    wk.days.forEach(({d,its})=>{const wl=ctx.win[d],tm=its.reduce((t,a)=>t+scMin(a,c),0);if(its.length&&wl&&tm>wl+5)tooLong.add(`${DOW_L[d]} (${wl} min, training ± ${tm} min)`)});
    const pw=prim&&E[prim].plan[w],rec=pw?pw.rec:(full>=4&&(w+1)%4===0),taper=pw?pw.taper:false;
    wk.rec=rec;wk.taper=taper;wk.prog=scProg(c,F,w,rec,taper);
    wk.tot=scTot(wk,c);
    out.push(wk);
  }
  why.unshift(`Je week: ${sel.map(n=>`${c.sp[n].n}× ${scLabel(n).toLowerCase()}`).join(", ")}${allowed.length<7?`, op ${allowed.map(d=>DOW_S[d]).join(", ")}`:""}.`);
  if(F)why.push(...coachExplain(fc,F).filter(t=>!/^Een week van/.test(t)));
  for(const n of scEndu(c)){why.push(...E[n].why.filter(t=>!/Het plan bouwt hooguit/.test(t)).map(t=>scEndu(c).length>1?`${scLabel(n)}: ${t.charAt(0).toLowerCase()+t.slice(1)}`:t));warn.push(...E[n].warn.filter(t=>!/krachttraining uit je profiel/.test(t)))}
  if(scEndu(c).length)why.push("Duurtrainingen bouwen hooguit ± 10% per week op, met regelmatig een rustigere week. 80% van de duurtrainingen is rustig.");
  const rules=["nooit twee dagen achter elkaar dezelfde spiergroepen"];
  if(runs.length)rules.push("tussen hardlooptrainingen zit waar mogelijk een dag zonder hardlopen");
  if(scEndu(c).length&&(F||sel.some(n=>scKind(n)==="t")))rules.push("geen beendag, full body of wedstrijd vlak voor een lange of zware duurtraining");
  if(sel.some(n=>scKind(n)==="t"))rules.push("je teamsport staat op je vaste dagen en zware trainingen staan er niet direct naast");
  rules.push("niet meer dan 2 à 3 trainingsdagen achter elkaar");
  why.push("Zo is je week ingedeeld: "+rules.join("; ")+". Tik op een training om hem te verplaatsen of weg te halen.");
  if(dblUsed)why.push("Op sommige dagen staan 2 trainingen. Doe de belangrijkste eerst, houd de tweede rustig en eet goed tussendoor.");
  if(tooLong.size){warn.push(`Niet elke training past in de tijd die je hebt: ${[...tooLong].slice(0,3).join(", ")}. Maak die training korter, kies een kortere trainingsduur of geef meer tijd op.`);sevMax-=tooLong.size}
  if(sevMax>0)warn.push("Door je keuzes (vaste dagen, beschikbare tijd of het aantal trainingen) kon niet alles ideaal worden ingedeeld. Houd trainingen die direct na elkaar staan wat rustiger.");
  if(total>=7&&allowed.length===7)warn.push("Je traint elke dag. Plan minstens 1 rustdag; herstel is nodig om sterker en fitter te worden.");
  if(F)why.push("Progressie: bij elke krachttraining zie je in de app wat je vorige keer deed en een doel voor vandaag: eerst 1 herhaling meer per set, en haal je overal de bovenkant van de reeks, dan gaat het gewicht omhoog. HIIT wordt elke week iets zwaarder (meer werk, minder rust of een ronde extra).");
  if(scEndu(c).length)why.push("Duurtraining wordt elke week iets langer, en tempo- en intervaltrainingen worden stap voor stap zwaarder (een paar minuten of een herhaling extra).");
  why.push("Na elke training vraagt de app hoe het ging, en aan het eind van de week volgt een korte weekcheck. Zo stuurt het schema zichzelf bij.");
  return{weeks:out,F,E,why,warn,nF,score:F?F.score:null};
}
function scTot(wk,c){return scEndu(c).map(n=>{const its=wk.days.flatMap(x=>x.its).filter(i=>i.k==="c"&&i.sp===n&&!i.race);if(!its.length)return"";const km=its.reduce((t,i)=>t+(i.x.km||0),0),mn=its.reduce((t,i)=>t+(i.x.min||0),0);return `${scLabel(n)} ${km&&n!=="Zwemmen"?fmt1(km)+" km":durTxt(mn)}`}).filter(Boolean)}
function scWeek(wk,c,ctx){
  let items=wk.items,sch=scPlace(items,c,ctx,wk.allowed),dropped=0;
  if(!sch){const pr=i=>i.race?-1:i.k==="t"?0:i.k==="c"?(i.hard?1:3):2,cap=(c.dbl||"nodig")==="nee"?1:2;
    const keep=items.slice().sort((x,y)=>pr(x)-pr(y)).slice(0,wk.allowed.length*cap);keep.forEach(i=>{if(i.only&&!i.race)delete i.only});sch=scPlace(keep,c,ctx,wk.allowed);dropped=items.length-keep.length;if(sch)items=keep}
  wk.dropped=dropped;wk.items=items;
  if(!sch){wk.days=null;return wk}
  wk.sev=scCost(sch.days,c,ctx,true);
  wk.days=sch.days.map((its,d)=>({d,date:addDays(wk.ws,d),its,time:c.avail[d].from||""}));
  return wk;
}
const SC_HIIT=[[30,30,3],[30,30,4],[35,25,4],[40,20,4],[40,20,5],[45,15,5],[45,15,6]];
function scProg(c,F,w,rec,taper){
  const L=new Set(c.f.likes),cali=L.has("cali")&&!L.has("kracht");
  const step=Math.min(SC_HIIT.length-1,Math.max(0,w-Math.floor((w+1)/4))),[wk,rs,rn]=SC_HIIT[step],rr=rec||taper?Math.max(2,rn-1):rn;
  const hiit=`Week ${w+1}: ${rr} rondes, ${wk} s werk en ${rs} s rust per oefening${rec||taper?" (rustigere week)":""}.`;
  const str=rec?`Week ${w+1} · rustigere week: zelfde gewichten als vorige week, 1 set minder per oefening, en stop 2-3 herhalingen voor het falen. Zo herstel je en word je daarna sterker.`
    :taper?`Week ${w+1} · laatste week voor je wedstrijd: zelfde gewichten, de helft van de sets. Geen zware beentraining in de laatste 4 dagen.`
    :w===0?`Week 1: kies per oefening een gewicht waarmee je de reeks haalt met nog 1-2 herhalingen over. De app onthoudt alles.`
    :`Week ${w+1}: probeer per oefening 1 herhaling meer per set dan vorige keer${cali?", of een zwaardere variant":""}. Haal je bij alle sets de bovenkant van de reeks? Dan ${cali?"een moeilijkere variant of extra gewicht":"gewicht omhoog (+2,5 kg, kleine oefeningen +1-2 kg)"} en weer onderaan beginnen.`;
  return{str,hiit};
}
function scChip(path,opts,multi){const [g,k]=path.split("."),o=k?UI.sc[g]:UI.sc,key=k||g;
  return `<div class="chips">${opts.map(([v,l])=>`<button class="chipb" data-act="sc-set" data-k="${path}" data-v="${v}" data-m="${multi?1:""}" aria-pressed="${multi?(o[key]||[]).includes(v):String(o[key])===String(v)}">${esc(l)}</button>`).join("")}</div>`}
function viewSportCoach(){
  const c=UI.sc;
  if(c.result)return viewSportResult();
  const sel=scSel(c),endu=scEndu(c),P=ecProfile(),total=sel.reduce((t,n)=>t+c.sp[n].n,0),all=[...SC_LIST,...c.custom].filter(n=>spScOk(n)||(c.sp[n]&&c.sp[n].n>0)),raceW=scRaceWeeks(c);
  if(c.weeks==="race"&&!raceW)c.weeks=4;
  let h=`<div class="wohead"><div class="title">Sportschema op maat</div><button class="linkbtn" data-act="sc-close">Annuleren</button></div>
    <p class="hp small muted" style="margin-top:8px">Kies de sporten die je wilt doen en hoe vaak. De coach maakt een verantwoord weekplan dat zo goed mogelijk bij je wensen en agenda past, met genoeg herstel.</p>
    <h2>Wat wil je doen?</h2><div class="card stack"><div class="chips">${all.map(n=>`<button class="chipb" data-act="sc-sport" data-v="${esc(n)}" aria-pressed="${!!(c.sp[n]&&c.sp[n].n>0)}">${esc(scLabel(n))}</button>`).join("")}</div>
      ${spOn("other")?`<div class="codeinput"><input type="text" id="sc-other" placeholder="Andere sport, bijv. squash of boksen" autocomplete="off"><button class="btn" data-act="sc-addsport">Toevoegen</button></div>`:""}</div>
    <h2>Voor hoeveel weken?</h2><div class="card stack"><div class="chips">${SC_WEEKS.map(v=>`<button class="chipb" data-act="sc-set" data-k="weeks" data-v="${v}" aria-pressed="${String(c.weeks)===String(v)}">${v===1?"1 week":v+" weken"}</button>`).join("")}${raceW?`<button class="chipb" data-act="sc-set" data-k="weeks" data-v="race" aria-pressed="${c.weeks==="race"}">Tot de wedstrijd (${raceW} wk)</button>`:""}</div>
      <p class="small muted" style="margin:0">${raceW&&c.weeks!=="race"?`Je krijgt de eerste ${c.weeks===1?"week":c.weeks+" weken"} van je wedstrijdschema; daarna maak je een nieuw schema met je nieuwe trainingen als basis.`:"Na afloop maak je eenvoudig een nieuw schema; de coach gebruikt dan je nieuwe trainingen als basis."}</p></div>`+scRaceCard(c);
  if(sel.length)h+=`<h2>Verdeling per week · ${total} training${total===1?"":"en"}</h2><div class="stack">${sel.map(n=>{const s=c.sp[n];return `<div class="card stack sprow"><div class="sphead"><b>${esc(scLabel(n))}</b><span class="stepper"><button class="ib" data-act="sc-n" data-v="${esc(n)}" data-d="-1" aria-label="Minder ${esc(n)}">−</button><b>${s.n}×</b><button class="ib" data-act="sc-n" data-v="${esc(n)}" data-d="1" aria-label="Meer ${esc(n)}">+</button></span></div>
      <div class="f sub">Vaste dagen <i>optioneel${scKind(n)==="t"?", bijv. je trainingen en wedstrijd":""}</i><div class="chips">${DOW_S.map((l,d)=>`<button class="chipb" data-act="sc-day" data-v="${esc(n)}" data-d="${d}" aria-pressed="${(s.days||[]).includes(d)}">${l}</button>`).join("")}</div></div></div>`}).join("")}</div>
    <div class="card stack" style="margin-top:10px"><div class="f">Mag de coach 2 trainingen op één dag zetten?${scChip("dbl",[["nee","Nee"],["nodig","Alleen als het anders niet past"],["ja","Ja, dat vind ik prima"]])}</div></div>`;
  if(c.sp.Fitness&&c.sp.Fitness.n){h+=`<h2>Fitness</h2><div class="card stack"><div class="f">Soort <i>meerdere mogelijk</i>${scChip("f.likes",spFitTypes(),true)}</div><div class="f">Wat wil je bereiken?${scChip("f.goal",CGOALS)}</div>
      <div class="f">Hoe lang mag een training duren?${scChip("f.min",[30,45,60,75,90].map(v=>[v,v+" min"]))}</div>
      <div class="f">Welk materiaal heb je? <i>eigen gewicht kan altijd</i>${scChip("f.equip",EQUIP,true)}</div>
      <div class="f">Extra aandacht voor <i>maximaal 2</i>${scChip("f.focus",FOCUS.map(x=>[x[0],x[1]]),true)}</div></div>`}
  if(endu.length){const mts=Object.keys(SC_MULTI).filter(t=>scMultiOk(c,t)),mul=scMulti(c),opts=endu.filter(n=>!scNeedLong(c,n)),xl=scExtraLong(c);
    h+=`<h2>Duursport: je doel</h2><div class="card stack">`;
    if(mts.length)h+=`<div class="f">Train je voor een multisportwedstrijd?<div class="chips"><button class="chipb" data-act="sc-mt" data-v="" aria-pressed="${!mul}">Nee</button>${mts.map(t=>`<button class="chipb" data-act="sc-mt" data-v="${t}" aria-pressed="${!!mul&&mul.type===t}">${SC_MULTI[t].label}</button>`).join("")}</div></div>`;
    if(mul)h+=`<div class="f sub">Welke afstand?<div class="chips">${SC_MULTI[mul.type].dists.map(([v,l])=>`<button class="chipb" data-act="sc-md" data-v="${v}" aria-pressed="${mul.dist===v}">${esc(l)}</button>`).join("")}</div></div>
      <label class="f">Datum wedstrijd<input type="date" id="sc-mrace" value="${esc(mul.race||"")}"></label>`;
    endu.forEach(n=>{if(mul&&SC_MULTI[mul.type].need.includes(n))return;const g=scGoal(c,n),id=SC_ENDU.indexOf(n);
      h+=`<div class="f">${esc(scLabel(n))}: wat wil je bereiken?<div class="chips">${EGOAL.map(([v,l])=>`<button class="chipb" data-act="sc-eg" data-v="${esc(n)}" data-d="${v}" aria-pressed="${g.goal===v}">${esc(l)}</button>`).join("")}</div></div>
        ${(g.goal==="afstand"||g.goal==="wedstrijd")&&n!=="Zwemmen"?`<label class="f sub">Afstand ${esc(scLabel(n).toLowerCase())}<input type="text" inputmode="decimal" id="sc-dist-${id}" value="${esc(g.dist||"")}" placeholder="${n==="Wielrennen"?"km, bijv. 60 of 100":n==="Ultrarunnen"?"km, bijv. 50 of 100":"km, bijv. 10 of 21,1"}"></label>`:""}
        ${(g.goal==="afstand"||g.goal==="wedstrijd")&&n==="Zwemmen"?`<p class="small muted" style="margin:0">Zwemmen bouwt op in minuten aan één stuk; zo kun je steeds langer achter elkaar zwemmen.</p>`:""}
        ${g.goal==="wedstrijd"?`<label class="f sub">Datum wedstrijd ${esc(scLabel(n).toLowerCase())}<input type="date" id="sc-race-${id}" value="${esc(g.race||"")}"></label>`:""}`});
    h+=opts.length?`<label class="check"><input type="checkbox" id="sc-longon" ${c.longOn?"checked":""}><span>Extra lange duurtraining in het schema${opts.length<endu.length?` <span class="small muted">(bij ${endu.filter(n=>!opts.includes(n)).map(n=>scLabel(n).toLowerCase()).join(" en ")} zit die er al in door je doel)</span>`:""}</span></label>
      ${c.longOn?`${opts.length>1||opts.length<endu.length?`<div class="f sub">Voor welke sport?${xl?"":` <i>kies er een</i>`}<div class="chips">${opts.map(n=>`<button class="chipb" data-act="sc-set" data-k="longSport" data-v="${esc(n)}" aria-pressed="${xl===n}">${esc(scLabel(n))}</button>`).join("")}</div></div>`:`<p class="small muted" style="margin:0">Voor ${esc(scLabel(opts[0]).toLowerCase())}.</p>`}`:""}`
      :`<p class="small muted" style="margin:0">Door je doel${endu.length>1?"en":""} zit er bij ${endu.map(n=>scLabel(n).toLowerCase()).join(" en ")} al een lange training in.</p>`;
    h+=(c.longOn&&opts.length)||opts.length<endu.length?`<div class="f sub">Lange training bij voorkeur op${scChip("longDay",[[5,"zaterdag"],[6,"zondag"],[-1,"maakt niet uit"]])}</div>`:"";
    h+=`</div>`;
    for(const n of endu){const b=scBasis(c,n),B=ecBase({sport:scBaseSport(n)}),useApp=B.fromApp&&!b.manual,id=SC_ENDU.indexOf(n),bs=scBaseSport(n);
      h+=`<h2>Je basis: ${esc(scLabel(n).toLowerCase())} <span class="small muted">· belangrijk om blessures te voorkomen</span></h2><div class="card stack">`;
      if(useApp)h+=`<p class="hp" style="margin:0">Uit je logboek${bs!==n?" (hardlopen)":""}:</p>${B.last3.map(s=>`<div class="fline"><span class="fq">${s.km?fmt1(s.km)+" km":""}</span><span class="fn">${esc(dateTxt(s.date))} · ${durTxt(s.min)}${s.km&&bs==="Hardlopen"?" · "+paceTxt(s.min,s.km):""}</span></div>`).join("")}<span class="small muted">Langste training laatste 3 maanden: <b>${fmt1(B.longest)} km</b> · laatste 4 weken ± ${B.freq}× per week${B.gap!=null&&B.gap>21?` · laatste training ${B.gap} dagen geleden, dus de coach start rustiger`:""}</span><button class="linkbtn" data-act="sc-manual" data-v="${esc(n)}">Klopt niet? Zelf invullen</button>`;
      else{const rows=b.rows||(b.rows=[{},{},{}]);
        h+=`<label class="check"><input type="checkbox" id="sc-new-${id}" ${b.newbie?"checked":""}><span>Ik ben (bijna) nieuw in deze sport</span></label>`;
        if(!b.newbie)h+=`<p class="hp" style="margin:0">${B.last3.length?"Er staan nog te weinig trainingen in je logboek.":"Er staat nog niets in je logboek."} Vul je laatste 3 trainingen in, ook als die al even geleden zijn:</p>
        ${rows.map((r,i)=>`<div class="grid2"><label class="f sub">Training ${i+1} · km<input type="text" inputmode="decimal" id="sc-km-${id}-${i}" value="${esc(r.km||"")}" placeholder="km"></label><label class="f sub">minuten<input type="text" inputmode="numeric" id="sc-min-${id}-${i}" value="${esc(r.min||"")}" placeholder="min"></label></div>`).join("")}
        <label class="f">Langste training in de laatste 3 maanden<input type="text" inputmode="decimal" id="sc-long-${id}" value="${esc(b.longest||"")}" placeholder="km (0 als je niet hebt getraind)"></label>
        <div class="f">Hoe vaak doe je dit nu per week?<div class="chips">${[0,1,2,3,4,5,6].map(v=>`<button class="chipb" data-act="sc-freq" data-v="${esc(n)}" data-d="${v}" aria-pressed="${b.freq===v}">${v===0?"0 (nu niet)":v}</button>`).join("")}</div></div>
        <div class="f">Wanneer was je laatste training?<div class="chips">${SC_GAP.map(([v,l])=>`<button class="chipb" data-act="sc-gap" data-v="${esc(n)}" data-d="${v}" aria-pressed="${b.gap===v}">${esc(l)}</button>`).join("")}</div></div>`;
        if(B.fromApp)h+=`<button class="linkbtn" data-act="sc-manual" data-v="${esc(n)}">← Toch mijn logboek gebruiken</button>`}
      h+=`</div>`}}
  h+=`<h2>Wanneer kun je trainen? <span class="small muted">· optioneel</span></h2><div class="card stack"><p class="hp small muted" style="margin:0">Vink dagen uit waarop je niet kunt. Vul eventueel in van hoe laat tot hoe laat je tijd hebt; dan komt dat tijdstip ook in je planning en agenda. Is één week anders? Dat pas je straks per week aan.</p>
    ${DOW_S.map((l,d)=>{const w=c.avail[d];return `<div class="availrow"><label class="check"><input type="checkbox" id="sc-av-${d}" ${w.on!==false?"checked":""}><span>${DOW_L[d]}</span></label>${w.on!==false?`<input type="time" id="sc-from-${d}" value="${esc(w.from||"")}" aria-label="Van, ${DOW_L[d]}"><span class="small muted">tot</span><input type="time" id="sc-to-${d}" value="${esc(w.to||"")}" aria-label="Tot, ${DOW_L[d]}">`:`<span class="small muted">geen training</span>`}</div>`}).join("")}</div>
  <h2>Blessures of klachten</h2><div class="card stack">${scChip("inj",INJ,true)}<label class="f">Iets anders? <i>optioneel</i><input type="text" id="sc-injtxt" value="${esc(c.injTxt||"")}" placeholder="Bijv. last van mijn rechter hamstring" autocomplete="off"></label></div>
  <h2>Algemeen</h2><div class="card stack">
    <div class="f">Je niveau${scChip("level",[["beg","Beginner"],["int","Gemiddeld"],["adv","Gevorderd"]])}</div>
    <label class="f">Start op <i>een maandag</i><input type="date" id="sc-start" value="${esc(c.start)}"></label>
    <label class="f">Nog wensen? <i>optioneel</i><textarea id="sc-wish" rows="3" autocomplete="off" autocorrect="on" name="sc-wensen" placeholder="Bijv. ik wil sterker worden op bankdrukken en deadlifts, liever geen squats met halter, en sterkere billen.">${esc(c.wish||"")}</textarea></label></div>
  <h2>Uit je profiel</h2><div class="card"><ul class="hl small">
      <li>${P.w?`Gewicht ${fmt1(P.w)} kg${P.bmi?` · BMI ${fmt1(P.bmi)}`:""}`:"Nog geen gewicht"}${P.age?` · ${P.age} jaar`:""}</li>
      <li>Voedingsdoel: ${esc((GOALS.find(g=>g[0]===P.goal)||[,"nog niet gekozen"])[1])}${P.kcal?` · ${nl(r10(P.kcal))} kcal per dag`:""}</li>
      <li>Dagelijkse beweging: ${esc(P.work||"niet ingevuld")}${P.steps?` · ± ${nl(P.steps)} stappen`:""}</li></ul>
      <p class="small muted" style="margin:6px 0 0">Klopt dit niet? Pas het aan bij <button class="linkbtn inl" data-act="go-profile">Profiel</button>.</p></div>
    <button class="btn primary block" style="margin-top:14px" data-act="sc-make">Maak mijn sportschema</button>`;
  return h;
}
function scItemTxt(it){if(it.k==="s")return[it.r.name.replace(/^Dag \d+ · /,""),it.cls==="hiit"?"HIIT":"Fitness"];if(it.k==="t")return[it.name,"Teamsport"];const x=it.x;return[`${scLabel(it.sp)}: ${x.title.charAt(0).toLowerCase()+x.title.slice(1)}`,`${x.km?fmt1(x.km)+" km":x.min?durTxt(x.min):""}`]}
function viewSportResult(){
  const c=UI.sc,R=c.result;
  let h=`<div class="wohead"><div class="title">Jouw sportschema</div><button class="linkbtn" data-act="sc-back">← Aanpassen</button></div>`;
  if(R.warn.length)h+=`<div class="stack" style="margin-top:10px">${R.warn.map(w=>`<div class="card insight in-warn"><p>${esc(w)}</p></div>`).join("")}</div>`;
  h+=`<div class="card" style="margin-top:10px"><ul class="hl">${R.why.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`;
  R.weeks.forEach((wk,wi)=>{const ww=scWeekWarn(wk,c);
    h+=`<h2>Week ${wk.week}${wk.rec?" · rustigere week":wk.taper?" · taperen":""}${wk.edited?" · aangepast":""}</h2>${wk.tot&&wk.tot.length||R.F?`<p class="small muted" style="margin:-4px 0 8px">${[wk.tot&&wk.tot.length?"Duur: "+wk.tot.join(" · "):"",R.F?esc((t=>t.charAt(0).toUpperCase()+t.slice(1))(wk.prog.str.replace(/^Week \d+( · [^:]*)?: ?/,""))):""].filter(Boolean).join("<br>")}</p>`:""}
    ${ww.length&&wk.edited?`<div class="card insight in-warn" style="margin-bottom:8px"><p><b>Let op:</b> ${ww.map(esc).join(" ")} Je kunt het zo laten; jij beslist.</p></div>`:""}
    <div class="recgroup">${wk.days.map(({d,its,time})=>its.length?its.map((it,i)=>{const [t,sub]=scItemTxt(it);return `<button class="row scrow" data-act="sc-it" data-w="${wi}" data-d="${d}" data-i="${i}"><span class="n"><span class="dw">${i?"":DOW_S[d]}</span> ${time&&!i?`<b class="ptime">${esc(time)}</b> `:""}${esc(t)}</span><span class="b none">${esc(sub)}</span>${it.k==="c"?`<span class="l">${esc(it.x.note||"")}</span>`:""}</button>`}).join(""):`<div class="row scrow rest" style="cursor:default"><span class="n"><span class="dw">${DOW_S[d]}</span> Rust</span></div>`).join("")}</div>
    <button class="linkbtn" data-act="sc-wav" data-w="${wi}" style="margin-top:6px">Andere beschikbaarheid deze week</button>`});
  if(R.F)h+=`<h2>Je fitnessschema's</h2>`+R.F.routines.map(r=>`<details class="privdet" style="margin-bottom:8px"><summary>${esc(r.name)}</summary>${r.items.map(it=>`<div class="fline"><span class="fq">${esc(it.sets)} × ${esc(it.reps)}</span><span class="fn">${esc(it.name)}</span><span class="fm">${esc(it.note)}</span></div>`).join("")}</details>`).join("");
  h+=`<div class="card stack" style="margin-top:14px"><button class="btn primary" data-act="sc-save">Zet in mijn planning${R.F?" en maak de map":""}</button>${R.F?`<button class="btn" data-act="sc-again">Andere oefeningen kiezen</button>`:""}<p class="small muted" style="margin:0">Voel je pijn die niet binnen een dag weg is, sla dan een training over. Dit schema volgt algemene trainingsrichtlijnen en is geen persoonlijk advies van een trainer, fysiotherapeut of arts.</p></div>`;
  return h;
}
EXTRA_SHEETS["sc-move"]=function(sh){
  const c=UI.sc,wk=c&&c.result&&c.result.weeks[sh.w];if(!wk)return"";const it=wk.days[sh.d].its[sh.i];if(!it)return"";const [t]=scItemTxt(it);
  return `<div class="sh"><h2>${esc(t)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><p class="hp" style="margin:0">Week ${wk.week} · nu op ${DOW_L[sh.d]}. Naar welke dag wil je deze training verplaatsen?</p>
    <div class="chips">${DOW_S.map((l,d)=>`<button class="chipb" data-act="sc-mv" data-d="${d}" aria-pressed="${d===sh.d}">${l}${wk.days[d].its.length&&d!==sh.d?" •":""}</button>`).join("")}</div>
    <p class="small muted" style="margin:0">• = daar staat al een training. Dat kan; de coach laat zien waar je op moet letten.</p>
    <button class="btn ghost danger" data-act="sc-rm">Deze training weghalen</button></div>`;
};
EXTRA_SHEETS["sc-wav"]=function(sh){
  const c=UI.sc,wk=c&&c.result&&c.result.weeks[sh.w];if(!wk)return"";const al=sh.al;
  return `<div class="sh"><h2>Week ${wk.week} anders</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><p class="hp" style="margin:0">Op welke dagen kun je in deze week (${esc(dateTxt(wk.ws))} – ${esc(dateTxt(addDays(wk.ws,6)))}) trainen? De coach deelt alleen deze week opnieuw in.</p>
    <div class="chips">${DOW_S.map((l,d)=>`<button class="chipb" data-act="sc-wd" data-d="${d}" aria-pressed="${al.includes(d)}">${l}</button>`).join("")}</div>
    <button class="btn primary" data-act="sc-wgo">Deze week opnieuw indelen</button></div>`;
};
function scRead(){const c=UI.sc,g=id=>document.getElementById(id);if(!c)return;
  SC_ENDU.forEach((n,id)=>{const e=c.eg[n];if(!e)return;if(g("sc-dist-"+id))e.dist=g("sc-dist-"+id).value;if(g("sc-race-"+id))e.race=g("sc-race-"+id).value});if(g("sc-mrace"))c.multi.race=g("sc-mrace").value;if(g("sc-start")&&g("sc-start").value)c.start=weekStart(g("sc-start").value);
  if(g("sc-wish"))c.wish=g("sc-wish").value;if(g("sc-injtxt"))c.injTxt=g("sc-injtxt").value;if(g("sc-longon"))c.longOn=g("sc-longon").checked;
  for(let d=0;d<7;d++){const w=c.avail[d];if(g("sc-av-"+d))w.on=g("sc-av-"+d).checked;if(g("sc-from-"+d))w.from=g("sc-from-"+d).value;if(g("sc-to-"+d))w.to=g("sc-to-"+d).value}
  SC_ENDU.forEach((n,id)=>{const b=c.basis[n];if(!b)return;if(g(`sc-long-${id}`))b.longest=g(`sc-long-${id}`).value;if(g(`sc-new-${id}`))b.newbie=g(`sc-new-${id}`).checked;
    if(b.rows)b.rows.forEach((r,i)=>{if(g(`sc-km-${id}-${i}`))r.km=g(`sc-km-${id}-${i}`).value;if(g(`sc-min-${id}-${i}`))r.min=g(`sc-min-${id}-${i}`).value})})}
async function scSave(){
  const c=UI.sc,R=c.result,stem=uid(),jobs=[];let fid=null,idOf=new Map();
  if(R.F){const L=c.f.likes.map(l=>({kracht:"kracht",cali:"calisthenics",hiit:"HIIT"})[l]).join(" + ");
    let nm=`Sportschema · ${R.nF}× ${L}`;if(folderList().some(f=>norm(f.name)===norm(nm)))nm+=` (${dateTxt(today())})`;
    fid="fd-"+uid();await put("folders",fid,{name:nm.slice(0,60),order:folderList().length});UI.open["f:"+fid]=true;lsSet(LS_OPEN,UI.open);
    const ids=await addRoutinesTo(R.F.routines.map(r=>({name:r.name,items:r.items})),fid);R.F.routines.forEach((r,i)=>idOf.set(r.name,ids[i]))}
  R.weeks.forEach(wk=>wk.days.forEach(({date,its,time,d})=>its.forEach((it,j)=>{const i=d*2+j,tm=time&&!j&&!(it.k==="c"&&it.race)?{time}:{},base={own:true,date,...tm,scp:stem,scw:wk.week,updated:Date.now()};
    if(it.k==="s"){const rid=idOf.get(it.r.name);if(rid)jobs.push(["plan",stem+"s"+wk.week+"_"+i,{type:"routine",routineId:rid,routineName:it.r.name,...base,note:(it.cls==="hiit"?wk.prog.hiit:wk.prog.str)||"",prog:{week:wk.week,rec:!!wk.rec,taper:!!wk.taper,hiit:it.cls==="hiit"}}])}
    else if(it.k==="t")jobs.push(["plan",stem+"t"+wk.week+"_"+i,{type:"other",title:it.name,...base}]);
    else{const s=it.x,sport=["Hardlopen","Wielrennen"].includes(scBaseSport(it.sp))?scBaseSport(it.sp):"Anders",lbl=sport==="Anders"||scBaseSport(it.sp)!==it.sp?scLabel(it.sp)+": ":"";
      jobs.push(["plan",stem+"c"+wk.week+"_"+i,{type:"cardio",sport,title:lbl+s.title,km:s.km||null,durMin:s.min||null,note:s.note,purpose:s.type==="long"?"Lange duur":s.type==="easy"?"Rustige duur":s.type==="tempo"?"Tempo":s.type==="interval"?"Interval":s.type==="race"?"Wedstrijd":"",qual:s.type,...base}])}})));
  await runJobs(jobs,put);
  await put("meta","scplan",{stem,start:c.start,weeks:R.weeks.length,at:Date.now(),checks:{}});
  await put("meta","scoach",{sports:scSel(c).map(n=>({name:n,n:c.sp[n].n,days:c.sp[n].days||[]})),custom:c.custom,weeks:c.weeks==="race"?4:c.weeks,level:c.level,avail:c.avail,dbl:c.dbl,longOn:c.longOn,longSport:c.longSport,longDay:c.longDay,eg:Object.fromEntries(Object.entries(c.eg).map(([k,v])=>[k,{goal:v.goal,dist:v.dist||"",race:""}])),multi:{type:c.multi.type,dist:c.multi.dist}});
  const prim=scPrimary(c);if(prim){const g=scGoal(c,prim);await put("meta","ecoach",{sport:scBaseSport(prim),goal:g.goal,dist:g.dist||"",level:c.level})}
  if(R.F)await put("meta","coach",{likes:c.f.likes,goal:c.f.goal,days:R.nF,level:c.level,min:c.f.min,equip:c.f.equip,focus:c.f.focus,inj:c.inj,csport:"",wish:""});
  UI.sc=null;UI.week=weekStart(c.start);UI.tab="plan";lsSet(LS_TAB,"plan");toastOk(`${jobs.length} trainingen ingepland${fid?" en map met schema's gemaakt":""}`);render();window.scrollTo(0,0);
}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;const act=b.dataset.act;if(!act.startsWith("sc-"))return;
  const c=UI.sc;
  switch(act){
    case "sc-open":UI.sc=scDefaults(b.dataset.v||"");UI.cg=null;UI.ec=null;UI.tab="plan";lsSet(LS_TAB,"plan");render();window.scrollTo(0,0);break;
    case "sc-close":UI.sc=null;render();window.scrollTo(0,0);break;
    case "sc-sport":{scRead();const n=b.dataset.v;if(c.sp[n]&&c.sp[n].n>0)c.sp[n].n=0;else{c.sp[n]={n:SC_DEFN[n]||1,days:(c.sp[n]&&c.sp[n].days)||[]};if(!c.order.includes(n))c.order.push(n)}render();break}
    case "sc-addsport":{scRead();const el=document.getElementById("sc-other");let n=(el?.value||"").trim();if(!n){toast("Vul de naam van de sport in.");return}n=n.charAt(0).toUpperCase()+n.slice(1).slice(0,30);
      if(!SC_LIST.includes(n)&&!c.custom.includes(n))c.custom.push(n);c.sp[n]={n:1,days:[]};if(!c.order.includes(n))c.order.push(n);render();break}
    case "sc-n":{scRead();const n=b.dataset.v,s=c.sp[n];s.n=Math.max(0,Math.min(7,s.n+(+b.dataset.d)));render();break}
    case "sc-day":{scRead();const n=b.dataset.v,d=+b.dataset.d,s=c.sp[n],a=s.days=s.days||[];const i=a.indexOf(d);if(i>=0)a.splice(i,1);else{const o=scSel(c).filter(m=>m!==n&&(c.sp[m].days||[]).includes(d));if(o.length)toast(`Op ${DOW_L[d]} staat ook ${o.map(m=>scLabel(m).toLowerCase()).join(" en ")}. Dat kan, maar 2 trainingen op één dag is zwaar.`);a.push(d);a.sort();if(a.length>s.n)s.n=a.length}render();break}
    case "sc-eg":{scRead();const g=c.eg[b.dataset.v]||(c.eg[b.dataset.v]={goal:"fit",dist:"",race:""});g.goal=b.dataset.d;render();break}
    case "sc-mt":scRead();c.multi.type=b.dataset.v;if(c.multi.type&&!SC_MULTI[c.multi.type].dists.some(x=>x[0]===c.multi.dist))c.multi.dist="sprint";render();break;
    case "sc-md":scRead();c.multi.dist=b.dataset.v;render();break;
    case "sc-freq":{scRead();scBasis(c,b.dataset.v).freq=+b.dataset.d;render();break}
    case "sc-gap":{scRead();scBasis(c,b.dataset.v).gap=+b.dataset.d;render();break}
    case "sc-manual":{scRead();const x=scBasis(c,b.dataset.v);x.manual=!x.manual;render();break}
    case "sc-set":{scRead();const path=b.dataset.k,[g,k]=path.split("."),o=k?c[g]:c,key=k||g,raw=b.dataset.v,v=/^-?\d+$/.test(raw)?+raw:raw;
      if(b.dataset.m){const a=o[key]=Array.isArray(o[key])?o[key]:[];const i=a.indexOf(v);if(i>=0)a.splice(i,1);else{if(key==="focus"&&a.length>=2)a.shift();a.push(v)}}
      else o[key]=o[key]===v&&(key==="level"||key==="min")?"":v;render();break}
    case "sc-make":{scRead();const sel=scSel(c);
      if(!sel.length){toast("Kies minstens één sport.");return}
      if(c.sp.Fitness&&c.sp.Fitness.n&&!c.f.likes.length){toast("Kies welke soort fitness je wilt doen.");return}
      for(const n of scEndu(c)){const b=scBasis(c,n),I=ecInput({sport:scBaseSport(n),manual:b.manual,rows:b.rows,freq:b.freq,gap:b.gap,longest:b.longest}),L=scLabel(n).toLowerCase();
        if(!b.newbie&&I.src==="hand"){if(I.last3.length<3){toast(`Vul je laatste 3 trainingen ${L} in (km en minuten), of vink aan dat je nieuw bent.`);return}if(!I.longest&&b.longest!=="0"){toast(`Vul je langste training ${L} van de laatste 3 maanden in (0 als je niet hebt getraind).`);return}if(b.freq==null){toast(`Kies hoe vaak je nu ${L} doet per week (0 kan ook).`);return}if(b.gap==null){toast(`Kies wanneer je laatste training ${L} was.`);return}}}
      const mul=scMulti(c);if(mul&&(!mul.race||mul.race<=c.start)){toast(`Kies een datum voor je ${SC_MULTI[mul.type].label.toLowerCase()} na de startdatum.`);return}
      if(mul&&daysBetween(c.start,mul.race)>16*7){toast("Je wedstrijd is meer dan 16 weken weg. Maak nu een plan van 8 weken met als doel \"een afstand kunnen\", en later een wedstrijdschema.");return}
      for(const n of scEndu(c)){const g=scGoal(c,n);if(g.multi)continue;
        if((g.goal==="afstand"||g.goal==="wedstrijd")&&n!=="Zwemmen"&&!(num(g.dist)>0)){toast(`Vul de afstand in die je wilt halen met ${scLabel(n).toLowerCase()}.`);return}
        if(g.goal==="wedstrijd"&&(!g.race||g.race<=c.start)){toast(`Kies een wedstrijddatum voor ${scLabel(n).toLowerCase()} na de startdatum.`);return}}
      const R=scBuild(c);if(R.error){toast(R.error);return}c.result=R;render();window.scrollTo(0,0);break}
    case "sc-again":c.f.seed=(c.f.seed||0)+1;c.result=scBuild(c);render();window.scrollTo(0,0);toast("Andere oefeningen gekozen");break;
    case "sc-back":c.result=null;render();window.scrollTo(0,0);break;
    case "sc-save":await scSave();break;
    case "sc-it":UI.sheet={type:"sc-move",w:+b.dataset.w,d:+b.dataset.d,i:+b.dataset.i};renderSheet();break;
    case "sc-mv":case "sc-rm":{const sh=UI.sheet,wk=c.result.weeks[sh.w],src=wk.days[sh.d].its,it=src[sh.i];if(!it)return;const to=+b.dataset.d;
      if(act==="sc-mv"){if(to===sh.d){UI.sheet=null;renderSheet();return}if(wk.days[to].its.length>=2){toast("Op die dag staan al 2 trainingen.");return}if(it.race){toast("Je wedstrijd staat vast op de wedstrijddag.");return}src.splice(sh.i,1);wk.days[to].its.push(it)}
      else src.splice(sh.i,1);
      wk.edited=true;wk.tot=scTot(wk,c);UI.sheet=null;renderSheet();const y=window.scrollY;render();window.scrollTo(0,y);const ww=scWeekWarn(wk,c);toast(ww.length?"Aangepast. Let op: "+ww[0]:"Aangepast");break}
    case "sc-wav":{const wk=c.result.weeks[+b.dataset.w];UI.sheet={type:"sc-wav",w:+b.dataset.w,al:(wk.allowed||[0,1,2,3,4,5,6]).slice()};renderSheet();break}
    case "sc-wd":{const al=UI.sheet.al,d=+b.dataset.d,i=al.indexOf(d);if(i>=0)al.splice(i,1);else{al.push(d);al.sort()}renderSheet();break}
    case "sc-wgo":{const sh=UI.sheet,wk=c.result.weeks[sh.w];if(!sh.al.length){toast("Kies minstens één dag.");return}
      const pref=[...Array(7)].map(()=>[]);for(const n of scSel(c))for(const d of (c.sp[n].days||[]))if(sh.al.includes(d))pref[d].push(n);
      const items=wk.days.flatMap(x=>x.its).map(i=>{const j={...i};if(j.only&&!j.race){j.only=j.only.filter(d=>sh.al.includes(d));if(!j.only.length)delete j.only}return j});
      const al=wk.raceDay!=null?sh.al.filter(d=>d<=wk.raceDay||d===wk.raceDay):sh.al;
      const nw=scWeek({...wk,items,allowed:wk.raceDay!=null&&!al.includes(wk.raceDay)?[...al,wk.raceDay].sort():al},c,{win:c.avail.map(w=>winLen(w)),pref});
      if(!nw.days){toast("Dit past niet in deze dagen. Kies meer dagen.");return}
      nw.tot=scTot(nw,c);c.result.weeks[sh.w]={...nw,edited:true};UI.sheet=null;renderSheet();const y=window.scrollY;render();window.scrollTo(0,y);toast(nw.dropped?`Week opnieuw ingedeeld; ${nw.dropped} rustige training${nw.dropped>1?"en":""} paste${nw.dropped>1?"n":""} niet.`:"Week opnieuw ingedeeld");break}
  }
});
document.addEventListener("change",ev=>{const id=ev.target.id||"";if(UI.sc&&(/^sc-av-\d$/.test(id)||/^sc-new-\d$/.test(id)||id==="sc-longon")){scRead();const y=window.scrollY;render();window.scrollTo(0,y)}});
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target.id==="sc-other"){ev.preventDefault();document.querySelector('[data-act="sc-addsport"]')?.click()}});

