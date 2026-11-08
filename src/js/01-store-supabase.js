/* ---------- store (Supabase) ---------- */
const CFG={url:"https://vxmdbjtuuvrryazrnkfx.supabase.co",key:"sb_publishable_RhOl_un8Ik35a73T3QLThA_niKqiuTQ"};
const LS_CODE="krachtlogboek.code",LS_ME="krachtlogboek.me";
const COLLS=["exercises","routines","sessions","meta","weights","plan","folders","foodlog","foods","archive","meals","mealplans"];
let code=lsGet(LS_CODE),loadedAt=0,flushing=false;
const pinKey=id=>"krachtlogboek.pin."+id;
const qKey=id=>"krachtlogboek.queue."+id;
const cacheKey=id=>"krachtlogboek.cache."+id;
const cardioKey=()=>"krachtlogboek.cardio."+pid;
const myPin=()=>lsGet(pinKey(pid));
const queue=()=>pid?(lsGet(qKey(pid))||[]):[];
function isoOf(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function addDays(iso,n){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return isoOf(d)}
async function rpc(fn,args){
  const h={"Content-Type":"application/json","apikey":CFG.key};
  if(!CFG.key.startsWith("sb_publishable_"))h.Authorization="Bearer "+CFG.key;
  let r;
  try{r=await fetch(CFG.url.replace(/\/$/,"")+"/rest/v1/rpc/"+fn,{method:"POST",headers:h,body:JSON.stringify(args)})}
  catch(e){const err=new Error("offline");err.code="net";throw err}
  if(!r.ok){let m="";try{m=(await r.json()).message||""}catch(e){}
    const err=new Error(m||("HTTP "+r.status));
    err.code=/groepscode/i.test(m)?"bad_code":/persoonlijke code/i.test(m)?"bad_pin":/te kort/i.test(m)?"short_pin":/beheerder/i.test(m)?"not_admin":/bestaat al/i.test(m)?"dup_name":/eigen account/i.test(m)?"self":/naam ontbreekt/i.test(m)?"no_name":/geen toestemming/i.test(m)?"no_perm":/te veel/i.test(m)?"too_many":/niet gevonden/i.test(m)?"no_share":/te groot/i.test(m)?"too_big":"net";throw err}
  const t=await r.text();return t?JSON.parse(t):null;
}
function initStore(){
  S.profilesReady=true;
  if(!code){UI.login="code";render();return}
  const me=lsGet(LS_ME);
  if(me&&me.id&&lsGet(pinKey(me.id))){enterProfile(me);return}
  UI.login="login";render();
}
async function submitCode(c){
  c=String(c||"").trim();if(!c){toast("Vul de groepscode in.");return}
  try{await rpc("kl_code_ok",{p_code:c});code=c;lsSet(LS_CODE,c);UI.login="login";render();setTimeout(()=>document.getElementById("li-name")?.focus(),30)}
  catch(e){toast(e.code==="bad_code"?"Deze groepscode klopt niet. Vraag de juiste code na.":"Geen verbinding. Controleer je internet en probeer het opnieuw.")}
}
async function submitLogin(){
  const name=(document.getElementById("li-name")?.value||"").trim(),pin=(document.getElementById("li-pin")?.value||"").trim();
  UI.loginName=name;
  if(!name){toast("Vul je naam in.");return}
  try{
    const r=((await rpc("kl_login_name",{p_code:code,p_name:name,p_pin:pin}))||[])[0];
    if(!r){toast("Naam of code klopt niet.");return}
    if(!r.id&&r.name==="__locked__"){toast("Te veel foute pogingen. Probeer het over 15 minuten opnieuw, of vraag Jitse om je code opnieuw in te stellen.");return}
    if(r.needs_pin){UI.login="setpin";UI.pinFor={id:r.id,name:r.name,isAdmin:!!r.is_admin};render();setTimeout(()=>document.getElementById("pin-1")?.focus(),30);return}
    lsSet(pinKey(r.id),pin);enterProfile({id:r.id,name:r.name,isAdmin:!!r.is_admin});
  }catch(e){
    if(e.code==="bad_pin")toast("Naam of code klopt niet. Code vergeten? Vraag Jitse om een nieuwe.");
    else if(e.code==="bad_code")handleErr(e);
    else toast("Geen verbinding. Controleer je internet en probeer het opnieuw.");
  }
}
async function submitFirstPin(){
  const p=UI.pinFor,a=(document.getElementById("pin-1")?.value||"").trim(),b=(document.getElementById("pin-2")?.value||"").trim();
  if(!p)return;
  if(a.length<6){toast("Kies een code van minimaal 6 tekens.");return}
  if(a!==b){toast("De twee codes zijn niet gelijk.");return}
  try{await rpc("kl_set_first_pin",{p_code:code,p_profile:p.id,p_pin:a});lsSet(pinKey(p.id),a);enterProfile(p);toast("Persoonlijke code ingesteld")}
  catch(e){handleErr(e)}
}
function enterProfile(me){
  pid=me.id;S.me={name:me.name,isAdmin:!!me.isAdmin};lsSet(LS_ME,{id:me.id,name:me.name,isAdmin:!!me.isAdmin});lsSet(LS_PROFILE,me.id);
  COLLS.forEach(c=>S[c]={});S.ready=false;S.people=null;S.social=null;inboxDone.clear();loadedAt=0;
  draft=lsGet(draftKey());UI.cardio=lsGet(cardioKey());UI.sheet=null;UI.edit=null;UI.confirm=null;UI.coach=null;UI.login="login";UI.pinFor=null;UI.shop2=null;UI.planEdit=null;UI.mealEdit=null;UI.shopMode=null;UI.foodTab=null;
  const cache=lsGet(cacheKey(me.id));
  if(cache){COLLS.forEach(c=>S[c]=cache[c]||{});applyQueue();S.ready=true}
  render();reloadData(me.id);
}
async function reloadData(id){
  await flushQueue();
  if(pid!==id)return;
  try{
    const rows=await rpc("kl_load",{p_code:code,p_profile:id,p_pin:lsGet(pinKey(id))});
    if(pid!==id)return;
    const o={};COLLS.forEach(c=>o[c]={});
    (rows||[]).forEach(r=>{if(o[r.coll])o[r.coll][r.id]=r.data});
    COLLS.forEach(c=>S[c]=o[c]);applyQueue();saveCache();
    S.ready=true;S.mode=queue().length?"offline":"cloud";loadedAt=Date.now();render();
    if(S.me&&S.me.isAdmin&&!S.people)loadPeople();
    await seedStandard();
    try{const nc=await rpc("kl_current_code",{p_code:code,p_profile:id,p_pin:lsGet(pinKey(id))});if(nc&&nc!==code){code=nc;lsSet(LS_CODE,nc)}}catch(e){}
    loadPrices();loadSharedFoods();
    await compactOld();
    await migrateGroups();
    loadSocial();
    checkIntro();
    if(UI.pendingShare&&pid===id){const c=UI.pendingShare;UI.pendingShare=null;lookupShare(c)}
  }catch(e){if(pid===id)handleErr(e)}
}
function applyQueue(){for(const q of queue()){if(q.op==="put")S[q.col]={...S[q.col],[q.id]:q.data};else{const n={...S[q.col]};delete n[q.id];S[q.col]=n}}}
function saveCache(){if(!pid)return;const o={};COLLS.forEach(c=>o[c]=S[c]);lsSet(cacheKey(pid),o)}
function enqueue(op,col,id,data){const q=queue().filter(x=>!(x.col===col&&x.id===id));q.push({op,col,id,data:data??null});lsSet(qKey(pid),q)}
async function flushQueue(){
  if(flushing||!pid)return;
  const id=pid;let q=lsGet(qKey(id))||[];if(!q.length)return;
  flushing=true;let sent=0;
  try{
    while(q.length&&pid===id){
      const it=q[0];
      try{await rpc(it.op==="put"?"kl_put":"kl_del",it.op==="put"?{p_code:code,p_profile:id,p_pin:lsGet(pinKey(id)),p_coll:it.col,p_id:it.id,p_data:it.data}:{p_code:code,p_profile:id,p_pin:lsGet(pinKey(id)),p_coll:it.col,p_id:it.id})}
      catch(e){if(e.code==="bad_pin"||e.code==="bad_code")handleErr(e);break}
      sent++;
      q=(lsGet(qKey(id))||[]).filter(x=>!(x.col===it.col&&x.id===it.id&&JSON.stringify(x.data)===JSON.stringify(it.data)));lsSet(qKey(id),q);
    }
  }finally{flushing=false}
  if(pid===id){if(!q.length){S.mode="cloud";if(sent)toast("Je opgeslagen wijzigingen zijn verstuurd")}else S.mode="offline";render()}
}
async function put(col,id,data){
  S[col]={...S[col],[id]:data};saveCache();
  if(queue().length){enqueue("put",col,id,data);flushQueue();return false}
  try{await rpc("kl_put",{p_code:code,p_profile:pid,p_pin:myPin(),p_coll:col,p_id:id,p_data:data});S.mode="cloud";return true}
  catch(e){enqueue("put",col,id,data);if(e.code==="net"){S.mode="offline";render()}else handleErr(e);return false}
}
async function del(col,id){
  const n={...S[col]};delete n[id];S[col]=n;saveCache();
  if(queue().length){enqueue("del",col,id);flushQueue();return false}
  try{await rpc("kl_del",{p_code:code,p_profile:pid,p_pin:myPin(),p_coll:col,p_id:id});return true}
  catch(e){enqueue("del",col,id);if(e.code==="net"){S.mode="offline";render()}else handleErr(e);return false}
}
function toastOk(msg){toast(queue().length?msg+" op je telefoon. Wordt verstuurd zodra je internet hebt.":msg)}
function handleErr(e){
  if(e&&e.code==="bad_code"){code=null;lsSet(LS_CODE,null);toast("De groepscode is gewijzigd. Vul de nieuwe code in.");pid=null;S.me=null;S.ready=false;UI.login="code"}
  else if(e&&e.code==="bad_pin"){if(pid){lsSet(pinKey(pid),null);UI.loginName=S.me?.name||"";lsSet(LS_ME,null);pid=null;S.me=null;S.ready=false;UI.login="login"}toast("Je persoonlijke code is gewijzigd. Log opnieuw in.")}
  else if(e&&e.code==="too_many")toast("Te veel foute pogingen met je code. Probeer het over 15 minuten opnieuw.");
  else if(e&&e.code==="short_pin")toast("Kies een code van minimaal 6 tekens.");
  else if(e&&e.code==="not_admin")toast("Alleen de beheerder kan dit doen.");
  else if(e&&e.code==="dup_name")toast("Deze naam is al in gebruik. Kies een andere, bijvoorbeeld met je achternaam erbij.");
  else if(e&&e.code==="self")toast("Je kunt je eigen account niet verwijderen.");
  else{S.mode="offline";toast("Geen verbinding. Controleer je internet en probeer het opnieuw.")}
  render();
}
function logout(){
  const n=queue().length;
  if(pid){lsSet(pinKey(pid),null);lsSet(cacheKey(pid),null)}
  pid=null;draft=null;S.me=null;S.people=null;S.social=null;S.ready=false;lsSet(LS_ME,null);lsSet(LS_PROFILE,null);
  UI.tab="train";lsSet(LS_TAB,"train");UI.login=code?"login":"code";UI.loginName="";UI.sheet=null;UI.edit=null;UI.cardio=null;UI.coach=null;UI.confirm=null;render();window.scrollTo(0,0);
  if(n)toast(`${n} wijziging${n>1?"en zijn":" is"} nog niet verstuurd. Die blijven op deze telefoon bewaard en worden verstuurd als je weer inlogt.`);
}
async function createProfile(name,withTemplate){
  const clean=name.trim();
  const a=(document.getElementById("np-pin")?.value||"").trim(),b=(document.getElementById("np-pin2")?.value||"").trim();
  if(!clean){toast("Vul je naam in.");return}
  if(a.length<6){toast("Kies een persoonlijke code van minimaal 6 tekens.");return}
  if(a!==b){toast("De twee codes zijn niet gelijk.");return}
  if(!consentChecked("np-")){toast("Vink de drie punten onderaan aan om een account te maken.");return}
  const id=uid();
  try{await rpc("kl_profile_create",{p_code:code,p_id:id,p_name:clean,p_pin:a})}
  catch(e){if(e.code==="dup_name"){toast("Deze naam is al in gebruik. Kies een andere, bijvoorbeeld met je achternaam erbij.");document.getElementById("np-name")?.focus()}else if(e.code==="net")toast("Geen verbinding. Controleer je internet en probeer het opnieuw.");else handleErr(e);return}
  lsSet(pinKey(id),a);
  try{await rpc("kl_put",{p_code:code,p_profile:id,p_pin:a,p_coll:"meta",p_id:"consent",p_data:{v:CONSENT_V,at:new Date().toISOString()}})}catch(e){}
  try{await rpc("kl_put",{p_code:code,p_profile:id,p_pin:a,p_coll:"meta",p_id:"seen",p_data:{v:APP_VERSION,welcome:1}})}catch(e){}
  if(withTemplate){
    try{
      await Promise.all([
        ...Object.entries(TEMPLATE.exercises).map(([k,v])=>rpc("kl_put",{p_code:code,p_profile:id,p_pin:a,p_coll:"exercises",p_id:k,p_data:v})),
        ...Object.entries(TEMPLATE.routines).map(([k,v])=>rpc("kl_put",{p_code:code,p_profile:id,p_pin:a,p_coll:"routines",p_id:k,p_data:v}))]);
    }catch(e){toast("Account aangemaakt, maar de voorbeeldschema's konden niet allemaal worden toegevoegd.")}
  }
  UI.newName="";enterProfile({id,name:clean,isAdmin:false});toast(`Welkom, ${clean}. Ga naar Profiel om je gegevens in te vullen.`);
}
async function changeOwnPin(){
  const o=(document.getElementById("cp-old")?.value||"").trim(),a=(document.getElementById("cp-new")?.value||"").trim(),b=(document.getElementById("cp-new2")?.value||"").trim();
  if(a.length<6){toast("Kies een nieuwe code van minimaal 6 tekens.");return}
  if(a!==b){toast("De twee nieuwe codes zijn niet gelijk.");return}
  try{await rpc("kl_change_pin",{p_code:code,p_profile:pid,p_pin:o,p_new:a});lsSet(pinKey(pid),a);UI.pinOpen=false;toast("Je persoonlijke code is gewijzigd");render()}
  catch(e){if(e.code==="bad_pin")toast("Je huidige code klopt niet.");else handleErr(e)}
}
