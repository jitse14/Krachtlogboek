/* ---------- voeding: berekening ---------- */
function nutrition(){
  const b=bodyMeta(),w=currentWeight(),miss=[];
  if(!b.age)miss.push("leeftijd");if(!b.height)miss.push("lengte");if(!b.sex)miss.push("geslacht");if(!w)miss.push("gewicht");if(!b.goal)miss.push("doel");
  if(miss.length)return{miss};
  const bmr=10*w+6.25*b.height-5*b.age+(b.sex==="Man"?5:b.sex==="Vrouw"?-161:-78);
  const wk=WORK.find(x=>x[0]===b.work)||WORK[2],steps=b.steps>0?b.steps:null;
  let base,neatTxt;
  if(steps){const stepK=Math.max(0,steps-3000)*0.0006*w,workK=wk[3]*bmr;base=bmr*1.2+stepK+workK;neatTxt={steps,stepK,workK}}
  else{base=bmr*wk[2];neatTxt=null}
  let weekly=0,sessions=0,strMin=0,endMin=0,mixMin=0;
  for(const [k,,met,dm,type] of SPORTS){const s=(b.sports||{})[k];if(!s||!s.n||!spProfOk(k))continue;const mins=s.min||dm;weekly+=s.n*(mins/60)*(met-1)*w;sessions+=s.n;
    if(type==="kracht")strMin+=s.n*mins;else if(type==="duur")endMin+=s.n*mins;else mixMin+=s.n*mins}
  const endH=(endMin+mixMin*0.5)/60,strH=strMin/60;
  const ptype=endH>=2&&endH>=2*strH?"duur":strH>0&&strH>=2*endH?"kracht":(endH||strH)?"gemengd":"rust";
  const tdee=base+weekly/7;
  const goal=b.goal;
  let adj=goal==="afvallen"?Math.max(-0.2*tdee,-750):goal==="droog_heavy"?-500:goal==="droog_lean"?-250:goal==="bulk_lean"?200:goal==="bulk_heavy"?400:0;
  let kcal=tdee+adj;const floor=Math.max(bmr*1.1,b.sex==="Vrouw"?1400:1600);let floored=false;
  if(kcal<floor){kcal=floor;floored=true}
  const adviceKcal=kcal;
  const nut=b.nut||{};let manualK=false,manualP=false;
  if(nut.kcal>=1000&&nut.kcal<=7000){kcal=nut.kcal;manualK=true}
  let pPerKg={afvallen:2.0,droog_heavy:2.3,droog_lean:2.1,onderhoud:1.7,bulk_lean:1.8,bulk_heavy:1.8}[goal]||1.8;
  if(ptype==="duur"&&!isCut(goal))pPerKg=1.6;
  const carbFloor=endH>=10?7:endH>=7?6:endH>=4?5:endH>=2?4:0;
  let protein=pPerKg*w,fat=Math.max(0.25*kcal/9,0.8*w),carbs=(kcal-protein*4-fat*9)/4,carbShort=false;
  if(carbFloor&&carbs<carbFloor*w){fat=Math.max(0.2*kcal/9,0.7*w);carbs=(kcal-protein*4-fat*9)/4;if(carbs<carbFloor*w-5)carbShort=true}
  carbs=Math.max(0,carbs);
  const pct=nut.pct;
  if(pct&&Math.abs(pct.p+pct.c+pct.f-100)<0.6){protein=kcal*pct.p/100/4;carbs=kcal*pct.c/100/4;fat=kcal*pct.f/100/9;manualP=true}
  const tDays=Math.min(7,sessions),ratio=kcal/tdee;
  const restKcal=base*ratio,trainKcal=tDays?(base+weekly/tDays)*ratio:null;
  const bmi=w/Math.pow(b.height/100,2),tBmi=b.targetWeight?b.targetWeight/Math.pow(b.height/100,2):null;
  let weeks=null;if(b.targetWeight){const diff=b.targetWeight-w,delta=kcal-tdee;if(Math.abs(diff)>=0.3&&Math.sign(diff)===Math.sign(delta)&&Math.abs(delta)>=100)weeks=Math.ceil(Math.abs(diff)*7700/Math.abs(delta)/7)}
  const warn=[],tl=timeline(b,w);
  if(tl&&tl.level!=="ok")warn.push(tl.msg);
  if(b.targetWeight&&!tl){const diff=b.targetWeight-w;
    if(isBulk(goal)&&diff<-0.5)warn.push("Je doelgewicht ligt onder je huidige gewicht, maar je doel is een bulk. Kies afvallen of droogtrainen, of pas je doelgewicht aan.");
    if(isCut(goal)&&diff>0.5)warn.push("Je doelgewicht ligt boven je huidige gewicht, maar je doel is afvallen of droogtrainen. Kies een bulk of pas je doelgewicht aan.");}
  if(isCut(goal)&&bmi<18.5)warn.push("Je BMI ligt onder 18,5. Afvallen raden we dan niet aan. Overleg bij twijfel met een huisarts of diëtist.");
  if(tBmi&&tBmi<18.5)warn.push("Je doelgewicht geeft een BMI onder 18,5. Dat is ondergewicht; kies een hoger doel.");
  if(floored&&!manualK)warn.push("Het berekende tekort was te groot. Je dagdoel is afgerond naar een veilige ondergrens; reken dan op langzamer resultaat.");
  if(manualK&&kcal<floor)warn.push(`Je handmatige dagdoel ligt onder de veilige ondergrens van ± ${r10(floor)} kcal voor jou.`);
  if(carbShort&&!manualP)warn.push(`Met dit dagdoel haal je de ${carbFloor} g koolhydraten per kg niet die bij jouw hoeveelheid duursport past. Overweeg een kleiner tekort.`);
  return{bmr,base,wk,neatTxt,weekly,sessions,tdee,adj:kcal-tdee,adviceKcal,kcal,protein,pPerKg:protein/w,fat,carbs,restKcal,trainKcal,tDays,bmi,weeks,warn,w,b,ptype,endH,strH,carbFloor,manualK,manualP};
}
const r10=n=>Math.round(n/10)*10, r5=n=>Math.round(n/5)*5;
const PTYPE={duur:["Duurgericht","Veel duursport: meer koolhydraten voor energie en herstel."],kracht:["Krachtgericht","Vooral krachttraining: nadruk op eiwit voor spieropbouw."],gemengd:["Gemengd","Kracht en duur: een evenwichtige verdeling."],rust:["Weinig training","Vul je trainingen per week in voor een nauwkeuriger advies."]};

