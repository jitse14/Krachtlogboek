/* ---------- 6.4: wedstrijd bovenaan, kleuren per sport, emoji in je agenda, trail ---------- */
/* sportschema: "Train je voor een wedstrijd?" direct onder het aantal weken */
function scRaceCard(c){const endu=scEndu(c);
  if(!endu.length)return `<div class="card stack" style="margin-top:10px"><div class="f">Train je voor een wedstrijd?</div><p class="small muted" style="margin:0">Kies hierboven eerst een duursport, bijvoorbeeld hardlopen of fietsen. Dan kun je een wedstrijddatum invullen en maakt de coach een schema tot die dag.</p></div>`;
  const on=endu.filter(n=>scGoal(c,n).goal==="wedstrijd");
  let h=`<div class="card stack" style="margin-top:10px"><div class="f">Train je voor een wedstrijd?<div class="chips"><button class="chipb" data-act="sc-race-pick" data-v="" aria-pressed="${!on.length}">Nee</button>${endu.map(n=>`<button class="chipb" data-act="sc-race-pick" data-v="${esc(n)}" aria-pressed="${on.includes(n)}">${esc(scLabel(n))}</button>`).join("")}</div></div>`;
  for(const n of on){const g=scGoal(c,n);h+=`<p class="small" style="margin:0">${esc(scLabel(n))}: ${g.race?`wedstrijd op <b>${esc(dateTxt(g.race))}</b>`:"<b>vul de datum en afstand in</b>"} · <button class="linkbtn" data-act="sc-race-go" data-v="${SC_ENDU.indexOf(n)}">${g.race?"wijzigen":"invullen"}</button></p>`}
  if(on.length)h+=`<p class="small muted" style="margin:0">Het schema loopt dan tot je wedstrijd, met de laatste week rustiger (taperen).</p>`;
  return h+`</div>`}
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="sc-race-pick"],[data-act="sc-race-go"]');if(!b||!UI.sc)return;const c=UI.sc;scRead();
  if(b.dataset.act==="sc-race-pick"){const v=b.dataset.v;
    for(const n of scEndu(c)){const g=c.eg[n]||(c.eg[n]={goal:"fit",dist:"",race:""});if(n===v)g.goal="wedstrijd";else if(g.goal==="wedstrijd")g.goal="fit"}
    if(!v&&c.weeks==="race")c.weeks=4;render();if(v)setTimeout(()=>{const el=document.getElementById("sc-race-"+SC_ENDU.indexOf(v));if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.focus()}},60);return}
  const el=document.getElementById("sc-race-"+b.dataset.v);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.focus()}});

/* soort training per geplande training: kleur, label en emoji */
function planCat(p){const k=planKind(p);if(k==="rest")return "rest";
  const t=norm([p.title,p.routineName,p.sport].filter(Boolean).join(" "));
  if(k==="routine")return routineCat(p.routineId,p.routineName,p.prog&&p.prog.hiit);
  if(k==="cardio"){if(p.sport==="Hardlopen")return /trail/.test(t)?"trail":"run";if(p.sport==="Wielrennen")return "bike";if(/zwem/.test(t))return "swim";if(/hardlo|loop|trail/.test(t))return "run";if(/fiets|wielren|spinning/.test(t))return "bike";return "other"}
  return /zwem/.test(t)?"swim":/trail/.test(t)?"trail":/hardlo|duurloop/.test(t)?"run":/fiets|wielren/.test(t)?"bike":/hiit/.test(t)?"hiit":/cali/.test(t)?"cali":"other"}
/* kracht, HIIT of calisthenics: eerst de naam van het schema, dan de map, dan de oefeningen */
const CALI_RE=/pull[- ]?up|chin[- ]?up|push[- ]?up|opdruk|\bdip|ring|pistol|l[- ]?sit|planche|hollow|muscle[- ]?up|handstand|front lever|back lever|australian|inverted row|pike|bodyweight|eigen gewicht|skin the cat|dragon flag/;
function routineCat(rid,rname,hiit){const r=S.routines[rid],f=r&&S.folders&&S.folders[r.folderId];
  const n=norm([rname,r&&r.name].filter(Boolean).join(" ")),fn=norm(f&&f.name||""),lib=String(f&&f.lib||"");
  if(hiit||/hiit|tabata|circuit/.test(n))return "hiit";if(/kracht|fitness|gym/.test(n))return "kracht";if(/cali/.test(n))return "cali";
  if(/^cali/.test(lib))return "cali";if(lib)return "kracht";
  if(/hiit/.test(fn)&&!/kracht|cali|fitness/.test(fn))return "hiit";if(/cali/.test(fn)&&!/kracht|fitness|hiit/.test(fn))return "cali";
  const ex=(r&&r.items||[]).map(i=>norm(exName(i.exId))).filter(Boolean);if(ex.length&&ex.filter(x=>CALI_RE.test(x)).length/ex.length>=0.6)return "cali";
  return "kracht"}
/* kleur van een map: het type van de schema's erin, of "mix" bij verschillende soorten */
function folderCat(fid){const rs=routinesIn(fid);if(!rs.length)return "";const cs=new Set(rs.map(([id,r])=>routineCat(id,r.name)));return cs.size===1?[...cs][0]:"mix"}
const PCAT_LBL={kracht:"Kracht",hiit:"HIIT",cali:"Cali",run:"Hardlopen",trail:"Trail",bike:"Fietsen",swim:"Zwemmen",rest:"Rust"};
const _planChip64=planChip;planChip=function(p){const c=planCat(p);return c==="other"?_planChip64(p):PCAT_LBL[c]};
const PEMO=[[/padel|tennis|squash/,"🎾"],[/badminton/,"🏸"],[/voetbal|futsal/,"⚽"],[/hockey/,"🏑"],[/basketbal/,"🏀"],[/volleybal/,"🏐"],[/handbal/,"🤾"],[/rugby/,"🏉"],[/golf/,"⛳"],[/box|vecht|mma|judo|karate/,"🥊"],[/yoga|pilates|stretch|mobiliteit|mobility/,"🧘"],[/wandel|hike|hiken/,"🚶"],[/roei/,"🚣"],[/klim|boulder/,"🧗"],[/\bski/,"⛷️"],[/schaats/,"⛸️"],[/dans/,"💃"],[/wedstrijd/,"🏁"]];
const PCAT_EMO={kracht:"🏋️",hiit:"🔥",cali:"🤸",run:"🏃",trail:"⛰️",bike:"🚴",swim:"🏊",rest:"😴",other:"🏅"};
function planEmoji(p){const c=planCat(p);if(c!=="kracht"&&c!=="hiit"&&c!=="cali"&&c!=="rest"){const t=norm([p.title,p.sport,p.note].filter(Boolean).join(" "));for(const [re,e] of PEMO)if(re.test(t))return e}return PCAT_EMO[c]||"🏅"}

/* trailrunnen valt onder hardlopen, maar wordt wel apart benoemd */
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="c-trail"]');if(!b||!UI.cardio)return;UI.cardio.trail=b.dataset.v==="1";saveCardioDraft();render()});
function trailSeg(c){if(!c||c.sport!=="Hardlopen")return "";return `<div class="seg seg2" style="margin-top:6px"><button class="segb" data-act="c-trail" data-v="0" aria-pressed="${!c.trail}">Weg / baan</button><button class="segb" data-act="c-trail" data-v="1" aria-pressed="${!!c.trail}">Trailrunnen</button></div>`}
const _newCardio64=newCardio;newCardio=function(sport,plan){_newCardio64(sport,plan);if(UI.cardio&&plan&&/trail/i.test([plan.title,plan.note].join(" "))&&UI.cardio.sport==="Hardlopen"){UI.cardio.trail=true;saveCardioDraft();render()}};
/* producten van de beheerder automatisch delen met iedereen, bij elke toevoeging, wijziging of verwijdering */
let fsTimer=null;
function fsItems(){return Object.entries(S.foods||{}).filter(([,f])=>f&&f.n).map(([id,f])=>({id,n:f.n,k:+f.k||0,p:+f.p||0,c:+f.c||0,f:+f.f||0,por:f.por||100,...(f.ml?{ml:true}:{})}))}
function fsAutoShare(){if(!(S.me&&S.me.isAdmin))return;clearTimeout(fsTimer);fsTimer=setTimeout(async()=>{try{const items=fsItems();await rpc("kl_admin_setting_put",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_key:"foods",p_data:{items,updated:today()}});S.sharedFoods=items}catch(e){}},1500)}
const _put64=put;put=async function(col,id,data){const r=await _put64.apply(this,arguments);if(col==="foods")fsAutoShare();return r};
const _del64=del;del=async function(col,id){const r=await _del64.apply(this,arguments);if(col==="foods")fsAutoShare();return r};
/* bij het opstarten: loopt de gedeelde lijst achter, dan bijwerken */
const _loadShared64=loadSharedFoods;loadSharedFoods=async function(){await _loadShared64();if(S.me&&S.me.isAdmin&&S.ready){const a=fsItems(),b=S.sharedFoods||[];const sig=l=>l.map(x=>[x.id,x.n,x.k,x.p,x.c,x.f,x.por,!!x.ml].join("|")).sort().join("#");if(sig(a)!==sig(b))fsAutoShare()}};
adminFoodShare=function(){const n=Object.keys(S.foods||{}).length;
  return `<h2>Producten delen</h2><div class="card stack"><p class="hp small" style="margin:0">Je eigen producten (${n}) zijn automatisch beschikbaar voor iedereen. Voeg je een product toe, pas je het aan of verwijder je het, dan wordt de lijst meteen bijgewerkt. Alleen naam en voedingswaarden gaan mee, niet wanneer of hoeveel je iets eet.</p>
    <button class="btn" data-act="fs-share" ${n?"":"disabled"}>Nu opnieuw delen</button><span class="small muted">Nu gedeeld: ${(S.sharedFoods||[]).length}</span></div>`};
let fsChecked=false;const _render64=render;render=function(){const r=_render64.apply(this,arguments);if(!fsChecked&&pid&&S.ready&&loadedAt&&S.me&&S.me.isAdmin){fsChecked=true;setTimeout(()=>loadSharedFoods(),500)}return r};

