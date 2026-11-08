/* ---------- v6: maaltijden, maaltijdplannen, boodschappen ---------- */
const MEAL_LIB=[
 {id:"m-oats",n:"Overnight oats met koffie en jus",cats:["ontbijt"],items:[["havermout",60],["griekse_van",100],["chiazaad",5],["noten_mix",10],["melk_vol",80],["whey",20],["aardbei",100],["pindakaas",20],["koffie",150],["jus_sinaas",200]]},
 {id:"m-eggs",n:"Eieren met brood, paprika en tomaat",cats:["ontbijt", "lunch"],items:[["ei",165],["paprika",75],["tomaat",100],["brood_vk",70],["melk_hv",200]]},
 {id:"m-kwarkbowl",n:"Kwark met banaan en granola",cats:["ontbijt", "snack"],items:[["kwark_mager",250],["banaan",120],["granola",30]]},
 {id:"m-boterham",n:"Boterhammen met kaas en kipfilet",cats:["lunch", "ontbijt"],items:[["brood_vk",105],["halvarine",10],["kaas_30",30],["kipbeleg",30],["komkommer",50]]},
 {id:"m-wrap",n:"Wraps met kip en groente",cats:["lunch", "diner"],items:[["wrap",120],["kipfilet_b",100],["sla",30],["tomaat",75],["knoflooksaus",20]]},
 {id:"m-eiersalade",n:"Bolletjes met eiersalade",cats:["lunch"],items:[["bol_vk",120],["eiersalade",40],["tomaat",75]]},
 {id:"m-kipkerrie",n:"Kip kerrie met rijst en sperziebonen",cats:["diner"],items:[["rijst",75],["kipfilet",75],["roomboter",6],["cremefraiche",50],["sperzie",150]]},
 {id:"m-rijstsate",n:"Rijst met kip, wokgroente en satésaus",cats:["diner"],items:[["rijst",75],["kipfilet",125],["wokmix",200],["satesaus",50],["olijfolie",5]]},
 {id:"m-bolognese",n:"Macaroni bolognese",cats:["diner"],items:[["pasta_vk",75],["ui",50],["wortel",50],["ontbijtspek",25],["olijfolie",4],["gehakt_mager",75],["passata",170],["melk_vol",25],["parmezaan",12]]},
 {id:"m-pesto",n:"Pasta pesto met kip en tomaat",cats:["diner"],items:[["pasta",75],["kipfilet_b",50],["tomaat",125],["sla",20],["pesto",24],["kaas_jong",19]]},
 {id:"m-avg",n:"Aardappelen, sperziebonen en gehaktbal",cats:["diner"],items:[["aardappel",250],["sperzie",200],["gehaktbal",100],["jus",50]]},
 {id:"m-stamppot",n:"Stamppot boerenkool met rookworst",cats:["diner"],items:[["aardappel",250],["boerenkool",200],["rookworst",75],["melk_hv",30],["roomboter",10]]},
 {id:"m-krieltjes",n:"Krieltjes met kipfilet en broccoli",cats:["diner"],items:[["krieltjes",250],["kipfilet",150],["broccoli",200]]},
 {id:"m-shake",n:"Eiwitshake met melk",cats:["snack"],items:[["whey",30],["melk_hv",300]]},
 {id:"m-rijstwafel",n:"Rijstwafels met pindakaas",cats:["snack"],items:[["rijstwafel",16],["pindakaas",15]]},
 {id:"m-kwarkfruit",n:"Kwark met blauwe bessen",cats:["snack", "ontbijt"],items:[["kwark_mager",150],["blauwebes",75]]}
].map(m=>({...m,lib:true,items:m.items.map(([fid,g])=>({fid,g}))}));
function mealCats(m){return m.cats&&m.cats.length?m.cats:[m.cat||"ontbijt"]}
const catNames=m=>mealCats(m).map(c=>(MEALS.find(x=>x[0]===c)||["",""])[1]).join(" · ");
function mealsAll(){return [...Object.entries(S.meals||{}).map(([id,m])=>({...m,id:"u:"+id})),...MEAL_LIB]}
function mealById(id){return id&&id.startsWith("u:")?(S.meals[id.slice(2)]?{...S.meals[id.slice(2)],id}:null):MEAL_LIB.find(m=>m.id===id)||null}
function partFood(it){return it.food||anyFood(it.fid)}
function mealParts(m,mul){return (m.items||[]).map(it=>({f:partFood(it),fid:it.fid||null,g:it.g*(mul||1)})).filter(x=>x.f)}
function partsMacros(ps){return ps.reduce((s,x)=>{const q=x.g/100;s.k+=x.f.k*q;s.p+=x.f.p*q;s.c+=x.f.c*q;s.f+=x.f.f*q;return s},{k:0,p:0,c:0,f:0})}
function partsCost(ps){let use=0,pkg=0,unknown=0;for(const x of ps){const f=x.fid&&FOOD[x.fid];if(!f){unknown++;continue}const eur=priceOf(f);use+=x.g/1000*eur;pkg+=Math.max(1,Math.ceil(x.g/f.pkg-0.05))*f.pkg/1000*eur}return{use,pkg,unknown}}
const eur=n=>"€ "+n.toFixed(2).replace(".",",");
function mealAllowed(m){const p=prefs();return (m.items||[]).every(it=>{const f=it.fid&&FOOD[it.fid];return !f||foodAllowed(f,p)})}
function entryParts(e){if(e.t==="m"){const m=mealById(e.id);return m?mealParts(m,e.mul||1):[]}const f=anyFood(e.fid);return f?[{f,fid:e.fid,g:e.g}]:[]}
function entryName(e){if(e.t==="m"){const m=mealById(e.id);return m?m.n+((e.mul||1)!==1?` × ${String(e.mul).replace(".",",")}`:""):"(verwijderde maaltijd)"}const f=anyFood(e.fid);return f?f.n:"(onbekend product)"}

/* voeding-tabbladen */
function viewFood(){
  const n=nutrition();
  if(n.miss)return `<h2>Voeding</h2><div class="card empty"><strong>Vul eerst je profiel in</strong><p class="muted">Voor een persoonlijk advies mist nog: ${n.miss.join(", ")}.</p><button class="btn primary" data-act="go-profile">Naar Profiel</button></div>`;
  const tabs=[["advies","Advies"],["plannen","Plannen"],["dagboek","Dagboek"],["shop","Boodschappen"]].filter(([k])=>k==="advies"||subOn("food",k));
  let t=UI.foodTab||"advies";if(t==="dagen")t="plannen";if(!tabs.some(x=>x[0]===t))t="advies";
  return (tabs.length<2?"":`<div class="seg ${spSeg(tabs.length)} foodtabs" role="tablist">${tabs.map(([k,l])=>`<button class="segb" role="tab" data-act="n-tab" data-v="${k}" aria-pressed="${t===k}">${l}</button>`).join("")}</div>`)+({advies:viewAdvice,plannen:viewPlans,dagboek:viewDiary,shop:viewShop}[t]||viewAdvice)(n);
}
function macroBars(n,tot,compact){
  const row=(l,v,t,u)=>{const pc=t?Math.min(100,v/t*100):0,rest=t-v;return `<div class="pbar"><div class="pl"><span>${l}</span><span><b>${nl(v)}</b> / ${nl(t)} ${u} · <span class="${rest<0?"over-t":""}">${rest>=0?"nog "+nl(rest):nl(-rest)+" te veel"}</span></span></div><div class="pt"><span style="width:${pc}%" class="${v>t*1.08?"over":""}"></span></div></div>`};
  return `<div class="card stack macrobars${compact?" sticky":""}">${row("Calorieën",tot.k,n.kcal,"kcal")}${row("Eiwit",tot.p,n.protein,"g")}${row("Koolhydraten",tot.c,n.carbs,"g")}${row("Vet",tot.f,n.fat,"g")}</div>`;
}
function viewPlans(n){
  if(UI.planEdit)return viewPlanEditor(n);
  if(UI.mealEdit)return viewMealEditor(n);
  if(UI.prefOpen)return `<h2>Mijn voorkeuren</h2>`+viewPrefs();
  const plans=Object.entries(S.mealplans||{}).sort((a,b)=>(b[1].updated||0)-(a[1].updated||0));
  let h=`<h2>Mijn maaltijdplannen</h2>`;
  h+=plans.length?`<div class="stack">${plans.map(([id,p])=>{const ps=(p.entries||[]).flatMap(entryParts),m=partsMacros(ps),c=partsCost(ps);
    return `<button class="card start" data-act="mp-open" data-id="${id}"><span><span class="name">${esc(p.n||"Maaltijdplan")}</span><br><span class="muted small">${nl(m.k)} kcal · ${Math.round(m.p)} g eiwit · ± ${eur(c.use)} per dag</span></span><span class="go">Open</span></button>`}).join("")}</div>`
    :`<div class="card empty"><p class="muted">Stel je eigen dag samen uit maaltijden en producten. Je ziet meteen hoeveel van je dagdoel elke maaltijd gebruikt.</p></div>`;
  h+=`<div class="btnrow" style="margin-top:10px"><button class="btn primary" data-act="mp-new">+ Nieuw maaltijdplan</button><button class="btn" data-act="n-pref-open">Voorkeuren</button></div>`;
  h+=`<h2>Voorbeelden op jouw dagdoel</h2><p class="small muted" style="margin:0 0 8px">Gemaakt op basis van je voorkeuren, ± ${nl(r10(n.kcal))} kcal. Kopieer er een om hem aan te passen.</p>`;
  exampleDays(n).forEach((items,di)=>{
    const ps=items.map(it=>({f:FOOD[it.id],fid:it.id,g:it.g})),tot=partsMacros(ps),c=partsCost(ps),open=UI.dayOpen===di;
    h+=`<section class="card dayplan"><button class="fhead" data-act="n-day" data-v="${di}" aria-expanded="${open}"><span class="fname">Voorbeelddag ${"ABC"[di]}</span><span class="small muted">${nl(r10(tot.k))} kcal · ${eur(c.use)}</span><span class="chev" aria-hidden="true">${open?"▾":"▸"}</span></button>`;
    if(open){h+=`<div class="fbody">`+MEALS.map(([m,l])=>{const its=items.filter(it=>it.meal===m);if(!its.length)return "";const mps=its.map(it=>({f:FOOD[it.id],fid:it.id,g:it.g})),mt=partsMacros(mps),mc=partsCost(mps);
        return `<div class="meal"><div class="mh"><b>${l}</b><span class="small muted">${mTxt(mt)} · ${eur(mc.use)}</span></div>${its.map(it=>{const mm=macrosOf(it);return `<div class="fline"><span class="fq">${portionTxt(it)}</span><span class="fn">${esc(FOOD[it.id].n)}</span><span class="fm">${nl(mm.k)} kcal · ${fmt1(mm.p)} E · ${eur(it.g/1000*priceOf(FOOD[it.id]))}</span></div>`}).join("")}</div>`}).join("")+
      `<div class="daytot"><div><span class="ml">Totaal</span><b>${nl(tot.k)} kcal</b></div><div><span class="ml">Eiwit</span><b>${Math.round(tot.p)} g</b></div><div><span class="ml">Koolh.</span><b>${Math.round(tot.c)} g</b></div><div><span class="ml">Vet</span><b>${Math.round(tot.f)} g</b></div></div>
      <p class="small muted" style="margin:6px 0 0">Kosten van wat je gebruikt: <b>${eur(c.use)}</b> · alle verpakkingen samen ${eur(c.pkg)}. Rijst, pasta en couscous zijn ongekookt gewogen.</p>
      <div class="btnrow" style="margin-top:10px"><button class="btn primary" data-act="mp-from-ex" data-v="${di}">Kopiëren als mijn plan</button><button class="btn" data-act="n-day-log" data-v="${di}">In dagboek van vandaag</button></div></div>`}
    h+=`</section>`;
  });
  h+=`<div class="btnrow" style="margin-top:8px"><button class="btn" data-act="n-reroll">Andere voorbeelden</button></div>`;
  h+=`<h2>Maaltijden</h2><p class="small muted" style="margin:0 0 8px">Vaste combinaties die je met één tik in je dagboek of plan zet. Een maaltijd staat onder elk kopje waarvoor hij is aangevinkt.</p>`;
  for(const [k,l] of MEALS){const ms=mealsAll().filter(m=>mealCats(m).includes(k));if(!ms.length)continue;
    h+=`<div class="mealhead">${l}</div><div class="recgroup">${ms.map(m=>{const ps=mealParts(m,1),mm=partsMacros(ps),c=partsCost(ps),key=k+"|"+m.id,open=UI.mealOpen===key;
      return `<div class="row mealrow"><button class="mrowbtn" data-act="ml-toggle" data-v="${esc(key)}"><span class="n">${esc(m.n)}${m.lib?"":` <span class="chip">eigen</span>`}${mealAllowed(m)?"":` <span class="chip warnchip">past niet bij voorkeuren</span>`}</span><span class="b none">${nl(mm.k)} kcal</span><span class="l">${Math.round(mm.p)} E · ${Math.round(mm.c)} K · ${Math.round(mm.f)} V · ${eur(c.use)} per keer${mealCats(m).length>1?` · ook bij ${esc(catNames(m))}`:""}</span></button>
        ${open?`<div class="mdetail">${ps.map(x=>`<div class="fline"><span class="fq">${Math.round(x.g)} g</span><span class="fn">${esc(x.f.n)}</span><span class="fm">${nl(x.f.k*x.g/100)} kcal${x.fid&&FOOD[x.fid]?` · ${eur(x.g/1000*priceOf(FOOD[x.fid]))}`:""}</span></div>`).join("")}<p class="small muted" style="margin:6px 0">Verpakkingen samen ${eur(c.pkg)}${c.unknown?` · ${c.unknown} product zonder prijs`:""}</p><div class="btnrow">${m.lib?`<button class="btn" data-act="ml-copy" data-v="${m.id}">Kopiëren en aanpassen</button>`:`<button class="btn" data-act="ml-edit" data-v="${m.id}">Bewerken</button>`}<button class="btn" data-act="share-meal" data-v="${m.id}">Delen</button>${m.lib?"":`<button class="btn ghost danger" data-act="ml-del" data-v="${m.id}">Verwijderen</button>`}</div></div>`:""}</div>`}).join("")}</div>`}
  h+=`<button class="btn block" style="margin-top:10px" data-act="ml-new">+ Eigen maaltijd samenstellen</button>`;
  const mf=myFoods();
  h+=`<h2>Mijn producten</h2>${mf.length?`<div class="recgroup">${mf.map(f=>`<div class="row logrow"><span class="n">${esc(f.n)}</span><span class="b none">${nl(f.k)} kcal</span><span class="l">per 100 g · ${fmt1(f.p)} E · ${fmt1(f.c)} K · ${fmt1(f.f)} V <button class="linkbtn" data-act="share-prod" data-v="${f.id}">delen</button> <button class="linkbtn danger" data-act="prod-del" data-v="${f.id}">verwijderen</button></span></div>`).join("")}</div>`:`<p class="small muted">Producten die je zelf toevoegt of opzoekt in Open Food Facts worden hier automatisch onthouden.</p>`}`;
  h+=`<h2>Gedeelde maaltijd of product toevoegen</h2><div class="card stack"><p class="hp">Heeft iemand een maaltijd of product met je gedeeld? Vul de deelcode in.</p><div class="codeinput"><input type="text" id="nsh-code" placeholder="Bijv. 7KQ2MX" autocapitalize="characters" autocomplete="off" maxlength="8"><button class="btn primary" data-act="nsh-lookup">Bekijken</button></div></div>`;
  return h;
}
function viewPlanEditor(n){
  const p=UI.planEdit,ps=p.entries.flatMap(entryParts),tot=partsMacros(ps),c=partsCost(ps);
  let h=`<div class="wohead"><div class="title">Maaltijdplan</div><button class="linkbtn" data-act="mp-close">← Terug naar plannen</button></div>
    <label class="f" style="margin-top:10px">Naam<input type="text" id="mp-name" value="${esc(p.n)}" placeholder="Bijv. Trainingsdag" autocomplete="off"></label>
    ${macroBars(n,tot,true)}<p class="small muted" style="margin:4px 0 0">Kosten van wat je gebruikt: <b>${eur(c.use)}</b> per dag${c.unknown?` (${c.unknown} product zonder prijs)`:""}.</p>`;
  for(const [m,l] of MEALS){const es=p.entries.map((e,i)=>({...e,i})).filter(e=>e.slot===m),sp=es.flatMap(entryParts),st=partsMacros(sp),sc=partsCost(sp);
    h+=`<h2>${l}${es.length?` · ${nl(st.k)} kcal · ${Math.round(st.k/n.kcal*100)}% van je dag`:""}</h2><div class="recgroup">${es.map(e=>{const ep=entryParts(e),em=partsMacros(ep),ec=partsCost(ep);
      return `<div class="row logrow"><span class="n">${esc(entryName(e))}</span><span class="b none">${e.t==="p"?Math.round(e.g)+" g":""}</span><span class="l">${nl(em.k)} kcal · ${Math.round(em.p)} E · ${Math.round(em.c)} K · ${Math.round(em.f)} V · ${eur(ec.use)}${e.t==="m"?` <select class="mulsel" id="mpmul-${e.i}" aria-label="Portie">${[0.5,1,1.5,2].map(x=>`<option value="${x}" ${(e.mul||1)===x?"selected":""}>${String(x).replace(".",",")}×</option>`).join("")}</select>`:""} <button class="linkbtn danger" data-act="mp-del-entry" data-v="${e.i}">verwijderen</button></span></div>`}).join("")}<button class="row addrow" data-act="mp-add" data-v="${m}"><span class="n">+ Maaltijd of product toevoegen</span></button></div>`}
  h+=`<div class="stack" style="margin-top:14px"><button class="btn primary" data-act="mp-save">Plan opslaan</button><div class="btnrow"><button class="btn" data-act="mp-log">In dagboek van vandaag</button><button class="btn" data-act="mp-shop">Boodschappen</button></div>${sendRow("food","mp-send","")}${p.id?(UI.confirm==="mp-del"?`<div class="confirm"><span>Dit maaltijdplan verwijderen?</span><div class="btnrow"><button class="btn danger" data-act="mp-del-yes">Verwijderen</button><button class="btn" data-act="confirm-no">Behouden</button></div></div>`:`<button class="btn ghost danger" data-act="mp-del">Plan verwijderen</button>`):""}</div>`;
  return h;
}
function viewMealEditor(n){
  const m=UI.mealEdit,ps=m.items.map(it=>({f:partFood(it),fid:it.fid||null,g:it.g})).filter(x=>x.f),tot=partsMacros(ps),c=partsCost(ps);
  return `<div class="wohead"><div class="title">${m.id?"Maaltijd bewerken":"Eigen maaltijd"}</div><button class="linkbtn" data-act="ml-close">← Terug</button></div><div class="card stack" style="margin-top:10px">
    <label class="f">Naam<input type="text" id="ml-name" value="${esc(m.n)}" placeholder="Bijv. Mijn vaste ontbijt" autocomplete="off"></label>
    <div class="f">Laat zien bij <i>meerdere mogelijk</i><div class="chips">${MEALS.map(([k,l])=>`<button class="chipb" data-act="ml-cat-t" data-v="${k}" aria-pressed="${(m.cats||[]).includes(k)}">${l}</button>`).join("")}</div></div>
    <div>${m.items.map((it,i)=>{const f=partFood(it);return f?`<div class="edititem"><div><strong>${esc(f.n)}</strong><br><span class="small muted">${nl(f.k*it.g/100)} kcal · ${fmt1(f.p*it.g/100)} E</span></div><div class="icons"><input class="num gin" id="mlg-${i}" inputmode="decimal" value="${it.g}" aria-label="Gram ${esc(f.n)}"><span class="small muted">g</span><button class="ib" data-act="ml-rm" data-v="${i}" aria-label="Verwijder">✕</button></div></div>`:""}).join("")||`<p class="muted small" style="margin:0">Nog geen producten.</p>`}</div>
    <button class="btn" data-act="ml-add">+ Product toevoegen</button>
    <div class="daytot"><div><span class="ml">Totaal</span><b>${nl(tot.k)} kcal</b></div><div><span class="ml">Eiwit</span><b>${Math.round(tot.p)} g</b></div><div><span class="ml">Koolh.</span><b>${Math.round(tot.c)} g</b></div><div><span class="ml">Vet</span><b>${Math.round(tot.f)} g</b></div></div>
    <p class="small muted" style="margin:0">± ${eur(c.use)} per keer · verpakkingen samen ${eur(c.pkg)}</p>
    <button class="btn primary" data-act="ml-save">Maaltijd opslaan</button></div>`;
}
/* kiezer voor plan / maaltijd */
function pickSheet(sh){
  const n=nutrition(),q=norm(sh.q||"");
  if(sh.pick){
    if(sh.pick.t==="m"){const m=mealById(sh.pick.id),mul=sh.pick.mul||1,ps=mealParts(m,mul),mm=partsMacros(ps),c=partsCost(ps);
      return `<div class="sh"><h2>${esc(m.n)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
        <div class="f">Portie<div class="chips">${[0.5,1,1.5,2].map(x=>`<button class="chipb" data-act="pk-mul" data-v="${x}" aria-pressed="${mul===x}">${String(x).replace(".",",")}×</button>`).join("")}</div></div>
        ${ps.map(x=>`<div class="fline"><span class="fq">${Math.round(x.g)} g</span><span class="fn">${esc(x.f.n)}</span></div>`).join("")}
        <div class="livespeed">${mTxt(mm)}</div><p class="small muted" style="margin:0">Dit is <b>${Math.round(mm.k/n.kcal*100)}%</b> van je dagdoel en ${Math.round(mm.p/n.protein*100)}% van je eiwit · ± ${eur(c.use)}</p>
        <button class="btn primary" data-act="pk-add">Toevoegen</button><button class="linkbtn" data-act="pk-back">← Andere keuze</button></div>`}
    const f=anyFood(sh.pick.fid),g=num(sh.pick.g)||f.por||100,mm={k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100};
    return `<div class="sh"><h2>${esc(f.n)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
      <label class="f">Hoeveel gram?<input type="text" inputmode="decimal" id="pk-g" value="${esc(sh.pick.g??(f.por||100))}"></label>
      <div class="livespeed" id="pk-live">${mTxt(mm)}</div>${sh.target==="plan"?`<p class="small muted" style="margin:0">${Math.round(mm.k/n.kcal*100)}% van je dagdoel</p>`:""}
      <button class="btn primary" data-act="pk-add">Toevoegen</button><button class="linkbtn" data-act="pk-back">← Andere keuze</button></div>`;
  }
  const mode=sh.target==="meal"||sh.target==="shop"?"p":(sh.mode||"m");
  let h=`<div class="sh"><h2>${sh.target==="shop"?"Op je boodschappenlijst":sh.target==="meal"?"Product toevoegen":esc((MEALS.find(x=>x[0]===sh.slot)||MEALS[0])[1])+" · toevoegen"}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>`;
  if(sh.target!=="meal"&&sh.target!=="shop")h+=`<div class="seg seg2" style="margin-bottom:8px"><button class="segb" data-act="pk-mode" data-v="m" aria-pressed="${mode==="m"}">Maaltijden</button><button class="segb" data-act="pk-mode" data-v="p" aria-pressed="${mode==="p"}">Producten</button></div>`;
  h+=`<input type="search" id="pk-search" placeholder="${mode==="m"?"Zoek een maaltijd":"Zoek een product"}" value="${esc(sh.q||"")}" autocomplete="off">`;
  if(mode==="m"){const ms=mealsAll().filter(m=>(sh.all||mealCats(m).includes(sh.slot))&&(!q||norm(m.n).includes(q)));
    h+=`<div class="card" style="margin-top:10px;padding:4px 12px">${ms.map(m=>{const mm=partsMacros(mealParts(m,1));return `<button class="pickitem" data-act="pk-meal" data-v="${m.id}"><span>${esc(m.n)}${mealAllowed(m)?"":` <span class="muted small">· past niet bij voorkeuren</span>`}</span><span class="small muted">${nl(mm.k)} kcal · ${Math.round(mm.k/n.kcal*100)}%</span></button>`}).join("")||`<p class="muted small" style="padding:10px 0;margin:0">Geen maaltijd gevonden.</p>`}</div>${sh.all?"":`<button class="linkbtn" data-act="pk-all">Ook maaltijden van andere kopjes tonen</button>`}`}
  else{const all=[...myFoods(),...FOODS],res=(q?all.filter(f=>norm(f.n).includes(q)):all.filter(f=>f.cat!=="snacks")).slice(0,q?40:25);
    h+=`<div class="card" style="margin-top:10px;padding:4px 12px">${res.map(f=>`<button class="pickitem" data-act="pk-prod" data-v="${f.id}"><span>${esc(f.n)}</span><span class="small muted">${nl(f.k)} kcal /100 ${isMl(f)?"ml":"g"}</span></button>`).join("")||`<p class="muted small" style="padding:10px 0;margin:0">Niet gevonden. Voeg het via het Dagboek toe als eigen product.</p>`}</div>${q?"":`<p class="small muted">Typ om in alle ${FOODS.length} producten te zoeken.</p>`}`}
  return h;
}
EXTRA_SHEETS["plan-pick"]=pickSheet;
function saveMealAsSheet(sh){return `<div class="sh"><h2>Opslaan als maaltijd</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><p class="hp">Bewaar je ${esc((MEALS.find(x=>x[0]===sh.meal)||MEALS[0])[1].toLowerCase())} van ${esc(dayName(sh.date).toLowerCase())} als vaste maaltijd. Volgende keer klik je hem in één keer aan.</p><label class="f">Naam<input type="text" id="sm-name" placeholder="Bijv. Mijn vaste ontbijt" autocomplete="off"></label><button class="btn primary" data-act="sm-save">Opslaan</button></div>`}
EXTRA_SHEETS["save-meal"]=saveMealAsSheet;

/* boodschappen */
function shopState(){const k="krachtlogboek.shop2."+pid;if(!UI.shop2)UI.shop2=lsGet(k)||{src:null,off:{},have:{}};return UI.shop2}
function shopSave(){lsSet("krachtlogboek.shop2."+pid,UI.shop2)}
function shopSources(n){
  const out=Object.entries(S.mealplans||{}).map(([id,p])=>({key:"p:"+id,n:p.n||"Maaltijdplan",entries:p.entries||[]}));
  exampleDays(n).forEach((items,di)=>out.push({key:"ex:"+di,n:"Voorbeelddag "+"ABC"[di],entries:items.map(it=>({slot:it.meal,t:"p",fid:it.id,g:it.g}))}));
  return out;
}
function viewShop(n){
  const st=shopState(),srcs=shopSources(n);
  if(!st.src){st.src={};const mine=srcs.filter(s=>s.key.startsWith("p:"));if(mine.length)st.src[mine[0].key]=7;else{st.src["ex:0"]=3;st.src["ex:1"]=2;st.src["ex:2"]=2}}
  const units=[];
  for(const s of srcs){const days=st.src[s.key]||0;if(!days)continue;
    const grp={};for(const e of s.entries){if(e.t==="m"){units.push({key:s.key+"|m|"+e.id+"|"+e.slot,n:entryName(e),src:s.n,days,parts:entryParts(e)})}else(grp[e.slot]=grp[e.slot]||[]).push(e)}
    for(const [slot,es] of Object.entries(grp))units.push({key:s.key+"|s|"+slot,n:`${(MEALS.find(x=>x[0]===slot)||MEALS[0])[1]}`,src:s.n,days,parts:es.flatMap(entryParts)});
  }
  const prod={};let use=0;
  for(const u of units){if(st.off[u.key])continue;const c=partsCost(u.parts);use+=c.use*u.days;for(const x of u.parts){if(!x.fid||!FOOD[x.fid])continue;prod[x.fid]=(prod[x.fid]||0)+x.g*u.days}}
  const rows=Object.entries(prod).map(([fid,g])=>{const f=FOOD[fid],packs=Math.max(1,Math.ceil(g/f.pkg-0.05)),cost=packs*f.pkg/1000*priceOf(f);return{f,g,packs,cost,have:!!st.have[fid]}});
  const buy=rows.filter(r=>!r.have).reduce((t,r)=>t+r.cost,0),nd=Object.values(st.src).reduce((a,b)=>a+(b||0),0);
  let h=`<div class="card stack shopsum"><div class="shoptot"><span>Te kopen</span><b>${eur(buy)}</b></div><span class="small muted">Hele verpakkingen van de aangevinkte producten. Wat je werkelijk opeet kost ± ${eur(use)}${nd?`, ± ${eur(use/nd)} per dag`:""}.</span></div>
  <h2>1 · Welke dagen?</h2><div class="card stack">${srcs.map(s=>`<div class="srcrow"><span>${esc(s.n)}</span><select id="shs-${esc(s.key)}" aria-label="Aantal dagen ${esc(s.n)}">${[0,1,2,3,4,5,6,7].map(v=>`<option value="${v}" ${(st.src[s.key]||0)===v?"selected":""}>${v} ${v===1?"dag":"dagen"}</option>`).join("")}</select></div>`).join("")}</div>
  <h2>2 · Maaltijden</h2><div class="recgroup">${units.length?units.map(u=>{const c=partsCost(u.parts),off=!!st.off[u.key];return `<button class="row shoprow${off?" ck":""}" data-act="sh-unit" data-v="${esc(u.key)}"><span class="n">${off?"☐":"☑"} ${esc(u.n)}</span><span class="b none">${eur(c.use*u.days)}</span><span class="l">${esc(u.src)} · ${u.days}× · ${eur(c.use)} per keer</span></button>`}).join(""):`<p class="muted small" style="padding:10px 14px;margin:0">Kies hierboven een plan of voorbeelddag.</p>`}</div>
  <h2>3 · Producten</h2><p class="small muted" style="margin:0 0 6px">Tik op een product dat je al in huis hebt; dat telt dan niet mee.</p>`;
  for(const [c,l] of FCATS){const rs=rows.filter(r=>r.f.cat===c);if(!rs.length)continue;
    h+=`<div class="recgroup" style="margin-bottom:8px"><div class="row" style="cursor:default;padding:6px 14px"><span class="n small muted">${l}</span></div>${rs.map(r=>`<button class="row shoprow${r.have?" ck":""}" data-act="sh-have" data-v="${r.f.id}"><span class="n">${r.have?"✓ heb ik al · ":""}${esc(r.f.n)}</span><span class="b none">${eur(r.cost)}</span><span class="l">${r.g>=1000?fmt1(r.g/1000)+" kg":Math.round(r.g)+" g"} nodig · ${r.packs} × ${r.f.pkg>=1000?fmt1(r.f.pkg/1000)+" kg":r.f.pkg+" g"} · ${eur(priceOf(r.f))}/kg</span></button>`).join("")}</div>`}
  h+=`<div class="btnrow" style="margin-top:12px"><button class="btn" data-act="n-shop-copy">Lijst kopiëren</button><button class="btn" data-act="sh-reset">Vinkjes wissen</button></div>
  <h2>Aanbiedingen deze week</h2><div class="card stack"><p class="hp small">Prijzen in de app zijn schattingen. Bekijk de actuele aanbiedingen; live prijzen ophalen kan niet, de supermarkten bieden daar geen officiële koppeling voor.</p>
    <div class="btnrow"><a class="btn" href="https://www.ah.nl/bonus" target="_blank" rel="noopener">Albert Heijn</a><a class="btn" href="https://www.jumbo.com/aanbiedingen/nu" target="_blank" rel="noopener">Jumbo</a><a class="btn" href="https://www.lidl.nl" target="_blank" rel="noopener">Lidl</a></div></div>`;
  if(S.me&&S.me.isAdmin)h+=`<button class="btn block" style="margin-top:12px" data-act="n-prices">Prijzen bijwerken (beheerder)</button>`;
  UI.shopRows=rows;
  return h;
}

/* dagboek: maaltijden aanklikken en opslaan */
function diaryMealPick(sh){
  const m=mealById(sh.pickMeal),mul=sh.mul||1,ps=mealParts(m,mul),mm=partsMacros(ps);
  return `<div class="sh"><h2>${esc(m.n)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
    <div class="f">Portie<div class="chips">${[0.5,1,1.5,2].map(x=>`<button class="chipb" data-act="dm-mul" data-v="${x}" aria-pressed="${mul===x}">${String(x).replace(".",",")}×</button>`).join("")}</div></div>
    ${ps.map(x=>`<div class="fline"><span class="fq">${Math.round(x.g)} g</span><span class="fn">${esc(x.f.n)}</span></div>`).join("")}
    <div class="livespeed">${mTxt(mm)}</div>
    <button class="btn primary" data-act="dm-add">Toevoegen aan ${esc((MEALS.find(x=>x[0]===sh.meal)||MEALS[0])[1].toLowerCase())}</button><button class="linkbtn" data-act="dm-back">← Ander product of maaltijd</button></div>`;
}
const _foodAddSheet=foodAddSheet;
EXTRA_SHEETS["food-add"]=function(sh){
  if(sh.pickMeal)return diaryMealPick(sh);
  let h=_foodAddSheet(sh);
  if(!sh.pick&&!sh.custom&&!(sh.q||"").trim()){
    const ms=mealsAll().filter(m=>mealCats(m).includes(sh.meal));
    const block=ms.length?`<h2>Maaltijden</h2><div class="card" style="padding:4px 12px">${ms.map(m=>`<button class="pickitem" data-act="dm-pick" data-v="${m.id}"><span>${esc(m.n)}</span><span class="small muted">${nl(partsMacros(mealParts(m,1)).k)} kcal</span></button>`).join("")}</div>`:"";
    h=h.replace(/(<input type="search" id="fa-q"[^>]*>)/,"$1"+block);
  }
  return h;
};

/* doelgewicht met termijn */
const GOAL_RATE={afvallen:-0.9,droog_heavy:-0.75,droog_lean:-0.4,onderhoud:0,bulk_lean:0.25,bulk_heavy:0.45};
function timeline(b,w){
  if(!b.targetWeight||!b.tdate||!w)return null;
  const days=(Date.parse(b.tdate+"T12:00:00")-Date.parse(today()+"T12:00:00"))/864e5;
  if(days<7)return{level:"warn",msg:"Kies een datum voor je doelgewicht die minstens een week vooruit ligt."};
  const diff=b.targetWeight-w,weeks=days/7,rate=diff/weeks,pct=rate/w*100,ap=Math.abs(pct),g=b.goal;
  const kg=x=>fmt1(Math.abs(x)),dt=dateTxt(b.tdate);
  const sug=r=>{const wk=Math.ceil(Math.abs(diff)/(w*Math.abs(r)/100));return dateTxt(addDays(today(),wk*7))};
  if(Math.abs(diff)<0.5)return{level:"ok",msg:`Je zit al vrijwel op je doelgewicht.`};
  const base=`Om op ${dt} ${fmt1(b.targetWeight)} kg te wegen, moet je ± ${kg(rate)} kg per week ${diff>0?"aankomen":"afvallen"} (${fmt1(ap)}% van je gewicht).`;
  if(diff>0){
    if(pct>0.55)return{level:"warn",msg:`${base} Dat is eerder een dirty bulk: je komt dan vooral vet aan in plaats van spieren. Een haalbare datum met een heavy bulk is rond ${sug(0.45)}, met een lean bulk rond ${sug(0.25)}.`};
    if(isCut(g)||g==="onderhoud")return{level:"warn",msg:`${base} Dat past bij een ${pct>0.3?"heavy":"lean"} bulk, niet bij je gekozen doel.`};
    if(g==="bulk_lean"&&pct>0.3)return{level:"warn",msg:`${base} Dat tempo past meer bij een heavy bulk dan bij een lean bulk. Wil je lean blijven, mik dan op rond ${sug(0.25)}.`};
    if(g==="bulk_heavy"&&pct<=0.3)return{level:"info",msg:`${base} Dat lukt ook rustiger met een lean bulk, met minder extra vet.`};
    return{level:"ok",msg:`${base} Dat past goed bij je doel.`};
  }
  if(ap>1)return{level:"warn",msg:`${base} Dat is sneller dan gezond: je verliest dan ook spiermassa en houdt het moeilijk vol. Kies een latere datum, bijvoorbeeld rond ${sug(0.75)}.`};
  if(isBulk(g)||g==="onderhoud")return{level:"warn",msg:`${base} Dat past bij ${ap>0.5?"heavy droogtrainen of afvallen":"lean droogtrainen"}, niet bij je gekozen doel.`};
  if(g==="droog_lean"&&ap>0.5)return{level:"warn",msg:`${base} Dat tempo past meer bij heavy droogtrainen of afvallen. Wil je rustig droogtrainen, mik dan op rond ${sug(0.4)}.`};
  if((g==="droog_heavy"||g==="afvallen")&&ap<=0.5)return{level:"info",msg:`${base} Dat lukt ook rustiger met lean droogtrainen; daarmee behoud je makkelijker je spieren.`};
  return{level:"ok",msg:`${base} Dat past goed bij je doel.`};
}
function tlineHint(){const f=pfDraft(),b={...bodyMeta(),targetWeight:num(f.targetWeight),tdate:f.tdate,goal:f.goal},t=timeline(b,currentWeight());return `<span class="hintline tl-${t?t.level:"none"}" id="tl-hint">${t?esc(t.msg):"Vul een datum in om te zien of je doel realistisch is."}</span>`}

/* events v6 */
function planEntryAdd(e){UI.planEdit.entries.push(e);UI.sheet=null;render()}
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;
  const act=b.dataset.act,v=b.dataset.v,id=b.dataset.id;
  switch(act){
    case "mp-new":UI.planEdit={id:null,n:"",entries:[]};UI.confirm=null;render();window.scrollTo(0,0);break;
    case "mp-open":{const p=S.mealplans[id];UI.planEdit={id,n:p.n||"",entries:clone(p.entries||[])};UI.confirm=null;render();window.scrollTo(0,0);break}
    case "mp-from-ex":{const n=nutrition(),items=exampleDays(n)[+v];UI.planEdit={id:null,n:"Voorbeelddag "+"ABC"[+v],entries:items.map(it=>({slot:it.meal,t:"p",fid:it.id,g:it.g}))};render();window.scrollTo(0,0);toast("Kopie gemaakt. Pas aan en sla op.");break}
    case "mp-close":UI.planEdit=null;UI.confirm=null;render();window.scrollTo(0,0);break;
    case "mp-add":UI.sheet={type:"plan-pick",target:"plan",slot:v,mode:"m",q:""};render();break;
    case "mp-del-entry":UI.planEdit.entries.splice(+v,1);render();break;
    case "mp-save":{const p=UI.planEdit,nm=(document.getElementById("mp-name")?.value||p.n||"").trim()||"Mijn maaltijdplan",pid_=p.id||uid();await put("mealplans",pid_,{n:nm,entries:p.entries,updated:Date.now()});p.id=pid_;p.n=nm;toastOk("Maaltijdplan opgeslagen");render();break}
    case "mp-del":UI.confirm="mp-del";render();break;
    case "mp-del-yes":await del("mealplans",UI.planEdit.id);UI.planEdit=null;UI.confirm=null;toastOk("Maaltijdplan verwijderd");render();break;
    case "mp-log":{const d=today(),cur=logDay(d).slice();for(const e of UI.planEdit.entries){const ps=entryParts(e);if(!ps.length)continue;const m=partsMacros(ps);
        cur.push({meal:e.slot,fid:e.t==="p"?e.fid:null,mealId:e.t==="m"?e.id:null,name:entryName(e),g:Math.round(ps.reduce((t,x)=>t+x.g,0)),k:Math.round(m.k),p:+m.p.toFixed(1),c:+m.c.toFixed(1),f:+m.f.toFixed(1),items:e.t==="m"?ps.map(x=>x.fid?{fid:x.fid,g:x.g}:{food:{n:x.f.n,k:x.f.k,p:x.f.p,c:x.f.c,f:x.f.f},g:x.g}):undefined})}
      await put("foodlog",d,{date:d,items:cur});UI.planEdit=null;UI.foodTab="dagboek";UI.logDate=d;toastOk("Plan in je dagboek van vandaag gezet");render();window.scrollTo(0,0);break}
    case "mp-shop":{const p=UI.planEdit;if(!p.id){toast("Sla het plan eerst op.");return}const st=shopState();st.src={["p:"+p.id]:7};shopSave();UI.planEdit=null;UI.foodTab="shop";render();window.scrollTo(0,0);break}
    case "pk-mode":UI.sheet.mode=v;UI.sheet.q="";renderSheet();break;
    case "pk-meal":UI.sheet.pick={t:"m",id:v,mul:1};renderSheet();break;
    case "pk-prod":if(UI.sheet.target==="shop"){const st=shopState();const x=st.extra.find(e=>e.fid===v);if(x)x.packs=(x.packs||1)+1;else st.extra.push({id:uid(),fid:v,packs:1});shopSave();UI.sheet=null;toast(`${anyFood(v)?.n||"Product"} op je lijst gezet`);render();break}UI.sheet.pick={t:"p",fid:v,g:null};renderSheet();break;
    case "pk-mul":UI.sheet.pick.mul=+v;renderSheet();break;
    case "pk-back":UI.sheet.pick=null;renderSheet();break;
    case "pk-add":{const sh=UI.sheet,pk=sh.pick;
      if(pk.t==="p"){const f=anyFood(pk.fid),g=num(document.getElementById("pk-g")?.value)||f.por||100;if(g<=0||g>3000){toast("Vul een geldig aantal gram in.");return}
        if(sh.target==="meal"){UI.mealEdit.items.push({fid:pk.fid,g});UI.sheet=null;render();break}
        planEntryAdd({slot:sh.slot,t:"p",fid:pk.fid,g})}
      else planEntryAdd({slot:sh.slot,t:"m",id:pk.id,mul:pk.mul||1});
      break}
    case "ml-cat-t":{const c=UI.mealEdit.cats=UI.mealEdit.cats||[];const i=c.indexOf(v);if(i>=0)c.splice(i,1);else c.push(v);render();break}
    case "pk-all":UI.sheet.all=true;renderSheet();break;
    case "ml-toggle":UI.mealOpen=UI.mealOpen===v?null:v;render();break;
    case "ml-new":UI.mealEdit={id:null,n:"",cats:[],items:[]};render();window.scrollTo(0,0);break;
    case "ml-copy":{const m=mealById(v);UI.mealEdit={id:null,n:m.n+" (aangepast)",cats:[...mealCats(m)],items:clone(m.items)};render();window.scrollTo(0,0);break}
    case "ml-edit":{const m=mealById(v);UI.mealEdit={id:v.slice(2),n:m.n,cats:[...mealCats(m)],items:clone(m.items)};render();window.scrollTo(0,0);break}
    case "ml-del":await del("meals",v.slice(2));UI.mealOpen=null;toastOk("Maaltijd verwijderd");render();break;
    case "ml-close":UI.mealEdit=null;render();window.scrollTo(0,0);break;
    case "ml-add":UI.sheet={type:"plan-pick",target:"meal",mode:"p",q:""};render();break;
    case "ml-rm":UI.mealEdit.items.splice(+v,1);render();break;
    case "ml-save":{const m=UI.mealEdit,nm=(document.getElementById("ml-name")?.value||m.n||"").trim();if(!nm){toast("Geef de maaltijd een naam.");return}if(!m.items.length){toast("Voeg minstens één product toe.");return}if(!(m.cats||[]).length){toast("Kies bij welke maaltijd(en) hij hoort.");return}
      await put("meals",m.id||uid(),{n:nm,cats:m.cats,items:m.items});UI.mealEdit=null;toastOk(`Maaltijd "${nm}" opgeslagen`);render();window.scrollTo(0,0);break}
    case "sm-open":UI.sheet={type:"save-meal",meal:v,date:UI.logDate||today()};render();setTimeout(()=>document.getElementById("sm-name")?.focus(),30);break;
    case "sm-save":{const sh=UI.sheet,nm=(document.getElementById("sm-name")?.value||"").trim();if(!nm){toast("Geef de maaltijd een naam.");return}
      const items=[];for(const it of logDay(sh.date).filter(x=>x.meal===sh.meal)){if(it.items)items.push(...it.items);else if(it.fid)items.push({fid:it.fid,g:it.g});else if(it.g)items.push({food:{n:it.name,k:it.k/it.g*100,p:it.p/it.g*100,c:it.c/it.g*100,f:it.f/it.g*100},g:it.g})}
      await put("meals",uid(),{n:nm,cats:[sh.meal],items});UI.sheet=null;toastOk(`Opgeslagen als maaltijd "${nm}"`);render();break}
    case "dm-pick":UI.sheet.pickMeal=v;UI.sheet.mul=1;renderSheet();break;
    case "dm-mul":UI.sheet.mul=+v;renderSheet();break;
    case "dm-back":UI.sheet.pickMeal=null;renderSheet();break;
    case "dm-add":{const sh=UI.sheet,m=mealById(sh.pickMeal),ps=mealParts(m,sh.mul||1),mm=partsMacros(ps),d=UI.logDate||today();
      await logAdd(d,{meal:sh.meal,mealId:m.id,name:m.n+((sh.mul||1)!==1?` × ${String(sh.mul).replace(".",",")}`:""),g:Math.round(ps.reduce((t,x)=>t+x.g,0)),k:Math.round(mm.k),p:+mm.p.toFixed(1),c:+mm.c.toFixed(1),f:+mm.f.toFixed(1),items:ps.map(x=>x.fid?{fid:x.fid,g:x.g}:{food:{n:x.f.n,k:x.f.k,p:x.f.p,c:x.f.c,f:x.f.f},g:x.g})});
      UI.sheet=null;toastOk(`${m.n} toegevoegd`);render();break}
    case "sh-unit":{const st=shopState();st.off[v]=!st.off[v];shopSave();render();break}
    case "sh-have":{const st=shopState();st.have[v]=!st.have[v];shopSave();render();break}
    case "sh-reset":{const st=shopState();st.off={};st.have={};shopSave();render();break}
  }
});
document.addEventListener("input",ev=>{
  const t=ev.target,id=t.id||"";
  if(id==="pf-tdate"&&UI.pf){UI.pf.tdate=t.value;const el=document.getElementById("tl-hint");if(el)el.outerHTML=tlineHint()}
  else if((id==="pf-target")&&UI.pf){setTimeout(()=>{const el=document.getElementById("tl-hint");if(el)el.outerHTML=tlineHint()},0)}
  else if(id==="mp-name"&&UI.planEdit)UI.planEdit.n=t.value;
  else if(id==="ml-name"&&UI.mealEdit)UI.mealEdit.n=t.value;
  else if(/^mlg-\d+$/.test(id)&&UI.mealEdit){const g=num(t.value);if(g>0)UI.mealEdit.items[+id.slice(4)].g=g}
  else if(id==="pk-search"&&UI.sheet){UI.sheet.q=t.value;renderSheet();const el=document.getElementById("pk-search");if(el){el.focus();const n=el.value.length;try{el.setSelectionRange(n,n)}catch(e){}}}
  else if(id==="pk-g"&&UI.sheet&&UI.sheet.pick){UI.sheet.pick.g=t.value;const f=anyFood(UI.sheet.pick.fid),g=num(t.value)||0,el=document.getElementById("pk-live");if(el)el.textContent=mTxt({k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100})}
});
document.addEventListener("change",ev=>{
  const t=ev.target,id=t.id||"";
  if(/^mpmul-\d+$/.test(id)&&UI.planEdit){UI.planEdit.entries[+id.slice(6)].mul=+t.value;render()}
  else if(id==="ml-cat"&&UI.mealEdit)UI.mealEdit.cat=t.value;
  else if(/^mlg-\d+$/.test(id)&&UI.mealEdit)render();
  else if(id.startsWith("shs-")){const st=shopState();st.src[id.slice(4)]=+t.value;shopSave();render()}
});

