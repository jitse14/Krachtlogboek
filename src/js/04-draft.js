/* ---------- draft ---------- */
function saveDraft(){if(pid)lsSet(draftKey(),draft)}
function entryFor(exId,target){
  const last=lastFor(exId);
  const n=parseInt(target?.sets)||(last?last.sets.length:0)||3;
  return{exId,name:exName(exId),group:exGroup(exId),target:target&&(target.sets||target.reps||target.note)?{sets:target.sets||"",reps:target.reps||"",note:target.note||""}:null,sets:Array.from({length:n},()=>({k:"",r:""}))};
}
function startWorkout(routineId,plan){
  const r=routineId?S.routines[routineId]:null;
  draft={id:uid(),date:today(),planId:plan?.id||null,routineId:routineId||null,routineName:r?r.name:"Losse training",entries:r?(r.items||[]).filter(i=>S.exercises[i.exId]).map(i=>entryFor(i.exId,i)):[]};
  saveDraft();UI.confirm=null;render();window.scrollTo(0,0);
}
function placeholderFor(entry,j){const last=lastFor(entry.exId);if(!last)return null;return last.sets[j]||last.sets[last.sets.length-1]}
function rowIsPR(entry,st){const r=num(st.r);if(!r||r<=0)return false;const k=num(st.k)||0;const b=bestFor(entry.exId);return !b||better({k,r},b.set)}
async function finishWorkout(){
  const entries=draft.entries.map(e=>({exId:e.exId,name:exName(e.exId,e.name),group:exGroup(e.exId,e.group),...((e.note||"").trim()?{note:e.note.trim().slice(0,500)}:{}),sets:e.sets.map(s=>({k:num(s.k)||0,r:Math.round(num(s.r)||0)})).filter(s=>s.r>0)})).filter(e=>e.sets.length);
  if(!entries.length){toast("Vul minstens één set in met herhalingen.");return}
  let prs=0;for(const e of entries){let b=bestFor(e.exId)?.set||null;for(const s of e.sets)if(better(s,b)){prs++;b=s}}
  const id=draft.id||uid();
  const rec={date:draft.date||today(),ts:Date.now(),routineId:draft.routineId,routineName:draft.routineName,entries};if((draft.note||"").trim())rec.note=draft.note.trim().slice(0,1000);
  if(draft.planId&&S.plan[draft.planId]){rec.planId=draft.planId;rec.planTitle=planTitle({id:draft.planId,...S.plan[draft.planId]})}
  draft=null;saveDraft();UI.confirm=null;
  const ok=await put("sessions",id,rec);
  if(!ok)toast("Geen internet: training bewaard op je telefoon. Wordt automatisch verstuurd zodra je verbinding hebt.");
  else toast(prs?`Training opgeslagen · ${prs} nieuw${prs>1?"e":""} record${prs>1?"s":""}`:"Training opgeslagen");
  render();window.scrollTo(0,0);fbAfterSave(id,rec);
}

