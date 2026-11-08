/* ---------- v6+: spiergroepen, delen voeding, boodschappenlijst ---------- */
const BASE_GROUPS=["Borst","Rug","Schouders","Biceps","Triceps","Onderarmen","Core","Quadriceps","Hamstrings","Billen","Kuiten","Full body","Overig"];
function legGroup(name){return /deadlift|rdl|nordic|hamstring|leg ?curl|good ?morning|single leg rdl/i.test(name||"")?"Hamstrings":"Quadriceps"}
function applyGroups(){const custom=((S.meta.groups&&S.meta.groups.custom)||[]).filter(g=>g&&!BASE_GROUPS.includes(g));GROUPS.splice(0,GROUPS.length,...BASE_GROUPS.slice(0,-1),...custom,"Overig")}
let migratingG=false;
async function migrateGroups(){
  applyGroups();
  if(migratingG||!pid||S.mode!=="cloud"||queue().length||(S.meta.seed&&S.meta.seed.g))return;
  migratingG=true;
  try{
    const jobs=Object.entries(S.exercises).filter(([,x])=>x.group==="Benen").map(([id,x])=>["exercises",id,{...x,group:legGroup(x.name)}]);
    await runJobs(jobs,put);
    await put("meta","seed",{...(S.meta.seed||{}),g:1});
  }finally{migratingG=false}
}
function groupSelect(id,cur){const list=[...GROUPS];if(cur&&!list.includes(cur))list.splice(list.length-1,0,cur);return `<select id="${id}">${list.map(g=>`<option ${g===cur?"selected":""}>${esc(g)}</option>`).join("")}</select>`}
async function addGroup(name){
  name=String(name||"").trim().slice(0,30);if(!name){toast("Vul een naam in voor de spiergroep.");return null}
  name=name.charAt(0).toUpperCase()+name.slice(1);
  if(GROUPS.some(g=>norm(g)===norm(name))){toast("Deze spiergroep bestaat al.");return GROUPS.find(g=>norm(g)===norm(name))}
  const custom=[...((S.meta.groups&&S.meta.groups.custom)||[]),name];
  await put("meta","groups",{custom});applyGroups();toastOk(`Spiergroep "${name}" toegevoegd`);return name;
}

/* delen van maaltijden en producten */
function foodPkg(f){return{n:f.n,k:+f.k||0,p:+f.p||0,c:+f.c||0,f:+f.f||0,por:f.por||100}}
async function shareFood(kind,id){
  let pkg;
  if(kind==="meal"){const m=mealById(id);if(!m)return;pkg={type:"meal",name:m.n,cats:mealCats(m),items:(m.items||[]).map(it=>{const f=partFood(it);return f?{...foodPkg(f),g:it.g,fid:it.fid&&FOOD[it.fid]?it.fid:null}:null}).filter(Boolean)}}
  else{const f=anyFood(id);if(!f)return;pkg={type:"product",name:f.n,...foodPkg(f)}}
  pkg.by=S.me?.name||"";pkg.v=1;
  try{const c=await rpc("kl_share_create",{p_code:code,p_profile:pid,p_pin:myPin(),p_data:pkg});UI.sheet={type:"share",code:c,name:pkg.name,kind,pkg};render()}
  catch(e){if(e.code==="net")toast("Delen lukt alleen met internet.");else handleErr(e)}
}
const KIND_LBL={folder:"Map",routine:"Schema",meal:"Maaltijd",product:"Product",results:"Resultaten"};
function shareText(sh){const food=sh.kind==="meal"||sh.kind==="product";return `${KIND_LBL[sh.kind]||"Schema"} "${sh.name}" uit Athlevon. Open de link, of vul ${food?"bij Voeding → Plannen":"bij Schema's"} de deelcode ${sh.code} in.`}
EXTRA_SHEETS["share"]=function(sh){
  const can=!!navigator.share,food=sh.kind==="meal"||sh.kind==="product";
  return `<div class="sh"><h2>${KIND_LBL[sh.kind]||"Schema"} delen</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
    <div class="card stack"><p class="hp">Stuur deze code of link door. De ander kan "${esc(sh.name)}" dan met één tik toevoegen${food?", inclusief alle voedingswaarden":""}.</p>
    <div class="sharecode" aria-label="Deelcode">${esc(sh.code)}</div>
    ${can?`<button class="btn primary" data-act="sh-native">Delen via WhatsApp, berichten…</button>`:""}
    <button class="btn ${can?"":"primary"}" data-act="sh-copy">Kopieer bericht met link</button>
    <p class="small muted" style="margin:0">Ontvanger vult de code in bij <b>${food?"Voeding → Plannen → Gedeelde maaltijd of product":"Schema's → Gedeeld schema toevoegen"}</b>, of opent de link en logt in.</p></div>`;
};
const _importSheet=importSheetV5;
function importSheet(sh){
  const d=sh.data||{};
  if(d.type==="meal"){const t=d.items.reduce((s,x)=>{const q=x.g/100;s.k+=x.k*q;s.p+=x.p*q;s.c+=x.c*q;s.f+=x.f*q;return s},{k:0,p:0,c:0,f:0});
    return `<div class="sh"><h2>Gedeelde maaltijd</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><div><strong style="font-family:var(--display);font-size:22px">${esc(d.name)}</strong>${d.by?`<div class="muted small">Gedeeld door ${esc(d.by)}</div>`:""}</div>
      ${d.items.map(x=>`<div class="fline"><span class="fq">${Math.round(x.g)} g</span><span class="fn">${esc(x.n)}</span><span class="fm">${nl(x.k*x.g/100)} kcal</span></div>`).join("")}
      <div class="livespeed">${mTxt(t)}</div><button class="btn primary" data-act="sh-import">Toevoegen aan mijn maaltijden</button></div>`}
  if(d.type==="product")return `<div class="sh"><h2>Gedeeld product</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><div><strong style="font-family:var(--display);font-size:22px">${esc(d.name)}</strong>${d.by?`<div class="muted small">Gedeeld door ${esc(d.by)}</div>`:""}</div>
      <p class="hp">Per 100 g: ${nl(d.k)} kcal · ${fmt1(d.p)} g eiwit · ${fmt1(d.c)} g koolhydraten · ${fmt1(d.f)} g vet</p><button class="btn primary" data-act="sh-import">Toevoegen aan mijn producten</button></div>`;
  return _importSheet(sh);
}
async function ensureFood(x){
  const ex=Object.entries(S.foods||{}).find(([,f])=>norm(f.n)===norm(x.n)&&Math.abs((+f.k||0)-x.k)<1);
  if(ex)return "c:"+ex[0];
  const id=uid();await put("foods",id,foodPkg(x));return "c:"+id;
}
const _importShare=importShareV5;
async function importShare(){
  const d=UI.sheet&&UI.sheet.data;if(!d)return;
  if(d.type!=="meal"&&d.type!=="product")return _importShare();
  UI.sheet=null;render();
  if(d.type==="product"){await ensureFood({...d,n:d.name||d.n});toastOk(`Product "${d.name}" toegevoegd`)}
  else{const items=[];for(const x of d.items){items.push({fid:x.fid&&FOOD[x.fid]?x.fid:await ensureFood(x),g:x.g})}
    await put("meals",uid(),{n:String(d.name).slice(0,80),cats:(d.cats||["ontbijt"]).filter(c=>MEALS.some(m=>m[0]===c)),items});toastOk(`Maaltijd "${d.name}" toegevoegd`)}
  UI.tab="food";UI.foodTab="plannen";lsSet(LS_TAB,"food");render();window.scrollTo(0,0);
}

/* boodschappen: eigen lijst, gedeeld tussen je apparaten, afvinken in de winkel */
let shopT=null;
function shopState(){
  if(!UI.shop2){const a=S.meta.shop||{},b=lsGet("krachtlogboek.shop2."+pid)||{},s=(b.ts||0)>(a.ts||0)?b:a;UI.shop2={src:s.src||null,off:s.off||{},have:s.have||{},extra:s.extra||[],got:s.got||{},ts:s.ts||0}}
  return UI.shop2;
}
function shopFlush(){if(shopT&&UI.shop2&&pid){clearTimeout(shopT);shopT=null;put("meta","shop",clone(UI.shop2))}}
function shopSave(){const st=UI.shop2;st.ts=Date.now();lsSet("krachtlogboek.shop2."+pid,st);clearTimeout(shopT);shopT=setTimeout(shopFlush,250)}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")shopFlush()});
window.addEventListener("pagehide",shopFlush);
function shopData(n){
  const st=shopState(),srcs=shopSources(n);
  if(!st.src){st.src={};const mine=srcs.filter(s=>s.key.startsWith("p:"));if(mine.length)st.src[mine[0].key]=7}
  const units=[];
  for(const s of srcs){const days=st.src[s.key]||0;if(!days)continue;
    const grp={};for(const e of s.entries){if(e.t==="m")units.push({key:s.key+"|m|"+e.id+"|"+e.slot,n:entryName(e),src:s.n,days,parts:entryParts(e)});else(grp[e.slot]=grp[e.slot]||[]).push(e)}
    for(const [slot,es] of Object.entries(grp))units.push({key:s.key+"|s|"+slot,n:(MEALS.find(x=>x[0]===slot)||MEALS[0])[1],src:s.n,days,parts:es.flatMap(entryParts)});
  }
  const prod={};let use=0;
  for(const u of units){if(st.off[u.key])continue;const c=partsCost(u.parts);use+=c.use*u.days;for(const x of u.parts){if(!x.fid||!FOOD[x.fid])continue;prod[x.fid]=(prod[x.fid]||0)+x.g*u.days}}
  const rows=Object.entries(prod).map(([fid,g])=>{const f=FOOD[fid],packs=Math.max(1,Math.ceil(g/f.pkg-0.05));return{key:"f:"+fid,f,g,packs,cost:packs*f.pkg/1000*priceOf(f),have:!!st.have[fid]}});
  const extras=st.extra.map(x=>{const f=x.fid&&anyFood(x.fid);const dbf=x.fid&&FOOD[x.fid];return{key:"x:"+x.id,x,f,name:f?f.n:x.name,packs:x.packs||1,cost:dbf?(x.packs||1)*dbf.pkg/1000*priceOf(dbf):0,cat:dbf?dbf.cat:"eigen"}});
  const buy=rows.filter(r=>!r.have).reduce((t,r)=>t+r.cost,0)+extras.reduce((t,r)=>t+r.cost,0);
  return{st,srcs,units,rows,extras,use,buy};
}
function viewShop(n){
  const d=shopData(n),st=d.st,mode=UI.shopMode||"lijst";
  let h=`<div class="seg seg2" style="margin-top:12px"><button class="segb" data-act="shm" data-v="lijst" aria-pressed="${mode==="lijst"}">Lijst samenstellen</button><button class="segb" data-act="shm" data-v="winkel" aria-pressed="${mode==="winkel"}">In de winkel</button></div>`;
  if(mode==="winkel")return h+viewStore(d);
  const nd=Object.values(st.src).reduce((a,b)=>a+(b||0),0);
  h+=`<div class="card stack shopsum"><div class="shoptot"><span>Te kopen</span><b>${eur(d.buy)}</b></div><span class="small muted">Geschat, voor hele verpakkingen. ${d.use?`Wat je van je maaltijden werkelijk opeet kost ± ${eur(d.use)}${nd?`, ± ${eur(d.use/nd)} per dag`:""}.`:""}</span></div>
  <h2>Losse producten</h2><div class="recgroup">${d.extras.map(r=>`<div class="row logrow"><span class="n">${esc(r.name)}</span><span class="b none">${r.cost?eur(r.cost):""}</span><span class="l">${r.f&&FOOD[r.x.fid]?`${r.packs} × ${FOOD[r.x.fid].pkg>=1000?fmt1(FOOD[r.x.fid].pkg/1000)+" kg":FOOD[r.x.fid].pkg+" g"}`:`${r.packs}×`} <button class="linkbtn" data-act="shx-min" data-v="${r.x.id}" aria-label="Minder">−</button><button class="linkbtn" data-act="shx-plus" data-v="${r.x.id}" aria-label="Meer">+</button> <button class="linkbtn danger" data-act="shx-del" data-v="${r.x.id}">verwijderen</button></span></div>`).join("")}
    <button class="row addrow" data-act="shx-add"><span class="n">+ Product uit de lijst toevoegen</span></button></div>
  <div class="codeinput" style="margin-top:8px"><input type="text" id="shx-free" placeholder="Iets anders, bijv. keukenpapier" autocomplete="off"><button class="btn" data-act="shx-free">Toevoegen</button></div>
  <h2>Uit maaltijden</h2><div class="card stack">${d.srcs.map(s=>`<div class="srcrow"><span>${esc(s.n)}</span><select id="shs-${esc(s.key)}" aria-label="Aantal dagen ${esc(s.n)}">${[0,1,2,3,4,5,6,7].map(v=>`<option value="${v}" ${(st.src[s.key]||0)===v?"selected":""}>${v} ${v===1?"dag":"dagen"}</option>`).join("")}</select></div>`).join("")}</div>
  ${d.units.length?`<div class="recgroup" style="margin-top:8px">${d.units.map(u=>{const c=partsCost(u.parts),off=!!st.off[u.key];return `<button class="row shoprow${off?" ck":""}" data-act="sh-unit" data-v="${esc(u.key)}"><span class="n">${off?"☐":"☑"} ${esc(u.n)}</span><span class="b none">${eur(c.use*u.days)}</span><span class="l">${esc(u.src)} · ${u.days}× · ${eur(c.use)} per keer</span></button>`}).join("")}</div>`:`<p class="small muted">Kies hierboven een plan of voorbeelddag, of zet alleen losse producten op je lijst.</p>`}`;
  if(d.rows.length){h+=`<h2>Producten voor je maaltijden</h2><p class="small muted" style="margin:0 0 6px">Tik op wat je al in huis hebt; dat telt dan niet mee.</p>`;
    for(const [c,l] of FCATS){const rs=d.rows.filter(r=>r.f.cat===c);if(!rs.length)continue;
      h+=`<div class="recgroup" style="margin-bottom:8px"><div class="row" style="cursor:default;padding:6px 14px"><span class="n small muted">${l}</span></div>${rs.map(r=>`<button class="row shoprow${r.have?" ck":""}" data-act="sh-have" data-v="${r.f.id}"><span class="n">${r.have?"✓ heb ik al · ":""}${esc(r.f.n)}</span><span class="b none">${eur(r.cost)}</span><span class="l">${r.g>=1000?fmt1(r.g/1000)+" kg":Math.round(r.g)+" g"} nodig · ${r.packs} × ${r.f.pkg>=1000?fmt1(r.f.pkg/1000)+" kg":r.f.pkg+" g"}</span></button>`).join("")}</div>`}}
  h+=`<div class="btnrow" style="margin-top:12px"><button class="btn primary" data-act="shm" data-v="winkel">Naar de winkel</button><button class="btn" data-act="n-shop-copy">Lijst kopiëren</button></div>
  <button class="btn ghost block" style="margin-top:8px" data-act="sh-reset">Lijst leegmaken</button>
  <h2>Aanbiedingen deze week</h2><div class="card stack"><p class="hp small">Prijzen in de app zijn schattingen. Live prijzen ophalen kan niet; de supermarkten bieden daar geen officiële koppeling voor.</p>
    <div class="btnrow"><a class="btn" href="https://www.ah.nl/bonus" target="_blank" rel="noopener">Albert Heijn</a><a class="btn" href="https://www.jumbo.com/aanbiedingen/nu" target="_blank" rel="noopener">Jumbo</a><a class="btn" href="https://www.lidl.nl" target="_blank" rel="noopener">Lidl</a></div></div>`;
  if(S.me&&S.me.isAdmin)h+=`<button class="btn block" style="margin-top:12px" data-act="n-prices">Prijzen bijwerken (beheerder)</button>`;
  UI.shopRows=d.rows.filter(r=>!r.have).map(r=>({f:r.f,packs:r.packs,have:false})).concat(d.extras.map(r=>({f:{n:r.name,pkg:FOOD[r.x.fid]?.pkg||0},packs:r.packs,have:false,free:!FOOD[r.x.fid]})));
  return h;
}
function storeItems(d){
  const items=d.rows.filter(r=>!r.have).map(r=>({key:r.key,name:r.f.n,qty:`${r.packs} × ${r.f.pkg>=1000?fmt1(r.f.pkg/1000)+" kg":r.f.pkg+" g"}`,cat:r.f.cat}));
  for(const r of d.extras)items.push({key:r.key,name:r.name,qty:FOOD[r.x.fid]?`${r.packs} × ${FOOD[r.x.fid].pkg>=1000?fmt1(FOOD[r.x.fid].pkg/1000)+" kg":FOOD[r.x.fid].pkg+" g"}`:(r.packs>1?r.packs+"×":""),cat:r.cat});
  return items;
}
function viewStore(d){
  const items=storeItems(d),got=d.st.got,n=items.filter(i=>got[i.key]).length;
  if(!items.length)return `<div class="card empty" style="margin-top:12px"><p class="muted">Je boodschappenlijst is leeg. Voeg producten toe bij Lijst samenstellen.</p></div>`;
  let h=`<div class="card storehead"><b>${n} van ${items.length}</b><span class="small muted">in je mandje</span><div class="pt"><span style="width:${items.length?n/items.length*100:0}%"></span></div></div>`;
  const cats=[...FCATS,["eigen","Overig"]];
  for(const [c,l] of cats){const its=items.filter(i=>(i.cat||"eigen")===c);if(!its.length)continue;
    h+=`<div class="mealhead">${l}</div><div class="recgroup">${its.map(i=>`<button class="row storerow${got[i.key]?" got":""}" data-act="st-got" data-v="${esc(i.key)}"><span class="n"><span class="box" aria-hidden="true">${got[i.key]?"✓":""}</span>${esc(i.name)}</span><span class="b none">${esc(i.qty)}</span></button>`).join("")}</div>`}
  h+=`<div class="btnrow" style="margin-top:14px"><button class="btn" data-act="st-reset">Vinkjes wissen</button><button class="btn primary" data-act="st-done">Klaar met boodschappen</button></div><p class="small muted">Je lijst staat ook op je andere apparaten, dus je kunt hem thuis maken en in de winkel afvinken.</p>`;
  return h;
}

document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;
  const act=b.dataset.act,v=b.dataset.v;
  switch(act){
    case "grp-add":{const nm=await addGroup(document.getElementById("ex-newg")?.value);if(nm&&UI.sheet&&UI.sheet.type==="ex"){UI.sheet.group=nm;renderSheet()}break}
    case "share-meal":await shareFood("meal",v);break;
    case "share-prod":await shareFood("product",v);break;
    case "prod-del":await del("foods",v.slice(2));toastOk("Product verwijderd");render();break;
    case "nsh-lookup":await lookupShare(document.getElementById("nsh-code")?.value);break;
    case "shm":UI.shopMode=v;render();window.scrollTo(0,0);break;
    case "shx-add":UI.sheet={type:"plan-pick",target:"shop",mode:"p",q:""};render();break;
    case "shx-free":{const el=document.getElementById("shx-free"),nm=(el?.value||"").trim();if(!nm)return;const st=shopState();st.extra.push({id:uid(),name:nm.slice(0,60),packs:1});shopSave();render();break}
    case "shx-plus":case "shx-min":{const st=shopState(),x=st.extra.find(e=>e.id===v);if(!x)return;x.packs=Math.max(1,(x.packs||1)+(act==="shx-plus"?1:-1));shopSave();render();break}
    case "shx-del":{const st=shopState();st.extra=st.extra.filter(e=>e.id!==v);shopSave();render();break}
    case "st-got":{const st=shopState();st.got[v]=!st.got[v];shopSave();const y=window.scrollY;render();window.scrollTo(0,y);break}
    case "st-reset":{const st=shopState();st.got={};shopSave();render();break}
    case "st-done":{const st=shopState();st.got={};st.extra=[];st.have={};shopSave();UI.shopMode="lijst";toastOk("Boodschappen afgerond, je losse producten zijn van de lijst gehaald");render();window.scrollTo(0,0);break}
  }
},true);
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target.id==="shx-free"){ev.preventDefault();document.querySelector('[data-act="shx-free"]')?.click()}if(ev.key==="Enter"&&ev.target.id==="nsh-code"){ev.preventDefault();document.querySelector('[data-act="nsh-lookup"]')?.click()}});

