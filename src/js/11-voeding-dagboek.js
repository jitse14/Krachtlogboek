/* ---------- voeding: dagboek ---------- */
function myFoods(){return Object.entries(S.foods||{}).map(([id,f])=>({id:"c:"+id,...f,cat:"eigen"}))}
function anyFood(fid){if(!fid)return null;if(fid.startsWith("c:"))return S.foods[fid.slice(2)]?{id:fid,...S.foods[fid.slice(2)]}:null;return FOOD[fid]||null}
function logDay(d){return (S.foodlog[d]&&S.foodlog[d].items)||[]}
function viewDiary(n){
  const d=UI.logDate||today(),items=logDay(d),tot=sumM(items);
  const bar=(l,v,t,u)=>{const pc=t?Math.min(100,v/t*100):0;return `<div class="pbar"><div class="pl"><span>${l}</span><span><b>${nl(v)}</b> / ${nl(t)} ${u}</span></div><div class="pt"><span style="width:${pc}%" class="${v>t*1.08?"over":""}"></span></div></div>`};
  let h=`<div class="weekbar card"><button class="ib wkb" data-act="n-log-prev" aria-label="Vorige dag">‹</button><div class="wk"><b>${esc(dayName(d))}</b><span class="muted small">${items.length} product${items.length===1?"":"en"}</span></div><button class="ib wkb" data-act="n-log-next" aria-label="Volgende dag">›</button></div>
  <div class="card stack" style="margin-top:10px">${bar("Calorieën",tot.k,n.kcal,"kcal")}${bar("Eiwit",tot.p,n.protein,"g")}${bar("Koolhydraten",tot.c,n.carbs,"g")}${bar("Vet",tot.f,n.fat,"g")}
    <p class="small muted" style="margin:0">${tot.k?`Nog ${nl(Math.max(0,n.kcal-tot.k))} kcal en ${Math.max(0,Math.round(n.protein-tot.p))} g eiwit te gaan.`:"Nog niets geregistreerd voor deze dag."}</p></div>`;
  for(const [m,l] of MEALS){const its=items.map((it,i)=>({...it,i})).filter(it=>it.meal===m),mt=sumM(its);
    h+=`<h2>${l}${its.length?` · ${nl(mt.k)} kcal`:""}</h2><div class="recgroup">${its.map(it=>`<div class="row logrow"><span class="n">${esc(it.name)}</span><span class="b none">${it.g} ${uTxt(it)}</span><span class="l">${nl(it.k)} kcal · ${fmt1(it.p)} E · ${fmt1(it.c)} K · ${fmt1(it.f)} V <button class="linkbtn danger" data-act="n-log-del" data-v="${it.i}">verwijderen</button></span></div>`).join("")}<button class="row addrow" data-act="n-add" data-v="${m}"><span class="n">+ Toevoegen</span></button>${its.length?`<button class="row addrow" data-act="sm-open" data-v="${m}"><span class="n">☆ Opslaan als vaste maaltijd</span></button>`:""}</div>`}
  return h+`<p class="small muted" style="margin-top:12px">Producten uit Open Food Facts: gegevens © <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a>-bijdragers, beschikbaar onder de <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener">Open Database License</a>. Deze gegevens worden door vrijwilligers ingevoerd en kunnen fouten bevatten; controleer bij twijfel de verpakking.</p>`;
}
async function logAdd(d,entry){
  const cur=logDay(d).slice();cur.push(entry);await put("foodlog",d,{date:d,items:cur});
}
function foodAddSheet(sh){
  const q=norm(sh.q||"");
  if(sh.pick){const f=sh.pick,g=num(sh.g)||f.por||100,m={k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100};
    return `<div class="sh"><h2>${esc(f.n)}</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
      <span class="small muted">Per 100 ${faUnit(sh)}: ${nl(f.k)} kcal · ${fmt1(f.p)} g eiwit · ${fmt1(f.c)} g koolh. · ${fmt1(f.f)} g vet${f.brand?` · ${esc(f.brand)}`:""}</span>${faUnitSeg(faUnit(sh))}
      <label class="f">Hoeveel ${faUnit(sh)==="ml"?"ml":"gram"}?<input type="text" inputmode="decimal" id="fa-g" value="${esc(sh.g??(f.por||100))}"></label>
      ${f.u?`<div class="chips">${[1,2,3].map(x=>`<button class="chipb" data-act="n-fa-q" data-v="${f.u*x}">${x} × ${f.u} g</button>`).join("")}</div>`:f.por?`<div class="chips">${[0.5,1,1.5,2].map(x=>`<button class="chipb" data-act="n-fa-q" data-v="${Math.round(f.por*x)}">${Math.round(f.por*x)} ${faUnit(sh)}</button>`).join("")}</div>`:""}
      <div class="livespeed" id="fa-live">${mTxt(m)}</div>
      <button class="btn primary" data-act="n-fa-add">Toevoegen aan ${esc((MEALS.find(x=>x[0]===sh.meal)||MEALS[0])[1].toLowerCase())}</button>
      ${f.off?`<span class="small muted">Wordt automatisch onthouden bij je producten.</span>`:""}
      <button class="linkbtn" data-act="n-fa-back">← Ander product</button></div>`}
  if(sh.custom)return `<div class="sh"><h2>Eigen product</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
    <label class="f">Naam<input type="text" id="cf-n" value="${esc(sh.custom.n||"")}" placeholder="Bijv. proteïnepudding vanille"></label>
    ${faUnitSeg(sh.custom.ml?"ml":"g")}<span class="hintline" id="cf-unit-h">Voedingswaarden per 100 ${sh.custom.ml?"ml":"g"}, staan op de verpakking</span>
    <div class="grid2"><label class="f">Kcal<input type="text" inputmode="decimal" id="cf-k" value="${esc(sh.custom.k||"")}"></label><label class="f">Eiwit g<input type="text" inputmode="decimal" id="cf-p" value="${esc(sh.custom.p||"")}"></label><label class="f">Koolhydraten g<input type="text" inputmode="decimal" id="cf-c" value="${esc(sh.custom.c||"")}"></label><label class="f">Vet g<input type="text" inputmode="decimal" id="cf-f" value="${esc(sh.custom.f||"")}"></label></div>
    <label class="f">Normale portie <i>optioneel</i><input type="text" inputmode="decimal" id="cf-por" value="${esc(sh.custom.por||"")}" placeholder="g"></label>
    <button class="btn primary" data-act="n-cf-save">Opslaan en kiezen</button><button class="linkbtn" data-act="n-fa-back">← Terug</button></div>`;
  const recent=[];const seen=new Set();
  for(const d of Object.keys(S.foodlog).sort().reverse())for(const it of logDay(d).slice().reverse()){if(recent.length>=8)break;if(UI.sheet&&UI.sheet.meal&&it.meal!==UI.sheet.meal)continue;const k=it.fid||it.name;if(seen.has(k))continue;seen.add(k);recent.push(it)}
  const all=[...myFoods(),...FOODS];
  const res=q?all.filter(f=>norm(f.n).includes(q)).slice(0,30):[];
  let h=`<div class="sh"><h2>${esc((MEALS.find(x=>x[0]===sh.meal)||MEALS[0])[1])} · toevoegen</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
    <input type="search" id="fa-q" placeholder="Zoek een product" value="${esc(sh.q||"")}" autocomplete="off">`;
  if(!q){
    if(recent.length)h+=`<h2>Laatst gebruikt</h2><div class="card" style="padding:4px 12px">${recent.map((it,i)=>`<button class="pickitem" data-act="n-fa-recent" data-v="${i}"><span>${esc(it.name)}</span><span class="small muted">${it.g} ${uTxt(it)} · ${nl(it.k)} kcal</span></button>`).join("")}</div>`;
    h+=`<p class="small muted">Typ om te zoeken in ${FOODS.length} basisproducten${myFoods().length?` en je ${myFoods().length} eigen producten`:""}. Niet gevonden? Zoek in Open Food Facts of voeg zelf een product toe.</p>`;
  }else h+=`<div class="card" style="margin-top:10px;padding:4px 12px">${res.length?res.map(f=>`<button class="pickitem" data-act="n-fa-pick" data-v="${f.id}"><span>${esc(f.n)}</span><span class="small muted">${nl(f.k)} kcal /100 ${isMl(f)?"ml":"g"}</span></button>`).join(""):`<p class="muted small" style="padding:10px 0;margin:0">Niet in de lijst.</p>`}</div>`;
  if(sh.off)h+=`<h2>Open Food Facts</h2><div class="card" style="padding:4px 12px">${sh.off==="loading"?`<p class="muted small" style="padding:10px 0;margin:0">Zoeken…</p>`:sh.off==="error"?`<p class="muted small" style="padding:10px 0;margin:0">Zoeken lukte niet. Controleer je internet of probeer het later opnieuw.</p>`:sh.off.length?sh.off.map((f,i)=>`<button class="pickitem" data-act="n-fa-offpick" data-v="${i}"><span>${esc(f.n)}${f.brand?` <span class="muted small">· ${esc(f.brand)}</span>`:""}</span><span class="small muted">${nl(f.k)} kcal</span></button>`).join(""):`<p class="muted small" style="padding:10px 0;margin:0">Niets gevonden.</p>`}</div>`;
  h+=`<div class="btnrow" style="margin-top:10px">${q.length>=3?`<button class="btn" data-act="n-off">Zoek in Open Food Facts</button>`:""}<button class="btn" data-act="n-custom">+ Eigen product</button></div>`;
  return h;
}
async function offSearch(q){
  const sh=UI.sheet;sh.off="loading";renderSheet();
  const base="https://world.openfoodfacts.org/cgi/search.pl?app_name=Athlevon&app_version="+APP_VERSION+"&search_simple=1&action=process&json=1&page_size=24&fields=code,product_name,product_name_nl,brands,nutriments,serving_quantity&search_terms="+encodeURIComponent(q);
  const get=async u=>{const r=await fetch(u);if(!r.ok)throw new Error();return (await r.json()).products||[]};
  try{
    let ps=await get(base+"&tagtype_0=countries&tag_contains_0=contains&tag_0=netherlands");
    if(!ps.length)ps=await get(base);
    const out=ps.map(p=>{const m=p.nutriments||{};const k=m["energy-kcal_100g"]??(m["energy_100g"]?m["energy_100g"]/4.184:null);
      return{n:(p.product_name_nl||p.product_name||"").trim(),brand:(p.brands||"").split(",")[0].trim(),k:+k,p:+(m.proteins_100g||0),c:+(m.carbohydrates_100g||0),f:+(m.fat_100g||0),por:p.serving_quantity?Math.round(+p.serving_quantity):100,off:true}}).filter(f=>f.n&&isFinite(f.k)&&f.k>0).slice(0,15);
    if(UI.sheet===sh){sh.off=out;renderSheet()}
  }catch(e){if(UI.sheet===sh){sh.off="error";renderSheet()}}
}

