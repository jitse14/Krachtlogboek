/* ---------- beheer ---------- */
const personName=id=>(S.people||[]).find(p=>p.id===id)?.name||"";
async function loadPeople(){
  try{
    const rows=await rpc("kl_admin_profiles",{p_code:code,p_admin:pid,p_admin_pin:myPin()});
    S.people=(rows||[]).map(r=>({id:r.id,name:r.name,hasPin:!!r.has_pin,isAdmin:!!r.is_admin,last:r.last_activity,sessions:+r.sessions||0}));render();
  }catch(e){if(e.code==="not_admin"&&S.me){S.me.isAdmin=false;lsSet(LS_ME,{id:pid,...S.me});render()}}
}
async function adminResetPin(){
  const t=document.getElementById("ad-who")?.value,a=(document.getElementById("ad-new")?.value||"").trim();
  if(!t){toast("Kies een account.");return}
  if(a.length<6){toast("Kies een code van minimaal 6 tekens.");return}
  try{await rpc("kl_admin_set_pin",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_target:t,p_new:a});document.getElementById("ad-new").value="";toast(`Nieuwe code ingesteld voor ${personName(t)}. Geef deze door.`);loadPeople()}
  catch(e){handleErr(e)}
}
async function adminDelete(t){
  const name=personName(t);
  try{await rpc("kl_admin_delete_profile",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_target:t});UI.confirm=null;UI.delWho=null;if(UI.coach&&UI.coach.who===t)UI.coach.who=null;toast(`Account van ${name} verwijderd`);await loadPeople()}
  catch(e){UI.confirm=null;handleErr(e)}
}
async function coachLoad(){
  const c=UI.coach;if(!c||!c.who)return;const who=c.who;
  try{
    const rows=await rpc("kl_admin_plan_load",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_target:who});
    const d={plan:{},sessions:{}};(rows||[]).forEach(r=>{if(d[r.coll])d[r.coll][r.id]=r.data});
    if(UI.coach&&UI.coach.who===who){UI.coach.data=d;render()}
  }catch(e){handleErr(e)}
}
async function coachSave(){
  const c=UI.coach,f=c&&c.form;if(!f)return;
  if(!f.date){toast("Kies een datum.");return}
  if(!f.title.trim()){toast("Geef de training een titel, bijvoorbeeld \"Interval 6×400 m\".");document.getElementById("co-title")?.focus();return}
  const base={sport:f.sport,title:f.title.trim(),purpose:f.purpose||null,durMin:num(f.durMin),km:num(f.km),desc:(f.desc||"").trim(),coach:S.me.name,updated:Date.now()};
  const n=f.id?1:Math.max(1,parseInt(f.repeat)||1),jobs=[],stem=uid();
  for(let k=0;k<n;k++)jobs.push([f.id||stem+"w"+k,{...base,date:addDays(f.date,7*k)}]);
  try{
    for(const [id,d] of jobs){await rpc("kl_admin_plan_put",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_target:c.who,p_id:id,p_data:d});c.data.plan[id]=d}
    const who=personName(c.who);c.form=null;
    toast(f.id?`Training aangepast voor ${who}`:n>1?`${n} trainingen ingepland voor ${who}`:`Training ingepland voor ${who}`);
    render();window.scrollTo(0,0);if(c.who===pid)reloadData(pid);
  }catch(e){handleErr(e)}
}
async function coachDelete(){
  const c=UI.coach,id=c&&c.form&&c.form.id;if(!id)return;
  try{await rpc("kl_admin_plan_del",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_target:c.who,p_id:id});delete c.data.plan[id];c.form=null;UI.confirm=null;toast("Geplande training verwijderd");render();if(c.who===pid)reloadData(pid)}
  catch(e){UI.confirm=null;handleErr(e)}
}
async function importBackup(obj){
  if(!obj||!COLLS.some(c=>obj[c]&&typeof obj[c]==="object")){toast("Dit bestand is geen back-up van Athlevon.");return}
  const jobs=[];
  for(const c of COLLS)for(const [k,v] of Object.entries(obj[c]||{}))jobs.push([c,k,v]);
  let done=0;toast(`Back-up terugzetten… 0 van ${jobs.length}`);
  try{
    for(let i=0;i<jobs.length;i+=8){
      await Promise.all(jobs.slice(i,i+8).map(([c,k,v])=>rpc("kl_put",{p_code:code,p_profile:pid,p_pin:myPin(),p_coll:c,p_id:k,p_data:v}).then(()=>{done++})));
      toast(`Back-up terugzetten… ${done} van ${jobs.length}`);
    }
  }catch(e){handleErr(e);return}
  await reloadData(pid);toast(`Back-up teruggezet: ${jobs.length} onderdelen`);
}
function exportBackup(){
  const data={app:"krachtlogboek",version:3,exported:new Date().toISOString(),profile:S.me?.name||""};
  COLLS.forEach(c=>data[c]=S[c]);
  const blob=new Blob([JSON.stringify(data,null,1)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=`krachtlogboek-${norm(S.me?.name||"backup").replace(/[^a-z0-9]+/g,"-")}-${today()}.json`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState!=="visible"||!pid)return;if(queue().length)flushQueue();else if(!draft&&!UI.edit&&!UI.cardio&&!UI.coach&&Date.now()-loadedAt>60000)reloadData(pid)});
window.addEventListener("online",()=>{if(pid&&queue().length)flushQueue()});
setInterval(()=>{if(pid&&queue().length&&navigator.onLine!==false)flushQueue()},20000);

