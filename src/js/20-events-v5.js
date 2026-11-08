/* ---------- events v5 ---------- */
document.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-act]");if(!b)return;
  const act=b.dataset.act,v=b.dataset.v;
  switch(act){
    case "go-news":UI.tab="news";lsSet(LS_TAB,"news");UI.fb=undefined;UI.sheet=null;render();window.scrollTo(0,0);break;
    case "news-dismiss":lsSet("krachtlogboek.seen",APP_VERSION);render();break;
    case "fb-kind":UI.fbDraft.kind=v;UI.fbDraft.body=document.getElementById("fb-body")?.value||"";render();break;
    case "fb-send":await sendFeedback();break;
    case "fb-set":await setFeedback(v);break;
    case "res-make":await makeResultsCode();break;
    case "c-other":UI.cardio.other=UI.cardio.other===v?"":v;saveCardioDraft();render();break;
    case "c-gpx":document.getElementById("gpx-file")?.click();break;
    case "n-tab":UI.foodTab=v;UI.prefOpen=false;render();window.scrollTo(0,0);break;
    case "n-edit":{if(UI.nutEdit){UI.nutEdit=null}else{const nu=(S.meta.body||{}).nut||{};UI.nutEdit={kcal:nu.kcal?String(nu.kcal):"",p:nu.pct?String(nu.pct.p):"",c:nu.pct?String(nu.pct.c):"",f:nu.pct?String(nu.pct.f):""}}render();break}
    case "n-save":await saveNut(false);break;
    case "n-reset":await saveNut(true);break;
    case "n-pref-open":UI.prefOpen=true;UI.prefDraft=null;render();window.scrollTo(0,0);break;
    case "n-pref-close":UI.prefOpen=false;UI.prefDraft=null;render();break;
    case "n-diet":{const p=UI.prefDraft;p.diet=p.diet||{};p.diet[v]=!p.diet[v];render();break}
    case "n-pref":{const p=UI.prefDraft;if(p.likes.includes(v)){p.likes=p.likes.filter(x=>x!==v);p.dislikes.push(v)}else if(p.dislikes.includes(v))p.dislikes=p.dislikes.filter(x=>x!==v);else p.likes.push(v);
      const y=window.scrollY;render();window.scrollTo(0,y);break}
    case "n-pref-save":await put("meta","foodprefs",UI.prefDraft);UI.prefOpen=false;UI.prefDraft=null;dayCache=null;toastOk("Voorkeuren opgeslagen");render();window.scrollTo(0,0);break;
    case "n-reroll":UI.daySeed=(UI.daySeed||0)+1;render();toast("Nieuwe voorstellen gemaakt");break;
    case "n-day":UI.dayOpen=UI.dayOpen===+v?null:+v;render();break;
    case "n-day-log":{const n=nutrition(),items=exampleDays(n)[+v],d=today();const cur=logDay(d).slice();
      for(const it of items){const m=macrosOf(it);cur.push({meal:it.meal,fid:it.id,name:FOOD[it.id].n,g:it.g,k:Math.round(m.k),p:+m.p.toFixed(1),c:+m.c.toFixed(1),f:+m.f.toFixed(1)})}
      await put("foodlog",d,{date:d,items:cur});UI.foodTab="dagboek";UI.logDate=d;toastOk(`Voorbeelddag ${"ABC"[+v]} in je dagboek gezet`);render();window.scrollTo(0,0);break}
    case "n-log-prev":UI.logDate=addDays(UI.logDate||today(),-1);render();break;
    case "n-log-next":UI.logDate=addDays(UI.logDate||today(),1);render();break;
    case "n-log-del":{const d=UI.logDate||today(),cur=logDay(d).slice();cur.splice(+v,1);await put("foodlog",d,{date:d,items:cur});render();break}
    case "n-add":UI.sheet={type:"food-add",meal:v,q:""};render();setTimeout(()=>document.getElementById("fa-q")?.focus(),30);break;
    case "n-fa-pick":{const f=anyFood(v);if(f){UI.sheet.pick={...f};UI.sheet.g=null;renderSheet()}break}
    case "n-fa-offpick":{UI.sheet.pick={...UI.sheet.off[+v]};UI.sheet.g=null;renderSheet();break}
    case "n-fa-recent":{const recent=[];const seen=new Set();for(const d of Object.keys(S.foodlog).sort().reverse())for(const it of logDay(d).slice().reverse()){if(recent.length>=8)break;if(UI.sheet&&UI.sheet.meal&&it.meal!==UI.sheet.meal)continue;const k=it.fid||it.name;if(seen.has(k))continue;seen.add(k);recent.push(it)}
      const it=recent[+v];if(!it)break;const f=anyFood(it.fid)||{n:it.name,k:it.k/it.g*100,p:it.p/it.g*100,c:it.c/it.g*100,f:it.f/it.g*100,por:it.g};UI.sheet.pick={...f,id:it.fid};UI.sheet.g=String(it.g);renderSheet();break}
    case "n-fa-q":UI.sheet.g=v;renderSheet();break;
    case "n-fa-back":UI.sheet.pick=null;UI.sheet.custom=null;renderSheet();break;
    case "n-fa-add":{const sh=UI.sheet,f=sh.pick,g=num(document.getElementById("fa-g")?.value)||0;if(g<=0||g>3000){toast("Vul een geldig aantal gram in.");return}
      let fid=f.id&&!f.off?f.id:null;if(f.off){fid=await ensureFood({n:f.n+(f.brand?` (${f.brand})`:""),k:f.k,p:f.p,c:f.c,f:f.f,por:f.por||100})}
      const d=UI.logDate||today();await logAdd(d,{meal:sh.meal,fid,name:f.n+(f.brand?` (${f.brand})`:""),g,...(faUnit(sh)==="ml"?{ml:true}:{}),k:Math.round(f.k*g/100),p:+(f.p*g/100).toFixed(1),c:+(f.c*g/100).toFixed(1),f:+(f.f*g/100).toFixed(1)});
      UI.sheet=null;toastOk(`${f.n} toegevoegd`);render();break}
    case "n-fa-save":{const f=UI.sheet.pick,id=uid();await put("foods",id,{n:f.n+(f.brand?` (${f.brand})`:""),k:f.k,p:f.p,c:f.c,f:f.f,por:f.por||100});UI.sheet.pick={...f,id:"c:"+id,off:false};toastOk("Bewaard bij je producten");renderSheet();break}
    case "n-off":{const q=(document.getElementById("fa-q")?.value||"").trim();if(q.length<3)return;await offSearch(q);break}
    case "n-custom":UI.sheet.custom={n:UI.sheet.q||""};renderSheet();break;
    case "n-cf-save":{const g=id=>num(document.getElementById(id)?.value);const n_=(document.getElementById("cf-n")?.value||"").trim(),k=g("cf-k");
      if(!n_||!k){toast("Vul minstens de naam en het aantal kcal per 100 g in.");return}
      const id=uid(),f={n:n_,k,p:g("cf-p")||0,c:g("cf-c")||0,f:g("cf-f")||0,por:g("cf-por")||100,...(UI.sheet.custom&&UI.sheet.custom.ml?{ml:true}:{})};await put("foods",id,f);UI.sheet.custom=null;UI.sheet.pick={...f,id:"c:"+id};UI.sheet.g=null;renderSheet();break}
    case "n-shop-ck":{const k="krachtlogboek.shop."+pid,d=lsGet(k)||{};d[v]=!d[v];lsSet(k,d);render();break}
    case "n-shop-reset":lsSet("krachtlogboek.shop."+pid,null);render();break;
    case "n-shop-copy":{const rows=(UI.shopRows||[]).filter(r=>!r.have);if(!rows.length){toast("De lijst is leeg.");return}const txt="Boodschappen (Athlevon)\n"+rows.map(r=>`- ${r.f.n}: ${r.packs} × ${r.f.pkg>=1000?fmt1(r.f.pkg/1000)+" kg":r.f.pkg+" g"}`).join("\n");try{await navigator.clipboard.writeText(txt);toast("Lijst gekopieerd. Plak hem in je notities of WhatsApp.")}catch(e){toast("Kopiëren lukte niet op dit apparaat.")}break}
    case "n-prices":UI.sheet={type:"prices"};render();break;
    case "n-prices-save":{const eur={};for(const f of FOODS){const x=num(document.getElementById("pr-"+f.id)?.value);if(x>0)eur[f.id]=x}
      try{const data={eur,updated:today()};await rpc("kl_admin_setting_put",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_key:"prices",p_data:data});S.prices=data;UI.sheet=null;toast("Prijzen opgeslagen voor iedereen");render()}catch(e){handleErr(e)}break}
  }
});
document.addEventListener("input",ev=>{
  const t=ev.target,id=t.id||"";
  if(id==="pf-steps"&&UI.pf)UI.pf.steps=t.value;
  else if(id==="c-other"&&UI.cardio){UI.cardio.other=t.value;saveCardioDraft();document.querySelectorAll('[data-act="c-other"]').forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.v===t.value)))}
  else if(id.startsWith("ne-")&&UI.nutEdit){UI.nutEdit[id.slice(3)]=t.value;const e=UI.nutEdit,s=(num(e.p)||0)+(num(e.c)||0)+(num(e.f)||0),el=document.getElementById("ne-sum");if(el)el.textContent=s?`Samen ${s}%${Math.abs(s-100)<0.6?" ✓":" · moet 100% zijn"}`:"Laat leeg om het advies te gebruiken"}
  else if(id==="fb-body"&&UI.fbDraft)UI.fbDraft.body=t.value;
  else if(id==="fa-q"&&UI.sheet&&UI.sheet.type==="food-add"){UI.sheet.q=t.value;UI.sheet.off=null;renderSheet();const el=document.getElementById("fa-q");if(el){el.focus();const n=el.value.length;try{el.setSelectionRange(n,n)}catch(e){}}}
  else if(id==="fa-g"&&UI.sheet&&UI.sheet.pick){UI.sheet.g=t.value;const f=UI.sheet.pick,g=num(t.value)||0,el=document.getElementById("fa-live");if(el)el.textContent=mTxt({k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100})}
});
document.addEventListener("change",ev=>{
  const t=ev.target,id=t.id||"";
  if(id==="gpx-file"&&t.files&&t.files[0]){importGpx(t.files[0]);t.value=""}
  else if(/^shop-\d$/.test(id)){const c=UI.shopDays||[3,2,2];c[+id.slice(5)]=+t.value;UI.shopDays=c;render()}
});
document.addEventListener("keydown",ev=>{if(ev.key==="Enter"&&ev.target.id==="fa-q"){ev.preventDefault();const q=ev.target.value.trim();if(q.length>=3&&!UI.sheet.off)offSearch(q)}});

