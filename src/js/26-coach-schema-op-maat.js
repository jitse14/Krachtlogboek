/* ---------- coach: schema op maat ---------- */
/* oefening: [naam, spiergroep, slots, materiaal(g=sportschool,d=dumbbells,b=eigen gewicht,p=stang,r=ringen), vermijden bij(k=knie,o=onderrug,s=schouder), extra (c=compound,h=houdoefening,a=gevorderd)] */
const CX=[
["Squats","Quadriceps","squat","gx","ko","c"],["Goblet Squat","Quadriceps","squat","dk","k","c"],["Leg Press","Quadriceps","squat quad","g","","c"],["Squat (eigen gewicht, tempo)","Quadriceps","squat","b","k","c"],["Pistol Squat (geassisteerd)","Quadriceps","squat lunge","b","kh","ca"],["Ring Pistol Squat Progressie","Quadriceps","squat","r","k","ca"],
["Deadlifts","Rug","hinge","gx","o","c"],["Romanian Deadlift","Billen","hinge","gdxk","o","c"],["Single Leg RDL","Billen","hinge","dbk","","c"],["Hip Thrust (barbell)","Billen","glute hinge","gx","","c"],["Glute Bridge (single leg)","Billen","glute hinge","b","","c"],["Back Extension (roman chair)","Rug","hinge","g","o",""],
["Romanian Lunges","Quadriceps","lunge","d","kh","c"],["Bulgarian Split Squat (DB)","Quadriceps","lunge squat","d","kh","c"],["Walking Lunges","Quadriceps","lunge","b","kh","c"],["Step-up (bank)","Quadriceps","lunge","db","h","c"],
["Quadricep Extension","Quadriceps","quad","g","k",""],["Wall Sit","Quadriceps","quad","b","k","h"],
["Hamstring Extension","Hamstrings","ham","g","",""],["Nordic Curl (bank/deur)","Hamstrings","ham","b","","a"],["Hamstring Bridge Walkout","Hamstrings","ham","b","",""],
["Calf Raise","Kuiten","calf","gdk","c",""],["Calf Raise (trap/stap)","Kuiten","calf","b","c",""],
["Cable Kickback","Billen","glute","g","",""],["Hip Abduction (machine/band)","Billen","glute","ge","",""],
["Bench Press","Borst","hpush","gx","s","c"],["Dumbbell Bench Press","Borst","hpush","d","","c"],["Push-up (wijd, slow ecc.)","Borst","hpush","b","w","c"],["Ring Push-up (turned out)","Borst","hpush","rt","s","c"],["Dips","Borst","hpush","gp","s","c"],["Archer Push-up","Borst","hpush","b","sw","ca"],
["Dumbbell Incline Bench Press","Borst","hpush2","d","","c"],["Push-up (voeten verhoogd)","Borst","hpush2","b","w","c"],["Ring Dip","Borst","hpush2","r","s","ca"],
["Cable Fly","Borst","chest","g","s",""],["Dumbbell Fly","Borst","chest","d","s",""],["Ring Chest Fly","Borst","chest","r","s","a"],
["Dumbbell Shoulder Press","Schouders","vpush","d","s","c"],["Overhead Press (barbell)","Schouders","vpush","gx","so","c"],["Landmine Press","Schouders","vpush","g","","c"],["Pike Push-up","Schouders","vpush","b","sw","c"],["Handstand Push-up (muur)","Schouders","vpush","b","sw","ca"],
["Side Fly's","Schouders","delt","d",""],["Cable Lateral Raise","Schouders","delt","g","",""],["Band Face Pull","Schouders","rear delt","e","",""],
["Face Pull (cable)","Schouders","rear","g","",""],["DB / Band Rear Delt Fly","Schouders","rear","de","",""],["Rear Delt Ring Fly","Schouders","rear","rt","",""],
["Pull-ups","Rug","vpull","p","","c"],["Lat Pulldown","Rug","vpull","g","","c"],["Chin-up (supinatie)","Biceps","vpull bi","p","","c"],["Negatieve Pull-up","Rug","vpull","p","","c"],["Wide Ring Pull-up","Rug","vpull","r","","ca"],
["Cable Row","Rug","hpull","g","","c"],["Dumbbell Row","Rug","hpull hpull2","d","","c"],["Australian Row (tafel/stang)","Rug","hpull","bp","","c"],["Ring Row","Rug","hpull","rt","","c"],["Chest Supported Row","Rug","hpull2","gd","","c"],["Renegade Row","Rug","hpull2","d","o","c"],
["Bicep Curl (gebogen stang)","Biceps","bi","gx","",""],["Hammer Curls","Biceps","bi","d","",""],["Ring Bicep Curl","Biceps","bi","rt","",""],["Band Curl","Biceps","bi","e","",""],
["Tricep Cable Pulldown","Triceps","tri","g","",""],["Tricep Overhead Extension","Triceps","tri","d","s",""],["Diamond Push-up","Triceps","tri","b","w",""],["Tricep Extension (ringen)","Triceps","tri","rt","s",""],["Tricep Dips","Triceps","tri","b","s",""],
["Kettlebell Goblet Squat","Quadriceps","squat","k","k","c"],["Kettlebell Swing","Billen","hinge glute","k","o","c"],["Kettlebell Press","Schouders","vpush","k","s","c"],["Kettlebell Row","Rug","hpull","k","","c"],
["Band Row","Rug","hpull","e","","c"],["Band Pull-Apart","Schouders","rear delt","e","",""],["Band Chest Press","Borst","hpush","e","","c"],["Band Lateral Raise","Schouders","delt","e","",""],["Band Tricep Pushdown","Triceps","tri","e","",""],["TRX Row","Rug","hpull","t","","c"],["TRX Push-up","Borst","hpush","t","w","c"],
["Hanging Leg Raise","Core","core","p","",""],["Planking","Core","core","b","","h"],["Dead Bug","Core","core","b","",""],["Ab-Wheel Rollout","Core","core","gb","o",""],["Hollow Body Hold","Core","core","b","","h"],["Crunches","Core","core","b","",""],["Cable Woodchopper","Core","core","g","",""],
["Dead Hang","Onderarmen","grip","p","","h"],["Forearm Curl","Onderarmen","grip","d","",""]
].map(([n,g,sl,eq,av,x])=>({n,g,sl:sl.split(" "),eq,av:av||"",x:x||""}));
const HX=[["Burpees","b","ksjw"],["Jump Squats","b","kj"],["Mountain Climbers","b","w"],["Kettlebell Swings","gk","o"],["Push-ups","b","w"],["High Knees","b","kj"],["Dumbbell Thrusters","d","s"],["Battle Ropes","g",""],["Roeien (roeitrainer, sprint)","gc",""],["Plank Jacks","b","jw"],["Skater Jumps","b","kj"],["Squat to Press (DB)","d","s"],["Fietsen (sprint, hometrainer)","gc",""],["Step-ups (snel)","b","jh"],["Band Squat to Row","e",""],["Dead Bug (snel)","b",""]].map(([n,eq,av])=>({n,g:"Full body",eq,av}));
const TPL_DAY={
  FB_A:["squat","hpush","vpull","hinge","delt","core","bi","tri"],FB_B:["hinge","vpush","hpull","lunge","hpush2","core","rear","calf"],FB_C:["lunge","hpush","vpull","glute","delt","core","tri","bi"],
  UP_A:["hpush","vpull","vpush","hpull","delt","tri","bi","core"],UP_B:["vpush","hpull","hpush2","vpull","rear","bi","tri","chest"],
  LO_A:["squat","hinge","lunge","quad","ham","calf","core","glute"],LO_B:["hinge","squat","glute","ham","quad","calf","core","lunge"],
  PUSH:["hpush","vpush","hpush2","delt","tri","chest","core","tri"],PULL:["vpull","hpull","hpull2","rear","bi","grip","core","bi"],LEGS:["squat","hinge","lunge","quad","ham","calf","glute","core"]};
const DAY_NAME={FB_A:"Full body A",FB_B:"Full body B",FB_C:"Full body C",UP_A:"Bovenlichaam A",UP_B:"Bovenlichaam B",LO_A:"Onderlichaam A",LO_B:"Onderlichaam B",PUSH:"Push (borst, schouders, triceps)",PULL:"Pull (rug, biceps)",LEGS:"Benen"};
const FOCUS=[["borst","Borst",["chest","hpush2"]],["rug","Rug",["hpull2","vpull"]],["schouders","Schouders",["delt","rear"]],["armen","Armen",["bi","tri"]],["benen","Benen",["quad","ham"]],["billen","Billen",["glute"]],["core","Buik / core",["core"]]];
const FOCUS_REGION={chest:"up",hpush2:"up",hpull2:"up",vpull:"up",delt:"up",rear:"up",bi:"up",tri:"up",quad:"lo",ham:"lo",glute:"lo",core:"any"};
const LIKES=[["kracht","Krachttraining (sportschool)"],["cali","Calisthenics / eigen gewicht"],["hiit","HIIT"],["cardio","Cardio (duur)"]];
const CGOALS=[["massa","Spiermassa"],["kracht","Sterker worden"],["vet","Vetverlies / conditie"],["fit","Algemeen fit"]];
const LEVELS=[["beg","Beginner","korter dan 6 maanden"],["int","Gemiddeld","6 maanden tot 2 jaar"],["adv","Gevorderd","langer dan 2 jaar"]];
const EQUIP=[["g","Sportschool"],["x","Halterstang en rek thuis"],["d","Dumbbells"],["k","Kettlebell"],["e","Weerstandsbanden"],["p","Optrekstang"],["r","Ringen"],["t","TRX / suspension trainer"],["c","Hometrainer, roeitrainer of loopband"]];
const INJ=[["k","Knie"],["o","Onderrug"],["s","Schouder"],["shin","Scheenbeenontsteking"],["calf","Kuit: verrekt of herstellend van een scheur"],["ach","Achillespees"],["ank","Enkel"],["hip","Heup of lies"],["w","Pols of elleboog"],["neck","Nek"]];
const INJ_AV={k:"k",o:"o",s:"s",shin:"j",calf:"jc",ach:"jc",ank:"j",hip:"h",w:"w",neck:"s"};
const INJ_RUN=["k","shin","calf","ach","ank","hip"];
const INJ_WORDS=[["scheen","shin"],["kuit","calf"],["achilles","ach"],["enkel","ank"],["knie","k"],["rug","o"],["schouder","s"],["heup","hip"],["lies","hip"],["pols","w"],["elleboog","w"],["nek","neck"]];
function injCodes(c){const set=new Set();for(const i of (c.inj||[]))for(const ch of (INJ_AV[i]||i))set.add(ch);return [...set]}
const CSPORT=[["Hardlopen","Hardlopen"],["Wielrennen","Fietsen"],["Zwemmen","Zwemmen"],["Roeien","Roeien"]];
const ALIAS=[["deadlift","Deadlifts"],["bankdruk","Bench Press"],["bench","Bench Press"],["squat","Squats"],["pull-up","Pull-ups"],["pullup","Pull-ups"],["optrek","Pull-ups"],["chin","Chin-up (supinatie)"],["dips","Dips"],["hip thrust","Hip Thrust (barbell)"],["push-up","Push-up (wijd, slow ecc.)"],["opdruk","Push-up (wijd, slow ecc.)"],["lunge","Walking Lunges"],["leg press","Leg Press"],["shoulder press","Dumbbell Shoulder Press"],["roeien","Cable Row"],["row","Cable Row"],["curl","Hammer Curls"],["plank","Planking"],["leg raise","Hanging Leg Raise"]];
const ALIAS_FOCUS=[["borst","borst"],["rug","rug"],["schouder","schouders"],["arm","armen"],["biceps","armen"],["triceps","armen"],["been","benen"],["benen","benen"],["bil","billen"],["glute","billen"],["buik","core"],["sixpack","core"],["six pack","core"],["core","core"]];
function coachDefaults(){
  const b=bodyMeta(),saved=S.meta.coach||{};
  const goal=saved.goal||(isBulk(b.goal)?"massa":isCut(b.goal)?"vet":b.goal==="onderhoud"?"fit":"");
  const days=saved.days||Math.min(6,Math.max(2,Object.values(b.sports||{}).reduce((s,x)=>s+(x.n||0),0)||3));
  return{likes:saved.likes||[],goal,days,level:saved.level||"",min:saved.min||"",equip:saved.equip||[],focus:saved.focus||[],inj:saved.inj||null,csport:saved.csport||"",wish:saved.wish||"",seed:0};
}
function parseWish(txt,eqOk){
  const t=" "+String(txt||"").toLowerCase().replace(/[^a-z0-9ëéï\- ]/g," ")+" ",inc=[],exc=[],focus=[];
  for(const [k,n] of ALIAS){const i=t.indexOf(k);if(i<0)continue;const before=t.slice(Math.max(0,i-12),i);const neg=/(geen|niet|hekel aan|zonder)\s+(\w+\s+)?$/.test(before);
    const ex=CX.find(x=>x.n===n);if(!ex)continue;
    if(neg){for(const x of CX)if(x.n===n||x.n.toLowerCase().includes(k))exc.includes(x.n)||exc.push(x.n)}else inc.includes(n)||inc.push(n)}
  for(const [k,f] of ALIAS_FOCUS)if(new RegExp("\\b"+k).test(t)&&!focus.includes(f))focus.push(f);
  return{inc:inc.filter(n=>!exc.includes(n)),exc,focus};
}
function equipOf(c){if((c.equip||[]).length)return c.equip;return c.likes.includes("kracht")?["g"]:c.likes.includes("cali")?["p"]:[]}
function eqAllowed(c){const s=new Set(["b",...equipOf(c)]);if(s.has("g")){for(const x of "dpxkec")s.add(x)}if(s.has("t"))s.add("r");return s}
const famOf=n=>n.toLowerCase().replace(/\(.*?\)/g,"").replace(/\b(band|cable|db|dumbbell|ring|barbell|machine)\b|\//g,"").replace(/\s+/g," ").trim();
function pickEx(slot,c,used,offset,prefBw,exc){
  const ok=eqAllowed(c),inj=injCodes(c);
  let list=CX.filter(x=>x.sl.includes(slot)&&[...x.eq].some(e=>ok.has(e))&&!inj.some(i=>x.av.includes(i))&&!used.has(x.n)&&!used.has("f:"+famOf(x.n))&&!exc.includes(x.n)&&!(c.level==="beg"&&x.x.includes("a")));
  if(c.level==="adv")list.sort((a,b)=>(b.x.includes("a")?1:0)-(a.x.includes("a")?1:0));
  if(prefBw!=null)list.sort((a,b)=>{const bw=x=>/[bpr]/.test(x.eq)&&!/[gd]/.test(x.eq)?1:0;return prefBw?bw(b)-bw(a):bw(a)-bw(b)});
  if(!list.length)return null;return list[offset%list.length];
}
function doseFor(ex,c,isFocus){
  const comp=ex.x.includes("c"),hold=ex.x.includes("h"),beg=c.level==="beg",adv=c.level==="adv";
  let sets,reps,rest;
  if(c.goal==="kracht"){sets=comp?5:3;reps=comp?"4-6":"8-10";rest=comp?"Rust 2-3 min":"Rust 90 s"}
  else if(c.goal==="massa"){sets=comp?4:3;reps=comp?"8-10":"10-15";rest=comp?"Rust 90 s":"Rust 60 s"}
  else if(c.goal==="vet"){sets=3;reps=comp?"10-12":"12-15";rest=comp?"Rust 45-60 s":"Rust 30-45 s, eventueel als superset"}
  else{sets=3;reps=comp?"8-12":"10-12";rest="Rust 60-90 s"}
  if(beg)sets=Math.max(2,sets-1);if(adv&&!comp)sets++;if(isFocus)sets++;
  if(hold)reps=beg?"20-30 s":"30-45 s";
  else if(ex.x.includes("a")&&!comp)reps="4-8";
  else if(!/[gd]/.test(ex.eq)&&comp&&c.goal==="kracht")reps="5-8 (zwaarste variant)";
  const tip=beg?"Kies een gewicht of variant waarbij je nog 2-3 herhalingen over hebt.":comp&&c.goal!=="vet"?"Lukt de bovenkant van de herhalingen bij alle sets? Volgende keer iets zwaarder.":"";
  return{sets:String(sets),reps,note:[rest,tip,isFocus?"Focusoefening":""].filter(Boolean).map(x=>x.replace(/\.$/,"")).join(". ")+"."};
}
function allocDays(c){
  const L=new Set(c.likes),D=+c.days,str=L.has("kracht")||L.has("cali");let S=0,H=0,C=0;
  if(str){S=D;if(L.has("hiit")&&D>=3){H=1;S--}if(L.has("cardio")&&D>=3){C=D>=6?2:1;S-=C}if(L.has("cardio")&&D===2&&!L.has("hiit")){}if(S<2&&D>=2){const need=2-S;S=2;if(C>=need)C-=need;else{H-=need-C;C=0}}}
  else if(L.has("hiit")&&L.has("cardio")){H=Math.min(3,Math.ceil(D/2));C=D-H}
  else if(L.has("hiit")){H=Math.min(D,4);C=D-H}
  else{C=D}
  return{S,H,C};
}
function strengthSplit(S,c){
  if(S<=0)return[];if(S===1)return["FB_A"];if(S===2)return["FB_A","FB_B"];
  if(S===3)return c.level==="adv"&&c.goal!=="vet"?["PUSH","PULL","LEGS"]:["FB_A","FB_B","FB_C"];
  if(S===4)return["UP_A","LO_A","UP_B","LO_B"];if(S===5)return["UP_A","LO_A","PUSH","PULL","LEGS"];
  return["PUSH","PULL","LEGS","PUSH","PULL","LEGS"];
}
function buildPlan(c){
  const w=parseWish(c.wish),focus=[...new Set([...(c.focus||[]),...w.focus])],al=allocDays(c),L=new Set(c.likes);
  const prefBw=L.has("cali")&&!L.has("kracht")?true:L.has("kracht")&&!L.has("cali")?false:null;
  const perMin={30:4,45:5,60:6,75:7,90:8}[c.min||60]||6,count=Math.max(3,Math.min(9,perMin+(c.goal==="vet"?1:0)-(c.goal==="kracht"?1:0)));
  const split=strengthSplit(al.S,c),routines=[],mustAdd=[...w.inc],slotUse={};
  split.forEach((tpl,di)=>{
    const used=new Set(),items=[];
    let slots=[...TPL_DAY[tpl]];
    const region=/^(UP|PUSH|PULL)/.test(tpl)?"up":/^(LO|LEGS)/.test(tpl)?"lo":"fb";
    const fslots=focus.flatMap(f=>(FOCUS.find(x=>x[0]===f)||[,,[]])[2]).filter(s=>{const r=FOCUS_REGION[s];return r==="any"||region==="fb"||r===region});
    for(const fs of fslots.slice(0,2)){slots.splice(Math.min(4,slots.length),0,"F:"+fs)}

    const dayPrefBw=prefBw==null?(di%2===1):prefBw;
    for(const sl of slots){if(items.length>=count)break;const isF=sl.startsWith("F:"),s=isF?sl.slice(2):sl,off=(slotUse[s]=(slotUse[s]||0)+1)-1+(c.seed||0);
      let ex=null;const mi=mustAdd.findIndex(n=>{const x=CX.find(y=>y.n===n);return x&&x.sl.includes(s)&&!used.has(n)});
      if(mi>=0){ex=CX.find(y=>y.n===mustAdd[mi]);mustAdd.splice(mi,1)}else ex=pickEx(s,c,used,off,dayPrefBw,w.exc);
      if(!ex)continue;used.add(ex.n);used.add("f:"+famOf(ex.n));items.push({name:ex.n,group:ex.g,...doseFor(ex,c,isF)})}
    routines.push({key:tpl,name:`Dag ${di+1} · ${DAY_NAME[tpl]}`,items});
  });
  const hiit=[];const ok=eqAllowed(c),inj=injCodes(c);
  for(let i=0;i<al.H;i++){const pool=HX.filter(x=>[...x.eq].some(e=>ok.has(e))&&!inj.some(j=>x.av.includes(j)));const n=c.min&&c.min<=30?5:6,beg=c.level==="beg";
    const o=(i*n+(c.seed||0)*2)%Math.max(1,pool.length),uniq=pool.slice(o).concat(pool.slice(0,o)).slice(0,n);
    hiit.push({key:"HIIT",name:`HIIT ${al.H>1?"ABCD"[i]:""}`.trim(),items:uniq.map(x=>({name:x.n,group:"Full body",sets:beg?"3":"4",reps:beg?"30 s":"40 s",note:beg?"30 s werk, 30 s rust. Na elke ronde 1 min rust.":"40 s werk, 20 s rust. Na elke ronde 1 min rust."}))});
  }
  const cs=c.csport||"Hardlopen",cardio=[];
  for(let i=0;i<al.C;i++){const lng=i===1||(al.C===1&&c.goal!=="vet"&&c.goal!=="fit");
    const t=c.goal==="vet"?(i===0?"Rustige duurtraining (zone 2)":"Intervaltraining"):lng?"Lange rustige duurtraining":i===0?"Rustige duurtraining (zone 2)":"Tempotraining";
    cardio.push({sport:cs,title:`${cs==="Wielrennen"?"Fietsen":cs}: ${t}`,durMin:lng?(c.min&&c.min>60?c.min:60):(c.min||45)})}
  if(!routines.length&&!hiit.length)routines.push({key:"CORE",name:"Kracht & stabiliteit (15-20 min)",items:["Planking","Dead Bug","Glute Bridge (single leg)","Walking Lunges","Band Face Pull"].map(n=>CX.find(x=>x.n===n)).filter(x=>x&&!inj.some(j=>x.av.includes(j))).map(x=>({name:x.n,group:x.g,sets:"2",reps:x.x.includes("h")?"30 s":"10-12",note:"Doe dit 1-2× per week na een rustige duurtraining. Helpt blessures voorkomen."}))});
  // weekvolgorde: kracht verspreid, hiit/cardio ertussen
  const strDays=routines.filter(r=>r.key!=="CORE"),other=[...hiit.map(h=>({t:"h",r:h})),...cardio.map(x=>({t:"c",x}))];
  const total=strDays.length+other.length,opos=new Set(other.map((_,j)=>Math.min(total-1,Math.round((j+0.5)*total/other.length))));
  const seq=[];let si=0,oi=0;
  for(let k=0;k<total;k++){if((opos.has(k)&&oi<other.length)||si>=strDays.length)seq.push(other[oi++]);else seq.push({t:"s",r:strDays[si++]})}
  const DAYPOS={1:[0],2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,4,5],6:[0,1,2,3,4,5],7:[0,1,2,3,4,5,6]}[seq.length]||[0,1,2,3,4,5,6];
  const week=seq.map((s,i)=>({...s,dow:DAYPOS[i]}));
  // persoonlijk
  const opt=[["level",!!c.level,"je niveau"],["min",!!c.min,"hoe lang een training mag duren"],["equip",(c.equip||[]).length>0,"welk materiaal je hebt"],["focus",focus.length>0,"welke spiergroepen je extra wilt trainen"],["inj",c.inj!=null,"of je blessures of klachten hebt"],["wish",!!(c.wish||"").trim(),"je eigen wensen (oefeningen die je wel of niet wilt)"]];
  if(L.has("cardio"))opt.push(["csport",!!c.csport,"je favoriete duursport"]);
  const done=opt.filter(o=>o[1]).length;
  return{routines:[...routines,...hiit],cardio,week,al,count,focus,wish:w,score:Math.round(done/opt.length*100),missing:opt.filter(o=>!o[1]).map(o=>o[2]),notIncl:mustAdd};
}
function coachExplain(c,P){
  const g=(CGOALS.find(x=>x[0]===c.goal)||[,""])[1].toLowerCase(),L=c.likes,parts=[];
  parts.push(`Een week van ${c.days} dagen${P.al.S?`: ${P.al.S}× kracht`:""}${P.al.H?`${P.al.S?", ":": "}${P.al.H}× HIIT`:""}${P.al.C?`${P.al.S||P.al.H?", ":": "}${P.al.C}× ${(c.csport||"duurtraining").toLowerCase()}`:""}, gericht op ${g||"algemene fitheid"}.`);
  if(P.al.S>=4)parts.push(P.al.S===4?"Je traint boven- en onderlichaam om en om; zo krijgt elke spiergroep 2× per week een prikkel en genoeg herstel.":"Elke spiergroep wordt 2× per week getraind, met een rustdag of lichte dag ertussen.");
  else if(P.al.S===3&&/PUSH/.test(P.routines[0]?.key||""))parts.push("Push, pull en benen: elke training richt zich op andere spieren, zodat je goed herstelt.");
  else if(P.al.S)parts.push("Full body: elke training raakt alle grote spiergroepen. Ideaal bij 2-3 trainingen per week.");
  if(c.goal==="kracht")parts.push("Zware basisoefeningen met weinig herhalingen en lange rust: zo word je het snelst sterker.");
  if(c.goal==="massa")parts.push("8-15 herhalingen met genoeg volume: de beste prikkel voor spiergroei. Combineer met je voedingsdoel.");
  if(c.goal==="vet")parts.push("Kortere rust en wat meer oefeningen houden je hartslag hoog. Je voeding bepaalt het meeste van je vetverlies.");
  if(!(c.equip||[]).length&&(L.includes("kracht")||L.includes("cali")))parts.push(L.includes("kracht")?"Je hebt geen materiaal gekozen; de coach gaat uit van een sportschool.":"Je hebt geen materiaal gekozen; de coach gaat uit van eigen gewicht en een optrekstang.");
  if((c.inj||[]).length)parts.push(`Bij je klachten (${c.inj.map(i=>(INJ.find(x=>x[0]===i)||[,i])[1].toLowerCase()).join(", ")}) zijn oefeningen weggelaten die daar te zwaar voor zijn. Voel je pijn, stop dan en overleg met een fysiotherapeut.`);
  if(P.wish.inc.length||P.wish.exc.length||P.wish.focus.length)parts.push(`Uit je wensen: ${[P.wish.inc.length?`${P.wish.inc.join(", ")} toegevoegd`:"",P.wish.exc.length?`${P.wish.exc.join(", ")} weggelaten`:"",P.wish.focus.length?`extra aandacht voor ${P.wish.focus.join(", ")}`:""].filter(Boolean).join("; ")}.`);
  if(P.notIncl.length)parts.push(`${P.notIncl.join(", ")} paste niet in dit schema (bijvoorbeeld door je materiaal of de indeling). Je kunt het zelf toevoegen.`);
  return parts;
}
const DOW=["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"];
function viewCoachGen(){
  const c=UI.cg;
  if(c.result){const P=c.result,ex=coachExplain(c,P);
    let h=`<div class="wohead"><div class="title">Jouw schema</div><button class="linkbtn" data-act="cg-back">← Wensen aanpassen</button></div>
      <div class="card stack" style="margin-top:10px"><div class="pmeter"><span>Hoe persoonlijk</span><b>${P.score}%</b></div><div class="pt"><span style="width:${P.score}%"></span></div>
      ${P.missing.length?`<p class="small muted" style="margin:0">Nog persoonlijker? Vul ook in: ${P.missing.join(", ")}.</p>`:`<p class="small muted" style="margin:0">Je hebt alles ingevuld; dit schema is zo persoonlijk als de coach het kan maken.</p>`}</div>
      <div class="card" style="margin-top:10px"><ul class="hl">${ex.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
      <h2>Je week</h2><div class="recgroup">${P.week.map(d=>`<div class="row" style="cursor:default"><span class="n">${DOW[d.dow].charAt(0).toUpperCase()+DOW[d.dow].slice(1)}</span><span class="b none">${d.t==="s"?"Kracht":d.t==="h"?"HIIT":"Duur"}</span><span class="l">${esc(d.t==="c"?`${d.x.title} · ± ${d.x.durMin} min`:d.r.name)}</span></div>`).join("")}</div>`;
    for(const r of P.routines)h+=`<h2>${esc(r.name)}</h2><div class="card" style="padding:6px 14px">${r.items.map(it=>`<div class="fline"><span class="fq">${esc(it.sets)} × ${esc(it.reps)}</span><span class="fn">${esc(it.name)}</span><span class="fm">${esc(it.note)}</span></div>`).join("")}</div>`;
    h+=`<div class="card stack" style="margin-top:14px"><label class="check"><input type="checkbox" id="cg-plan" checked><span>Zet de trainingen ook in mijn planning, vanaf volgende week maandag</span></label><label class="f">Hoeveel weken<select id="cg-weeks">${[1,2,4,6,8].map(v=>`<option value="${v}" ${v===4?"selected":""}>${v} ${v===1?"week":"weken"}</option>`).join("")}</select></label>
      <button class="btn primary" data-act="cg-save">Opslaan als map</button><button class="btn" data-act="cg-again">Andere oefeningen kiezen</button></div>
      <p class="small muted">De coach maakt een schema volgens algemene trainingsrichtlijnen; het is geen persoonlijk advies van een trainer of fysiotherapeut. Je kunt alles daarna zelf aanpassen.</p>`;
    return h;}
  const chips=(key,opts,multi)=>`<div class="chips">${opts.map(([v,l,sub])=>`<button class="chipb" data-act="cg-set" data-k="${key}" data-v="${v}" data-m="${multi?1:""}" aria-pressed="${multi?(c[key]||[]).includes(v):String(c[key])===String(v)}">${esc(l)}${sub?` <span class="small muted">· ${esc(sub)}</span>`:""}</button>`).join("")}</div>`;
  return `<div class="wohead"><div class="title">Sportschema op maat</div><button class="linkbtn" data-act="cg-close">Annuleren</button></div>
    <p class="hp small muted" style="margin-top:8px">Vertel wat je leuk vindt en wat je wilt bereiken. Hoe meer je invult, hoe beter het schema bij je past.</p>
    <div class="card stack">
      <div class="f">Wat vind je leuk? <i>meerdere mogelijk</i>${chips("likes",LIKES,true)}</div>
      <div class="f">Wat wil je bereiken?${chips("goal",CGOALS)}</div>
      <div class="f">Hoeveel dagen per week?${chips("days",[2,3,4,5,6].map(v=>[v,String(v)]))}</div>
    </div>
    <h2>Maak het persoonlijker <span class="small muted">· optioneel</span></h2><div class="card stack">
      <div class="f">Je niveau${chips("level",LEVELS)}</div>
      <div class="f">Hoe lang mag een training duren?${chips("min",[30,45,60,75,90].map(v=>[v,v+" min"]))}</div>
      <div class="f">Welk materiaal heb je? <i>eigen gewicht kan altijd</i>${chips("equip",EQUIP,true)}</div>
      <div class="f">Extra aandacht voor <i>maximaal 2</i>${chips("focus",FOCUS.map(f=>[f[0],f[1]]),true)}</div>
      <div class="f">Blessures of klachten?<div class="chips"><button class="chipb" data-act="cg-noinj" aria-pressed="${Array.isArray(c.inj)&&!c.inj.length}">Geen</button>${INJ.map(([v,l])=>`<button class="chipb" data-act="cg-set" data-k="inj" data-v="${v}" data-m="1" aria-pressed="${(c.inj||[]).includes(v)}">${l}</button>`).join("")}</div></div>
      ${c.likes.includes("cardio")?`<div class="f">Favoriete duursport${chips("csport",CSPORT)}</div>`:""}
      <label class="f">Nog wensen? <i>bijv. "graag deadlifts en pull-ups, geen squats, sterkere billen"</i><textarea id="cg-wish" rows="2">${esc(c.wish)}</textarea></label>
    </div>
    <button class="btn primary block" style="margin-top:14px" data-act="cg-make">Maak mijn schema</button>`;
}
async function coachSave(){
  const c=UI.cg,P=c.result,withPlan=document.getElementById("cg-plan")?.checked,weeks=+(document.getElementById("cg-weeks")?.value||4);
  const L=c.likes.map(l=>({kracht:"kracht",cali:"calisthenics",hiit:"HIIT",cardio:"cardio"})[l]).join(" + ");
  let nm=`Coach · ${c.days} dagen ${L}`;if(folderList().some(f=>norm(f.name)===norm(nm)))nm+=` (${dateTxt(today())})`;
  const fid="fd-"+uid();await put("folders",fid,{name:nm.slice(0,60),order:folderList().length});UI.open["f:"+fid]=true;lsSet(LS_OPEN,UI.open);
  const ids=await addRoutinesTo(P.routines.map(r=>({name:r.name,items:r.items})),fid),idOf=new Map(P.routines.map((r,i)=>[r,ids[i]]));
  let n=0;
  if(withPlan){const t=today(),mon=addDays(weekStart(t),7),jobs=[],stem=uid();
    for(let w=0;w<weeks;w++)P.week.forEach((d,i)=>{const date=addDays(mon,w*7+d.dow);
      if(d.t==="c")jobs.push(["plan",stem+"c"+w+"_"+i,{type:"cardio",sport:["Hardlopen","Wielrennen"].includes(d.x.sport)?d.x.sport:"Anders",title:d.x.title,durMin:d.x.durMin,own:true,date,updated:Date.now()}]);
      else{const rid=idOf.get(d.r);if(rid)jobs.push(["plan",stem+"r"+w+"_"+i,{type:"routine",routineId:rid,routineName:d.r.name,own:true,date,updated:Date.now()}])}});
    await runJobs(jobs,put);n=jobs.length}
  await put("meta","coach",{likes:c.likes,goal:c.goal,days:c.days,level:c.level,min:c.min,equip:c.equip,focus:c.focus,inj:c.inj,csport:c.csport,wish:c.wish});
  UI.cg=null;UI.tab="schemas";lsSet(LS_TAB,"schemas");toastOk(`Map "${nm}" gemaakt${n?` en ${n} trainingen ingepland`:""}`);render();window.scrollTo(0,0);
}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;const act=b.dataset.act;
  if(!act.startsWith("cg-"))return;
  const c=UI.cg;
  switch(act){
    case "cg-open":UI.cg=coachDefaults();UI.tab="schemas";lsSet(LS_TAB,"schemas");render();window.scrollTo(0,0);break;
    case "cg-close":UI.cg=null;render();window.scrollTo(0,0);break;
    case "cg-set":{const k=b.dataset.k,raw=b.dataset.v,v=/^\d+$/.test(raw)?+raw:raw;c.wish=document.getElementById("cg-wish")?.value??c.wish;
      if(b.dataset.m){const a=c[k]=Array.isArray(c[k])?c[k]:[];const i=a.indexOf(v);if(i>=0)a.splice(i,1);else{if(k==="focus"&&a.length>=2)a.shift();a.push(v)}}
      else c[k]=c[k]===v?"":v;render();break}
    case "cg-noinj":c.wish=document.getElementById("cg-wish")?.value??c.wish;c.inj=Array.isArray(c.inj)&&!c.inj.length?null:[];render();break;
    case "cg-make":{c.wish=document.getElementById("cg-wish")?.value||"";
      if(!c.likes.length){toast("Kies minstens één soort training die je leuk vindt.");return}
      if(!c.goal){toast("Kies wat je wilt bereiken.");return}
      if(!c.days){toast("Kies hoeveel dagen per week.");return}
      c.result=buildPlan(c);render();window.scrollTo(0,0);break}
    case "cg-again":c.seed=(c.seed||0)+1;c.result=buildPlan(c);render();window.scrollTo(0,0);toast("Andere oefeningen gekozen");break;
    case "cg-back":c.result=null;render();window.scrollTo(0,0);break;
    case "cg-save":await coachSave();break;
  }
});

