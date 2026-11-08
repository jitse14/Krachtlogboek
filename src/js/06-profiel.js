/* ---------- profiel ---------- */
const SPORTS=[["kracht","Kracht / fitness / calisthenics",5,60,"kracht"],["hardlopen","Hardlopen",9.5,50,"duur"],["wielrennen","Wielrennen",7.5,90,"duur"],["zwemmen","Zwemmen",7,45,"duur"],["teamsport","Teamsport (voetbal, hockey…)",7,75,"mix"],["overig","Overige sport",6,60,"mix"]];
const GOALS=[["afvallen","Afvallen","Zo veel mogelijk gewicht verliezen","−20% (max −750 kcal)"],["droog_heavy","Heavy droogtrainen","Snel vet verliezen, spieren behouden","−500 kcal"],["droog_lean","Lean droogtrainen","Rustig vet verliezen, sterk blijven","−250 kcal"],["onderhoud","Onderhoud","Gewicht stabiel houden, sterker worden","± 0 kcal"],["bulk_lean","Lean bulk","Rustig spiermassa opbouwen met weinig vet","+200 kcal"],["bulk_heavy","Heavy bulk","Sneller aankomen, accepteert wat extra vet","+400 kcal"]];
const GOAL_OLD={bulk:"bulk_lean",droog:"droog_lean"};
const WORK=[["zittend","Zittend werk of studie, weinig beweging",1.25,0],["licht","Zittend, maar dagelijks wandelen of fietsen",1.35,0],["gemengd","Afwisselend zitten, staan en lopen",1.45,0.03],["staand","Veel staan en lopen (winkel, horeca, zorg)",1.6,0.06],["fysiek","Zwaar lichamelijk werk (bouw, magazijn)",1.75,0.15]];
const isCut=g=>g==="afvallen"||g==="droog_heavy"||g==="droog_lean",isBulk=g=>g==="bulk_lean"||g==="bulk_heavy";
function bodyMeta(){const b={...(S.meta.body||{})};if(GOAL_OLD[b.goal])b.goal=GOAL_OLD[b.goal];if(b.work&&!WORK.some(w=>w[0]===b.work))b.work="gemengd";return b}
function weightList(){return Object.values(S.weights).filter(x=>x&&x.kg).sort((a,b)=>(a.date||"").localeCompare(b.date||""))}
function currentWeight(){const l=weightList();return l.length?l[l.length-1].kg:null}
function fmt1(n){return (Math.round(n*10)/10).toString().replace(".",",")}
const nl=n=>Math.round(n).toLocaleString("nl-NL");
function pfDraft(){if(!UI.pf){const b=bodyMeta();UI.pf={age:b.age??"",height:b.height??"",sex:b.sex||"",targetWeight:b.targetWeight??"",tdate:b.tdate||"",goal:b.goal||"",work:b.work||"gemengd",steps:b.steps??"",sports:clone(b.sports||{})}}return UI.pf}
function sparkline(list){
  if(list.length<2)return "";
  const W=320,H=70,P=6,ks=list.map(x=>x.kg),mn=Math.min(...ks),mx=Math.max(...ks),rg=(mx-mn)||1;
  const pts=list.map((x,i)=>[P+i*(W-2*P)/(list.length-1),H-P-(x.kg-mn)/rg*(H-2*P)]);
  const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" "),last=pts[pts.length-1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gewichtsverloop van ${fmt1(ks[0])} naar ${fmt1(ks[ks.length-1])} kg"><path d="${d} L${last[0]} ${H} L${pts[0][0]} ${H} Z" fill="var(--accent)" opacity=".12"/><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--accent)"/></svg>`;
}
function viewProfile(){
  const f=pfDraft(),p=S.me||{},wl=weightList(),cw=currentWeight(),g=GOALS.find(x=>x[0]===f.goal),sc=socialCount();
  let h=`<button class="card start" style="margin-top:16px" data-act="go-together"><span><span class="name">Samen trainen</span><br><span class="muted small">Elkaar trainingen, schema's en maaltijden sturen, met toestemming</span></span><span class="go">${sc?`<span class="cnt">${sc}</span>`:"Open"}</span></button><h2>Mijn gegevens</h2><div class="card stack">
    <div class="grid2"><label class="f">Leeftijd<input type="text" inputmode="numeric" id="pf-age" value="${esc(f.age)}" placeholder="jaar"></label>
    <label class="f">Lengte<input type="text" inputmode="decimal" id="pf-height" value="${esc(f.height)}" placeholder="cm"></label></div>
    <div class="f">Geslacht<div class="seg">${["Man","Vrouw","Anders"].map(s=>`<button class="segb" data-act="pf-sex" data-v="${s}" aria-pressed="${f.sex===s}">${s}</button>`).join("")}</div></div>
    <label class="f">Doelgewicht<input type="text" inputmode="decimal" id="pf-target" value="${esc(f.targetWeight)}" placeholder="kg"></label>
    <label class="f">Doelgewicht bereiken op <i>optioneel</i><input type="date" id="pf-tdate" value="${esc(f.tdate)}"></label>${tlineHint()}
    <div class="f">Doel<div class="seg seg3 goal6">${GOALS.map(([k,l])=>`<button class="segb" data-act="pf-goal" data-v="${k}" aria-pressed="${f.goal===k}">${l}</button>`).join("")}</div>
      <span class="hintline">${g?`${esc(g[2])} · ${esc(g[3])} per dag`:"Kies wat je wilt bereiken"}</span></div>
  </div>
  <h2>Beweging door de week</h2><div class="card stack">
    <label class="f">Werk en dagelijkse activiteit<select id="pf-work">${WORK.map(([k,l])=>`<option value="${k}" ${f.work===k?"selected":""}>${l}</option>`).join("")}</select></label>
    <label class="f">Gemiddeld aantal stappen per dag <i>optioneel</i><input type="text" inputmode="numeric" id="pf-steps" value="${esc(f.steps)}" placeholder="Bijv. 8000"></label>
    <span class="hintline">Te vinden in de Gezondheid-app op je iPhone of in Google Fit. Neem het weekgemiddelde, liefst zonder je hardlooptrainingen. Vul je dit in, dan rekent de app hiermee in plaats van met alleen je werk.</span>
  </div>
  <h2>Trainingen per week</h2><div class="card stack">
    ${SPORTS.filter(([k])=>spProfOk(k)).map(([k,l,,dm])=>{const s=f.sports[k]||{};return `<div class="sportrow"><span class="sl">${l}</span><label class="f">Keer/week<input type="text" inputmode="numeric" id="pf-n-${k}" value="${esc(s.n??"")}" placeholder="0"></label><label class="f">Min/keer<input type="text" inputmode="numeric" id="pf-m-${k}" value="${esc(s.min??"")}" placeholder="${dm}"></label></div>`}).join("")}
    <button class="btn primary" data-act="pf-save">Gegevens opslaan</button>
  </div>
  <h2>Gewicht</h2><div class="card stack">
    ${cw?`<div class="wnow"><span class="big">${fmt1(cw)} kg</span><span class="muted small">${wl.length>1?`${cw-wl[0].kg>=0?"+":"−"}${fmt1(Math.abs(cw-wl[0].kg))} kg sinds ${dateTxt(wl[0].date)}`:"eerste meting"}${f.targetWeight?` · doel ${esc(String(f.targetWeight).replace(".",","))} kg`:""}</span></div>${sparkline(wl.slice(-30))}`:`<p class="muted" style="margin:0">Nog geen gewicht geregistreerd. Weeg jezelf 1× per week, op een vaste dag en een vast moment.</p>`}
    <div class="grid2"><label class="f">Datum<input type="date" id="w-date" value="${today()}"></label><label class="f">Gewicht<input type="text" inputmode="decimal" id="w-kg" placeholder="kg"></label></div>
    <button class="btn" data-act="w-add">Gewicht toevoegen</button><details class="privdet"><summary>Tips voor wegen</summary><p class="hp small" style="margin:8px 0 0">${WEIGH_TIP}</p><p class="hp small muted" style="margin:6px 0 0">${WEIGH_CALM}</p></details>
    ${wl.length?`<div class="wlist">${wl.slice(-8).reverse().map(x=>`<div class="wrow"><span>${dateTxt(x.date)}</span><b>${fmt1(x.kg)} kg</b><button class="ib" data-act="w-del" data-id="${x.date}" aria-label="Verwijder meting ${dateTxt(x.date)}">✕</button></div>`).join("")}</div>`:""}
  </div>
  <!--pf-set-->${tabsCard()}${icuCard()}${musicCard()}<h2>Persoonlijke code</h2><div class="card stack">
    ${UI.pinOpen?`<label class="f">Huidige code<input type="password" id="cp-old" autocomplete="current-password"></label><label class="f">Nieuwe code<input type="password" id="cp-new" autocomplete="new-password"></label><label class="f">Herhaal nieuwe code<input type="password" id="cp-new2" autocomplete="new-password"></label><div class="btnrow"><button class="btn primary" data-act="cp-save">Code wijzigen</button><button class="btn" data-act="cp-toggle">Annuleren</button></div>`
    :`<p class="hp">Met je naam en persoonlijke code log je in. Vergeten? Jitse kan hem als beheerder opnieuw instellen.</p>${(myPin()||"").length<6?`<p class="hp small" style="color:var(--warn)">Je code is korter dan 6 tekens. Kies voor extra veiligheid een langere code.</p>`:""}<button class="btn" data-act="cp-toggle">Code wijzigen</button>`}
  </div>`;
  if(p.isAdmin)h+=viewAdmin()+adminToolsV5()+adminFoodShare();
  h+=`<h2>Account verwijderen</h2><div class="card stack">${UI.confirm==="self-del"?selfDelBox():`<p class="hp">Hiermee verwijder je je account en al je gegevens. Daarmee trek je ook je toestemming in.</p><button class="btn ghost danger" data-act="self-del">Account verwijderen</button>`}</div>`;
  h+=`<div class="stack" style="margin-top:16px">${installCard()}<button class="btn block" data-act="go-news">Wat is er nieuw · suggesties</button><button class="btn block" data-act="go-privacy">Privacyverklaring</button><button class="btn block" data-act="go-help">Uitleg en back-up</button><button class="btn block" data-act="logout">Uitloggen</button></div>`;
  return h;
}
async function saveProfile(){
  const f=pfDraft(),old=S.meta.body||{};
  const sports={};for(const [k] of SPORTS){const n=num(f.sports[k]?.n),m=num(f.sports[k]?.min);if(n||m)sports[k]={n:n||0,min:m||0}}
  const data={...old,age:num(f.age),height:num(f.height),sex:f.sex||null,targetWeight:num(f.targetWeight),tdate:f.tdate||null,goal:f.goal||null,work:f.work||"gemengd",steps:num(f.steps),sports};
  await put("meta","body",data);toastOk("Gegevens opgeslagen");UI.pf=null;render();
}

