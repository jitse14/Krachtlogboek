/* ---------- voeding: boodschappen ---------- */
function priceOf(f){const p=S.prices&&S.prices.eur&&S.prices.eur[f.id];return p>0?p:f.eur}
function viewShop(n){
  const days=exampleDays(n),cnt=UI.shopDays||(UI.shopDays=[3,2,2]);
  const tot={};days.forEach((items,di)=>items.forEach(it=>{tot[it.id]=(tot[it.id]||0)+it.g*(cnt[di]||0)}));
  const done=lsGet("krachtlogboek.shop."+pid)||{};
  const rows=Object.entries(tot).filter(([,g])=>g>0).map(([id,g])=>{const f=FOOD[id],packs=Math.max(1,Math.ceil(g/f.pkg-0.05)),cost=packs*f.pkg/1000*priceOf(f);return{f,g,packs,cost}});
  const total=rows.reduce((s,r)=>s+r.cost,0),nd=cnt.reduce((a,b)=>a+b,0);
  const upd=S.prices&&S.prices.updated?` · prijzen bijgewerkt ${dateTxt(S.prices.updated)}`:"";
  let h=`<div class="card stack" style="margin-top:12px"><p class="hp">Boodschappen voor je voorbeelddagen. Kies hoe vaak je elke dag wilt eten.</p>
    <div class="grid3">${[0,1,2].map(i=>`<label class="f sub">Dag ${"ABC"[i]}<select id="shop-${i}">${[0,1,2,3,4,5,6,7].map(v=>`<option ${cnt[i]===v?"selected":""}>${v}</option>`).join("")}</select></label>`).join("")}</div>
    <div class="shoptot"><span>${nd} dag${nd===1?"":"en"}</span><b>± € ${total.toFixed(2).replace(".",",")}</b></div>
    <span class="hintline">Geschatte prijs, uitgaande van hele verpakkingen${upd}. Aanbiedingen maken het vaak goedkoper.</span></div>`;
  for(const [c,l] of FCATS){const rs=rows.filter(r=>r.f.cat===c);if(!rs.length)continue;
    h+=`<h2>${l}</h2><div class="recgroup">${rs.map(r=>{const ck=!!done[r.f.id];return `<button class="row shoprow${ck?" ck":""}" data-act="n-shop-ck" data-v="${r.f.id}"><span class="n">${ck?"✓ ":""}${esc(r.f.n)}</span><span class="b none">€ ${r.cost.toFixed(2).replace(".",",")}</span><span class="l">${r.g>=1000?fmt1(r.g/1000)+" kg":Math.round(r.g)+" g"} nodig · ${r.packs} × ${r.f.pkg>=1000?fmt1(r.f.pkg/1000)+" kg":r.f.pkg+" g"}</span></button>`}).join("")}</div>`}
  h+=`<div class="btnrow" style="margin-top:12px"><button class="btn" data-act="n-shop-copy">Lijst kopiëren</button><button class="btn" data-act="n-shop-reset">Vinkjes wissen</button></div>
  <h2>Aanbiedingen deze week</h2><div class="card stack"><p class="hp small">Bekijk de actuele aanbiedingen en pas je keuze daarop aan. Live prijzen ophalen kan helaas niet: de supermarkten bieden daar geen officiële koppeling voor.</p>
    <div class="btnrow"><a class="btn" href="https://www.ah.nl/bonus" target="_blank" rel="noopener">Albert Heijn</a><a class="btn" href="https://www.jumbo.com/aanbiedingen/nu" target="_blank" rel="noopener">Jumbo</a><a class="btn" href="https://www.lidl.nl" target="_blank" rel="noopener">Lidl</a></div></div>`;
  if(S.me&&S.me.isAdmin)h+=`<button class="btn block" style="margin-top:12px" data-act="n-prices">Prijzen bijwerken (beheerder)</button>`;
  return h;
}
function pricesSheet(){
  const cur=(S.prices&&S.prices.eur)||{};
  return `<div class="sh"><h2>Prijzen per kg</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><p class="small muted">Gemiddelde prijs per kilo (of liter) in euro's. Geldt voor iedereen. Laat leeg voor de standaardschatting.</p>
    <div class="card" style="padding:4px 12px">${FOODS.map(f=>`<div class="pricerow"><span>${esc(f.n)}</span><input type="text" inputmode="decimal" id="pr-${f.id}" value="${cur[f.id]!=null?String(cur[f.id]).replace(".",","):""}" placeholder="${String(f.eur).replace(".",",")}" aria-label="Prijs per kg ${esc(f.n)}"></div>`).join("")}</div>
    <button class="btn primary block" style="margin-top:12px" data-act="n-prices-save">Prijzen opslaan</button>`;
}
async function loadPrices(){try{S.prices=(await rpc("kl_setting_get",{p_code:code,p_key:"prices"}))||{};render()}catch(e){}}

