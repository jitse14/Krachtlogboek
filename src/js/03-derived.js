/* ---------- derived ---------- */
function sortedSessions(){return Object.entries(S.sessions).map(([id,s])=>({id,...s})).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.ts||0)-(a.ts||0))}
function exName(id,fallback){return S.exercises[id]?.name||fallback||"Onbekende oefening"}
function exGroup(id,fallback){return S.exercises[id]?.group||fallback||"Overig"}
function exKey(id){return norm(exName(id))}
function entryKey(e){return S.exercises[e.exId]?norm(S.exercises[e.exId].name):norm(e.name)}
function bestFor(exId){
  const k=exKey(exId);let best=null,date=null;
  for(const s of Object.values(S.sessions))for(const e of s.entries||[])if(entryKey(e)===k)for(const st of e.sets||[])if(st.r>0&&better(st,best)){best=st;date=s.date}
  return best?{set:best,date}:null;
}
function lastFor(exId){
  const k=exKey(exId);
  for(const s of sortedSessions()){const e=(s.entries||[]).find(x=>entryKey(x)===k);if(e&&e.sets&&e.sets.length)return{sets:e.sets,date:s.date,name:s.routineName}}
  return null;
}
function historyFor(exId){const k=exKey(exId);const out=[];for(const s of sortedSessions()){const e=(s.entries||[]).find(x=>entryKey(x)===k);if(e&&e.sets&&e.sets.length)out.push({date:s.date,name:s.routineName,sets:e.sets})}return out}

