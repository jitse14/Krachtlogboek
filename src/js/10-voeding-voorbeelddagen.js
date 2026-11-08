/* ---------- voeding: voorbeelddagen ---------- */
const MEALS=[["ontbijt","Ontbijt"],["lunch","Lunch"],["diner","Diner"],["snack","Snacks"]];
const TPL={
  ontbijt:[[["havermout","muesli"],["melk_hv","melk_vol","sojamelk"],["banaan","blauwebes","roodfruit","appel"],["whey","veganshake","skyr","kwark_mager"]],
           [["brood_vk","brood_wit"],["ei"],["kaas_30","kipbeleg","hummus","kaas_jong"],["sinaasappel","kiwi","appel","mandarijn"]],
           [["skyr","kwark_mager","griekse","sojayoghurt"],["granola","muesli","cornflakes"],["blauwebes","aardbei","roodfruit","banaan","mango"],["noten_mix","amandelen","walnoten","chiazaad"]]],
  lunch:[[["brood_vk","brood_wit","knackebrood"],["kipbeleg","rosbief","ham","kaas_30","ei"],["kaas_jong","hummus","pindakaas","halvarine"],["tomaat","komkommer","paprika","wortel"],["melk_hv","sojamelk","yoghurt_mager"]],
         [["wrap"],["kipfilet_b","tonijn","kalkoen","ei","kipshoarma"],["sla","paprika","tomaat","komkommer"],["avocado","hummus","feta"]],
         [["couscous","quinoa","zilvervlies"],["kipfilet_b","tonijn","feta","ei","gerooktezalm"],["sla","tomaat","komkommer","paprika"],["olijfolie","avocado"]]],
  diner:[[["rijst","zilvervlies","mie"],["kipfilet","kipdij","garnalen","kipshoarma","vegaburger"],["wokmix","broccoli","paprika","sperzie"],["olijfolie"]],
         [["pasta","pasta_vk"],["gehakt_mager","gehakt_hoh","vegaburger","zalm","kipfilet"],["pastasaus","pesto"],["courgette","champignons","spinazie","paprika"],["kaas_30","mozzarella","olijfolie"]],
         [["aardappel","zoeteaardappel"],["biefstuk","zalm","kabeljauw","kalkoen","varkenshaas","vegaburger"],["sperzie","broccoli","bloemkool","spruitjes","wortel"],["roomboter","olijfolie","halvarine"]]],
  snack:[[["kwark_mager","skyr","sojayoghurt"],["blauwebes","aardbei","banaan","roodfruit"]],
         [["rijstwafel"],["pindakaas","hummus"]],
         [["noten_mix","amandelen","walnoten"],["appel","mandarijn","druiven"]],
         [["whey","veganshake"],["banaan","melk_hv","sojamelk"]],
         [["eiwitreep"]]]
};
const DAYSNACKS=[[0,1],[2,3],[0,4]];
function pickFood(cands,p,used,rot){
  const ok=cands.filter(id=>FOOD[id]&&foodAllowed(FOOD[id],p)&&!used.has(id));
  if(!ok.length)return null;
  const liked=ok.filter(id=>p.likes.includes(id)),pool=liked.length?liked:ok;
  return pool[rot%pool.length];
}
function buildDay(di,n,p,seed){
  const items=[],used=new Set();
  for(const [m] of MEALS){
    const tpls=m==="snack"?DAYSNACKS[di].map(i=>TPL.snack[i]):[TPL[m][di]];
    tpls.forEach((tpl,ti)=>{
      tpl.forEach((slot,si)=>{
        let id=pickFood(slot,p,used,di+seed+si+ti);
        if(!id&&si<2){const cat=FOOD[slot[0]].cat;id=pickFood(FOODS.filter(f=>f.cat===cat||(["vlees","vis","eivega"].includes(cat)&&["vlees","vis","eivega"].includes(f.cat))).map(f=>f.id),p,used,di+seed)}
        if(id){used.add(id);items.push({meal:m,id,g:FOOD[id].por})}
      });
    });
  }
  optimize(items,n);
  const FILL=[["banaan","rijstwafel","ontbijtkoek","rozijnen"],["granola","muesli","noten_mix","pindakaas","brood_vk"],["melk_hv","sojamelk","skyr","yoghurt_mager"]];
  for(let k=0;k<3&&sumM(items).k<n.kcal*0.96;k++){
    const id=pickFood(FILL[(k+di)%FILL.length],p,used,di+seed+k);if(!id)continue;
    used.add(id);items.push({meal:"snack",id,g:FOOD[id].por});optimize(items,n);
  }
  return items;
}
function optimize(items,n){
  const T=[n.protein,n.carbs,n.fat],W=[3,1.5,1.5],lam=0.012;
  const A=items.map(it=>{const f=FOOD[it.id];return[f.p/100,f.c/100,f.f/100]});
  const M=()=>{const s=[0,0,0];items.forEach((it,i)=>{for(let k=0;k<3;k++)s[k]+=A[i][k]*it.g});return s};
  for(let sweep=0;sweep<60;sweep++){
    for(let i=0;i<items.length;i++){
      const f=FOOD[items[i].id],m=M(),r=m.map((v,k)=>v-T[k]);
      let num_=lam*(items[i].g-f.por)/(f.por*f.por),den=lam/(f.por*f.por);
      for(let k=0;k<3;k++){num_+=W[k]*A[i][k]*r[k]/(T[k]*T[k]);den+=W[k]*A[i][k]*A[i][k]/(T[k]*T[k])}
      items[i].g=Math.min(f.max,Math.max(f.min,items[i].g-num_/den));
    }
  }
  items.forEach(it=>{const f=FOOD[it.id];it.g=Math.min(f.max,Math.max(f.min,Math.round(it.g/f.st)*f.st))});
}
function macrosOf(it){const f=it.food||FOOD[it.id]||{k:0,p:0,c:0,f:0};const q=it.g/100;return{k:f.k*q,p:f.p*q,c:f.c*q,f:f.f*q}}
function sumM(list){return list.reduce((s,it)=>{const m=it.k!=null&&!it.id?it:macrosOf(it);s.k+=m.k;s.p+=m.p;s.c+=m.c;s.f+=m.f;return s},{k:0,p:0,c:0,f:0})}
function portionTxt(it){const f=FOOD[it.id];if(f.u){const n=Math.round(it.g/f.u*2)/2;const w={ei:"ei",banaan:"banaan",appel:"appel",sinaasappel:"sinaasappel",mandarijn:"mandarijn",kiwi:"kiwi",wrap:"wrap",eiwitreep:"reep",brood_vk:"snee",brood_wit:"snee",knackebrood:"cracker",rijstwafel:"rijstwafel",ontbijtkoek:"plak"}[f.id]||"stuk";return `${it.g} g · ${String(n).replace(".",",")} ${w}${n>1&&w==="snee"?"ën":n>1&&w==="ei"?"eren":""}`}return `${it.g} g`}
let dayCache=null;
function exampleDays(n){
  const p=prefs(),key=JSON.stringify([r10(n.kcal),r5(n.protein),r5(n.carbs),r5(n.fat),p,UI.daySeed||0]);
  if(dayCache&&dayCache.key===key)return dayCache.days;
  const days=[0,1,2].map(i=>buildDay(i,n,p,UI.daySeed||0));
  dayCache={key,days};return days;
}
function mTxt(m){return `${nl(m.k)} kcal · ${Math.round(m.p)} E · ${Math.round(m.c)} K · ${Math.round(m.f)} V`}
function viewDays(n){
  if(UI.prefOpen)return `<h2>Mijn voorkeuren</h2>`+viewPrefs();
  const days=exampleDays(n),p=prefs(),np=p.likes.length+p.dislikes.length+Object.values(p.diet||{}).filter(Boolean).length;
  let h=`<div class="card stack" style="margin-top:12px"><p class="hp">Drie voorbeelddagen op jouw dagdoel van <b>${nl(r10(n.kcal))} kcal</b>: ${r5(n.protein)} g eiwit, ${r5(n.carbs)} g koolhydraten en ${r5(n.fat)} g vet. De hoeveelheden zijn zo gekozen dat je daar zo dicht mogelijk bij komt.</p>
    <div class="btnrow"><button class="btn" data-act="n-pref-open">${np?`Mijn voorkeuren (${np})`:"Voorkeuren instellen"}</button><button class="btn" data-act="n-reroll">Andere voorstellen</button></div></div>`;
  days.forEach((items,di)=>{
    const tot=sumM(items),open=UI.dayOpen===di;
    const dev=Math.round((tot.k-n.kcal)/n.kcal*100);
    h+=`<section class="card dayplan"><button class="fhead" data-act="n-day" data-v="${di}" aria-expanded="${open}"><span class="fname">Voorbeelddag ${"ABC"[di]}</span><span class="small muted">${nl(r10(tot.k))} kcal</span><span class="chev" aria-hidden="true">${open?"▾":"▸"}</span></button>`;
    if(open){
      h+=`<div class="fbody">`+MEALS.map(([m,l])=>{const its=items.filter(it=>it.meal===m);if(!its.length)return "";const mt=sumM(its);
        return `<div class="meal"><div class="mh"><b>${l}</b><span class="small muted">${mTxt(mt)}</span></div>${its.map(it=>{const mm=macrosOf(it);return `<div class="fline"><span class="fq">${portionTxt(it)}</span><span class="fn">${esc(FOOD[it.id].n)}</span><span class="fm">${nl(mm.k)} kcal · ${fmt1(mm.p)} E</span></div>`}).join("")}</div>`}).join("")+
        `<div class="daytot"><div><span class="ml">Totaal</span><b>${nl(tot.k)} kcal</b></div><div><span class="ml">Eiwit</span><b>${Math.round(tot.p)} g</b></div><div><span class="ml">Koolh.</span><b>${Math.round(tot.c)} g</b></div><div><span class="ml">Vet</span><b>${Math.round(tot.f)} g</b></div></div>
        <p class="small muted" style="margin:6px 0 0">${Math.abs(dev)<=3?"Binnen 3% van je dagdoel.":`${dev>0?"+":""}${dev}% ten opzichte van je dagdoel.`} Rijst, pasta en couscous zijn ongekookt gewogen.</p>
        <div class="btnrow" style="margin-top:10px"><button class="btn primary" data-act="n-day-log" data-v="${di}">In dagboek van vandaag</button></div></div>`;
    }
    h+=`</section>`;
  });
  return h;
}

