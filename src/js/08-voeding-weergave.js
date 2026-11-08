/* ---------- voeding: weergave ---------- */
function viewFood(){
  const n=nutrition();
  if(n.miss)return `<h2>Voeding</h2><div class="card empty"><strong>Vul eerst je profiel in</strong><p class="muted">Voor een persoonlijk advies mist nog: ${n.miss.join(", ")}.</p><button class="btn primary" data-act="go-profile">Naar Profiel</button></div>`;
  const tabs=[["advies","Advies"],["dagen","Voorbeelden"],["dagboek","Dagboek"],["shop","Boodschappen"]];
  const t=UI.foodTab||"advies";
  const h=`<div class="seg seg4 foodtabs" role="tablist">${tabs.map(([k,l])=>`<button class="segb" role="tab" data-act="n-tab" data-v="${k}" aria-pressed="${t===k}">${l}</button>`).join("")}</div>`;
  return h+({advies:viewAdvice,dagen:viewDays,dagboek:viewDiary,shop:viewShop}[t]||viewAdvice)(n);
}
function viewAdvice(n){
  const g=GOALS.find(x=>x[0]===n.b.goal)||GOALS[3],carbKg=n.carbs/n.w,pt=PTYPE[n.ptype];
  const pctNow={p:Math.round(n.protein*4/n.kcal*100),c:Math.round(n.carbs*4/n.kcal*100)};pctNow.f=100-pctNow.p-pctNow.c;
  let h=`<h2>Jouw dagdoel · ${esc(g[1])}</h2>
  <div class="card kcalcard"><div class="kbig">${nl(r10(n.kcal))}<span>kcal per dag${n.manualK||n.manualP?' · <b class="manual">handmatig aangepast</b>':""}</span></div>
    <div class="macros">
      <div class="m"><span class="ml">Eiwit</span><b>${r5(n.protein)} g</b><span class="ms">${fmt1(n.pPerKg)} g/kg · ${pctNow.p}%</span></div>
      <div class="m"><span class="ml">Koolhydraten</span><b>${r5(n.carbs)} g</b><span class="ms">${fmt1(carbKg)} g/kg · ${pctNow.c}%</span></div>
      <div class="m"><span class="ml">Vet</span><b>${r5(n.fat)} g</b><span class="ms">${fmt1(n.fat/n.w)} g/kg · ${pctNow.f}%</span></div>
    </div>
    <div class="mbar" aria-hidden="true"><span style="flex:${n.protein*4}" class="mp"></span><span style="flex:${n.carbs*4}" class="mc"></span><span style="flex:${n.fat*9}" class="mf"></span></div>
    <div class="ptype"><span class="chip">${pt[0]}</span><span class="small muted">${pt[1]}</span></div>
    <button class="btn" data-act="n-edit">${UI.nutEdit?"Sluiten":"Zelf aanpassen"}</button>
  </div>`;
  if(UI.nutEdit){const e=UI.nutEdit;const sum=(num(e.p)||0)+(num(e.c)||0)+(num(e.f)||0);
    h+=`<div class="card stack" style="margin-top:10px"><label class="f">Calorieën per dag<input type="text" inputmode="numeric" id="ne-kcal" value="${esc(e.kcal)}" placeholder="Advies: ${nl(r10(n.adviceKcal))}"></label>
      <div class="f">Verdeling in procenten<div class="grid3"><label class="f sub">Eiwit %<input type="text" inputmode="numeric" id="ne-p" value="${esc(e.p)}" placeholder="${pctNow.p}"></label><label class="f sub">Koolh. %<input type="text" inputmode="numeric" id="ne-c" value="${esc(e.c)}" placeholder="${pctNow.c}"></label><label class="f sub">Vet %<input type="text" inputmode="numeric" id="ne-f" value="${esc(e.f)}" placeholder="${pctNow.f}"></label></div></div>
      <span class="hintline" id="ne-sum">${sum?`Samen ${sum}%${Math.abs(sum-100)<0.6?" ✓":" · moet 100% zijn"}`:"Laat leeg om het advies te gebruiken"}</span>
      <div class="btnrow"><button class="btn primary" data-act="n-save">Opslaan</button><button class="btn" data-act="n-reset">Terug naar advies</button></div></div>`}
  if(n.warn.length)h+=`<div class="stack" style="margin-top:10px">${n.warn.map(x=>`<div class="banner">${esc(x)}</div>`).join("")}</div>`;
  if(n.trainKcal&&n.tDays<7)h+=`<h2>Trainingsdag of rustdag</h2><div class="card"><div class="tworow"><div><span class="ml">Trainingsdag</span><b>${nl(r10(n.trainKcal))} kcal</b><span class="ms">± ${r5(Math.max(0,(n.trainKcal-n.protein*4-n.fat*9)/4))} g koolhydraten</span></div><div><span class="ml">Rustdag</span><b>${nl(r10(n.restKcal))} kcal</b><span class="ms">± ${r5(Math.max(0,(n.restKcal-n.protein*4-n.fat*9)/4))} g koolhydraten</span></div></div><p class="hp small muted" style="margin-top:8px">Eiwit en vet blijven gelijk. Het verschil zit in de koolhydraten: meer op dagen dat je traint, minder op rustdagen.</p></div>`;
  const moments=[["Ontbijt",.25],["Lunch",.25],["Diner",.30],["Snacks en shake",.20]];
  h+=`<h2>Verdeling over de dag</h2><div class="card"><div class="mtable">${moments.map(([l,k])=>`<div class="mrow"><span>${l}</span><b>${r10(n.kcal*k)} kcal</b><span class="muted">${r5(n.protein*k)} g eiwit</span></div>`).join("")}</div><p class="hp small muted" style="margin-top:8px">Verdeel je eiwit over minstens 4 momenten van elk ${r5(0.4*n.w)}–${r5(0.5*n.w)} g. Bij <b>Voorbeelden</b> staan drie complete dagen op jouw dagdoel.</p></div>`;
  const nt=n.neatTxt;
  h+=`<h2>Hoe is dit berekend?</h2><div class="card"><div class="calc">
    <div><span>Ruststofwisseling (Mifflin-St Jeor)</span><b>${nl(r10(n.bmr))} kcal</b></div>
    ${nt?`<div><span>Basis × 1,2</span><b>${nl(r10(n.bmr*1.2))} kcal</b></div><div><span>Stappen (${nl(nt.steps)} per dag)</span><b>+${nl(r10(nt.stepK))} kcal</b></div>${nt.workK?`<div><span>Werk: ${esc(n.wk[1].toLowerCase())}</span><b>+${nl(r10(nt.workK))} kcal</b></div>`:""}`
      :`<div><span>${esc(n.wk[1])} × ${n.wk[2].toFixed(2).replace(".",",")}</span><b>${nl(r10(n.base))} kcal</b></div>`}
    <div><span>Trainingen (${n.sessions}× per week, gemiddeld per dag)</span><b>+${nl(r10(n.weekly/7))} kcal</b></div>
    <div><span>Onderhoud</span><b>${nl(r10(n.tdee))} kcal</b></div>
    <div><span>${n.manualK?"Handmatig dagdoel":"Aanpassing voor "+esc(g[1].toLowerCase())}</span><b>${n.adj>=0?"+":"−"}${nl(r10(Math.abs(n.adj)))} kcal</b></div>
    <div class="tot"><span>Dagdoel</span><b>${nl(r10(n.kcal))} kcal</b></div></div>
    <p class="hp small muted" style="margin-top:8px">BMI ${fmt1(n.bmi)}. Eiwit ${fmt1(n.pPerKg)} g/kg past bij ${esc(g[1].toLowerCase())}${n.ptype==="duur"?" met veel duursport":""}.${n.carbFloor?` Bij ± ${fmt1(n.endH)} uur duursport per week is ${n.carbFloor} g koolhydraten per kg de richtlijn.`:""}${n.weeks?` In dit tempo haal je je doelgewicht in ongeveer <b>${n.weeks} weken</b>.`:""} Weeg jezelf 1× per week op een vaste dag en een vast moment: blijft je gewicht 2–3 weken gelijk terwijl je wilt aankomen of afvallen, pas je dagdoel dan met 100–200 kcal aan.</p></div>`;
  const tips=isBulk(n.b.goal)?["Kom je moeilijk aan je calorieën? Voeg calorierijke extra's toe: noten, pindakaas, volle melk, granola of een extra boterham.",n.b.goal==="bulk_heavy"?"Bij een heavy bulk kom je sneller aan, maar ook met meer vet. Ga na een paar maanden terug naar een lean bulk of onderhoud.":"Een surplus van ± 200 kcal geeft spiergroei met zo weinig mogelijk extra vet.","Train progressief: zonder steeds iets zwaarder of meer reps heeft het surplus weinig effect."]
    :isCut(n.b.goal)?["Houd je eiwit hoog, zo behoud je je spiermassa tijdens het afvallen.","Vul je bord voor de helft met groente en kies magere eiwitbronnen: kipfilet, kwark, skyr, vis, eieren.","Blijf zwaar trainen. Het signaal om spieren te behouden komt van de training, niet van het dieet."]
    :["Eet ongeveer gelijk aan je verbruik en richt je op kwaliteit: volkoren, groente, fruit en vaste eiwitmomenten.","Schommelt je gewicht binnen 1 kg, dan zit je goed. Dat is vooral vocht en darminhoud.","Gebruik je trainingen om sterker te worden; je lichaam verandert dan langzaam richting meer spier."];
  if(n.ptype==="duur")tips.push("Plan je koolhydraten rond je duurtrainingen: een grotere portie rijst, pasta of havermout de maaltijd ervoor en erna.");
  h+=`<h2>Tips voor jouw doel</h2><div class="card"><ul class="hl">${tips.map(t=>`<li>${t}</li>`).join("")}</ul></div>
  <h2>Rond je training</h2><div class="card"><ul class="hl">
    <li><b>60–90 min ervoor:</b> koolhydraten met wat eiwit, licht verteerbaar. Bijvoorbeeld rijstwafels met kwark, of havermout met banaan.</li>
    <li><b>Binnen 1–2 uur erna:</b> 20–40 g eiwit met koolhydraten. Bijvoorbeeld een eiwitshake met melk en een banaan.</li>
    <li><b>Voor het slapen:</b> 30–40 g langzaam eiwit, zoals kwark of een caseïneshake.</li>
    <li><b>Duurtraining langer dan 75–90 min:</b> neem onderweg 30–60 g koolhydraten per uur, bij meer dan 2,5 uur tot 60–90 g per uur.</li>
    <li><b>Zelf sportdrank maken:</b> 50 g maltodextrine + 10 g dextrose + 30 g fructose in 600–750 ml water = 85 g koolhydraten.</li>
    <li><b>Drinken:</b> ± 35 ml per kg per dag (${fmt1(0.035*n.w)} liter), plus extra bij lange of warme trainingen.</li></ul></div>
  <p class="small muted" style="margin-top:12px">Dit is een richtlijn op basis van algemeen geaccepteerde formules, geen medisch advies. Heb je een medische aandoening, een eetstoornis of twijfel, overleg dan met een huisarts of diëtist.</p>`;
  return h;
}
async function saveNut(reset){
  const old=S.meta.body||{};let nut=null;
  if(!reset){const e=UI.nutEdit||{},k=num(e.kcal),p=num(e.p),c=num(e.c),f=num(e.f);nut={};
    if(k){if(k<1000||k>7000){toast("Vul een dagdoel tussen 1.000 en 7.000 kcal in.");return}nut.kcal=Math.round(k)}
    if(p!=null||c!=null||f!=null){if(p==null||c==null||f==null||Math.abs(p+c+f-100)>=0.6){toast("Vul alle drie de percentages in, samen 100%.");return}nut.pct={p,c,f}}
    if(!nut.kcal&&!nut.pct)nut=null}
  const data={...old};if(nut)data.nut=nut;else delete data.nut;
  await put("meta","body",data);UI.nutEdit=null;toastOk(nut?"Eigen dagdoel opgeslagen":"Terug naar het advies");render();
}

