/* ---------- events ---------- */
function addExercise(exId){
  if(UI.sheet.mode==="draft"){draft.entries.push(entryFor(exId,null));saveDraft()}
  else UI.edit.items.push({exId,sets:"",reps:""});
  UI.sheet=null;UI.pickQ="";render();
}
document.addEventListener("click",async ev=>{
  const tb=ev.target.closest("nav.tabs button");
  if(tb){if(tb.dataset.tab==="profile")UI.pf=null;UI.tab=tb.dataset.tab;UI.confirm=null;lsSet(LS_TAB,UI.tab);render();window.scrollTo(0,0);return}
  const b=ev.target.closest("[data-act]");if(!b)return;
  const act=b.dataset.act,i=+b.dataset.i,j=+b.dataset.j,id=b.dataset.id;
  if(act==="scrim"){if(ev.target===b){UI.sheet=null;UI.confirm=null;render()}return}
  switch(act){
    case "submit-code":await submitCode(document.getElementById("gc-code")?.value);break;
    case "export-backup":exportBackup();break;
    case "import-yes":{const o=UI.importObj;UI.importObj=null;UI.confirm=null;render();await importBackup(o);break}
    case "submit-login":await submitLogin();break;
    case "login-back":UI.login="login";UI.pinFor=null;render();break;
    case "flush":await flushQueue();break;
    case "plan-start":{const p=S.plan[id];if(!p)return;const k=planKind(p);
      if(draft){toast("Er loopt al een training. Rond die eerst af.");UI.sheet=null;UI.tab="train";render();return}
      if(k==="routine"&&!S.routines[p.routineId]){toast("Dit schema bestaat niet meer. Kies een ander schema.");return}
      UI.sheet=null;UI.confirm=null;UI.coach=null;UI.tab="train";lsSet(LS_TAB,"train");
      if(k==="routine")startWorkout(p.routineId,{...p,id});else newCardio(p.sport||"Hardlopen",{...p,id});break}
    case "go-plan":UI.tab="plan";lsSet(LS_TAB,"plan");UI.week=null;render();window.scrollTo(0,0);break;
    case "go-help":UI.tab="help";lsSet(LS_TAB,"help");UI.sheet=null;render();window.scrollTo(0,0);break;
    case "wk-prev":UI.week=addDays(UI.week||weekStart(today()),-7);render();break;
    case "wk-next":UI.week=addDays(UI.week||weekStart(today()),7);render();break;
    case "wk-today":UI.week=null;render();break;
    case "wk-copy":await weekCopy();break;
    case "pl-add":UI.sheet={type:"pl-add",date:id,kind:Object.keys(S.routines).length?"routine":spCardio().length?"cardio":"other",routineId:"",sport:spCardioFirst(),title:"",durMin:"",km:"",note:"",repeat:"1"};UI.confirm=null;render();break;
    case "pa-kind":UI.sheet.kind=b.dataset.v;render();break;
    case "pa-sport":UI.sheet.sport=b.dataset.v;render();break;
    case "pa-save":await planAddSave();break;
    case "pl-open":UI.sheet={type:"pl-item",id};UI.confirm=null;render();break;
    case "pl-check":{const p=S.plan[id];if(!p)return;await put("plan",id,{...p,doneAt:Date.now()});toastOk("Afgevinkt");render();break}
    case "pl-uncheck":{const p=S.plan[id];if(!p)return;const {doneAt,...rest}=p;await put("plan",id,rest);render();break}
    case "pl-move":{const p=S.plan[id],d=document.getElementById("pl-date")?.value,tm=document.getElementById("pl-time")?.value||"";if(!p||!d)return;const np={...p,date:d,updated:Date.now()};if(tm)np.time=tm;else delete np.time;await put("plan",id,np);UI.sheet=null;toastOk("Opgeslagen: "+dayName(d).toLowerCase()+(tm?" om "+tm:""));render();break}
    case "pl-del":UI.confirm="pl-del";render();break;
    case "pl-del-yes":await del("plan",id);UI.sheet=null;UI.confirm=null;toastOk("Uit je planning gehaald");render();break;
    case "fd-toggle":toggleOpen(id);break;
    case "fd-new":UI.folderEdit={id:null,name:""};UI.confirm=null;render();window.scrollTo(0,0);setTimeout(()=>document.getElementById("fd-name")?.focus(),30);break;
    case "fd-rename":UI.folderEdit={id,name:S.folders[id]?.name||"",cat:S.folders[id]?.cat||""};UI.confirm=null;render();window.scrollTo(0,0);setTimeout(()=>document.getElementById("fd-name")?.focus(),30);break;
    case "fd-save":await folderSave();break;
    case "fd-cancel":UI.folderEdit=null;render();break;
    case "fd-del":UI.confirm="fd-del:"+id;render();break;
    case "fd-del-all":await folderDelete(id,true);break;
    case "fd-del-keep":await folderDelete(id,false);break;
    case "lib-add":{const l=LIB.find(x=>x.id===id);b.disabled=true;toast("Toevoegen…");await addLibrary(id);toastOk(`Map "${l.name}" toegevoegd`);render();break}
    case "share-routine":await shareThing("routine",id);break;
    case "share-folder":await shareThing("folder",id);break;
    case "sh-lookup":await lookupShare(document.getElementById("sh-code")?.value);break;
    case "sh-import":await importShare();break;
    case "sh-native":{const sh=UI.sheet;try{await navigator.share({title:"Athlevon",text:shareText(sh),url:shareUrl(sh.code)})}catch(e){}break}
    case "sh-copy":{const sh=UI.sheet;const txt=shareText(sh)+" "+shareUrl(sh.code);try{await navigator.clipboard.writeText(txt);toast("Bericht met link gekopieerd. Plak het in WhatsApp.")}catch(e){toast("Kopiëren lukte niet. Geef de code door: "+sh.code)}break}
    case "coach-open":UI.coach={who:null,data:null,form:null};UI.confirm=null;UI.tab="train";lsSet(LS_TAB,"train");if(!S.people)loadPeople();render();window.scrollTo(0,0);break;
    case "coach-close":UI.coach=null;UI.confirm=null;render();window.scrollTo(0,0);break;
    case "co-new":UI.coach.form={id:null,date:addDays(today(),1),sport:"Hardlopen",title:"",purpose:"",durMin:"",km:"",desc:"",repeat:"1"};UI.confirm=null;render();setTimeout(()=>document.getElementById("co-title")?.focus(),30);break;
    case "co-edit":{const p=UI.coach.data.plan[id];UI.coach.form={id,date:p.date,sport:p.sport,title:p.title,purpose:p.purpose||"",durMin:p.durMin??"",km:p.km!=null?String(p.km).replace(".",","):"",desc:p.desc||"",repeat:"1"};UI.confirm=null;render();window.scrollTo(0,0);break}
    case "co-copy":{const f=UI.coach.form;f.id=null;f.date=addDays(f.date,7);render();toast("Kopie gemaakt, een week later. Pas aan en tik op Inplannen.");break}
    case "co-sport":UI.coach.form.sport=b.dataset.v;render();break;
    case "co-purpose":UI.coach.form.purpose=UI.coach.form.purpose===b.dataset.v?"":b.dataset.v;render();break;
    case "co-save":await coachSave();break;
    case "co-cancel":UI.coach.form=null;UI.confirm=null;render();break;
    case "co-del":UI.confirm="co-del";render();break;
    case "co-del-yes":await coachDelete();break;
    case "ad-del":{const t=document.getElementById("ad-delwho")?.value;if(!t){toast("Kies een account.");return}UI.delWho=t;UI.confirm="ad-del";render();break}
    case "ad-del-yes":await adminDelete(UI.delWho);break;
    case "ad-refresh":await loadPeople();toast("Lijst bijgewerkt");break;
    case "submit-firstpin":await submitFirstPin();break;
    case "go-profile":UI.tab="profile";lsSet(LS_TAB,"profile");render();window.scrollTo(0,0);break;
    case "pf-sex":pfDraft().sex=b.dataset.v;render();break;
    case "pf-goal":pfDraft().goal=b.dataset.v;render();break;
    case "pf-save":await saveProfile();break;
    case "w-add":{const kg=num(document.getElementById("w-kg")?.value),d=document.getElementById("w-date")?.value||today();if(!kg||kg<25||kg>300){toast("Vul een geldig gewicht in kg in.");return}await put("weights",d,{date:d,kg:Math.round(kg*10)/10});toastOk("Gewicht opgeslagen");render();break}
    case "w-del":await del("weights",id);render();break;
    case "cp-toggle":UI.pinOpen=!UI.pinOpen;render();break;
    case "cp-save":await changeOwnPin();break;
    case "ad-save":await adminResetPin();break;
    case "c-new":newCardio(b.dataset.v);break;
    case "c-sport":UI.cardio.sport=b.dataset.v;saveCardioDraft();render();break;
    case "c-purpose":UI.cardio.purpose=UI.cardio.purpose===b.dataset.v?"":b.dataset.v;saveCardioDraft();render();break;
    case "c-save":await saveCardio();break;
    case "c-cancel":UI.cardio=null;saveCardioDraft();render();break;
    case "login-new":UI.login="new";render();setTimeout(()=>document.getElementById("np-name")?.focus(),30);break;
    case "create-profile":{const n=document.getElementById("np-name")?.value||"";const t=document.getElementById("np-tpl");await createProfile(n,t?t.checked:false);break}
    case "logout":logout();break;
    case "start":startWorkout(id||null);break;
    case "start-from-schema":UI.tab="train";lsSet(LS_TAB,"train");if(draft){toast("Er loopt al een training. Rond die eerst af.");render()}else startWorkout(id);break;
    case "fill":{const ph=placeholderFor(draft.entries[i],j);if(ph){draft.entries[i].sets[j]={k:ph.k?String(ph.k).replace(".",","):"",r:String(ph.r)};saveDraft();render()}else toast("Nog geen vorige set om over te nemen.");break}
    case "add-set":{const e=draft.entries[i],prev=e.sets[e.sets.length-1];e.sets.push(prev&&(prev.k!==""||prev.r!=="")?{...prev}:{k:"",r:""});saveDraft();render();break}
    case "set-remove":draft.entries[i].sets.splice(j,1);saveDraft();render();break;
    case "ex-up":[draft.entries[i-1],draft.entries[i]]=[draft.entries[i],draft.entries[i-1]];saveDraft();render();break;
    case "ex-down":[draft.entries[i+1],draft.entries[i]]=[draft.entries[i],draft.entries[i+1]];saveDraft();render();break;
    case "ex-remove":draft.entries.splice(i,1);saveDraft();render();break;
    case "finish":await finishWorkout();break;
    case "cancel":UI.confirm="cancel";render();break;
    case "cancel-yes":draft=null;saveDraft();UI.confirm=null;render();window.scrollTo(0,0);break;
    case "confirm-no":UI.confirm=null;render();break;
    case "pick":UI.sheet={type:"pick",mode:b.dataset.mode};UI.pickQ="";render();setTimeout(()=>document.getElementById("pk-q")?.focus(),30);break;
    case "pick-ex":addExercise(id);break;
    case "create-ex":{const name=UI.pickQ.trim();if(!name)return;const g=document.getElementById("pk-g")?.value||UI.pickG;UI.pickG=g;const nid=uid();await put("exercises",nid,{name,group:g});addExercise(nid);break}
    case "close-sheet":UI.sheet=null;UI.confirm=null;render();break;
    case "new-routine":UI.tab="schemas";lsSet(LS_TAB,"schemas");UI.edit={id:null,name:"",folderId:id||"",items:[]};UI.folderEdit=null;UI.confirm=null;render();window.scrollTo(0,0);break;
    case "edit-routine":{const r=S.routines[id];UI.edit={id,name:r.name,cat:r.cat||"",folderId:r.folderId&&S.folders[r.folderId]?r.folderId:"",items:clone(r.items||[])};UI.folderEdit=null;UI.confirm=null;render();window.scrollTo(0,0);break}
    case "it-up":[UI.edit.items[i-1],UI.edit.items[i]]=[UI.edit.items[i],UI.edit.items[i-1]];render();break;
    case "it-down":[UI.edit.items[i+1],UI.edit.items[i]]=[UI.edit.items[i],UI.edit.items[i+1]];render();break;
    case "it-remove":UI.edit.items.splice(i,1);render();break;
    case "save-routine":{const e=UI.edit;if(!e.name.trim()){toast("Geef het schema een naam.");document.getElementById("re-name")?.focus();return}
      const rid=e.id||uid();const fid=e.folderId&&S.folders[e.folderId]?e.folderId:null;const prev=e.id?S.routines[e.id]:null;const order=prev&&(prev.folderId||null)===fid?prev.order??0:routinesIn(fid).length;
      await put("routines",rid,{...(prev||{}),name:e.name.trim(),folderId:fid,order,cat:e.cat||null,items:e.items.map(it=>({exId:it.exId,sets:String(it.sets||""),reps:String(it.reps||""),note:String(it.note||"")}))});
      if(fid){UI.open["f:"+fid]=true;lsSet(LS_OPEN,UI.open)}
      UI.edit=null;UI.confirm=null;toastOk("Schema opgeslagen");render();break}
    case "close-editor":UI.edit=null;UI.confirm=null;render();break;
    case "del-routine":UI.confirm="del-routine";render();break;
    case "del-routine-yes":await del("routines",UI.edit.id);UI.edit=null;UI.confirm=null;toast("Schema verwijderd");render();break;
    case "open-ex":{const x=S.exercises[id];UI.sheet={type:"ex",id,name:x.name,group:x.group};UI.confirm=null;render();break}
    case "save-ex":{const sh=UI.sheet;const name=(document.getElementById("ex-name")?.value||"").trim();const group=document.getElementById("ex-g")?.value||sh.group;if(!name){toast("Geef de oefening een naam.");return}
      await put("exercises",sh.id,{name,group});UI.sheet=null;toast("Oefening bijgewerkt");render();break}
    case "del-ex":UI.confirm="del-ex";render();break;
    case "del-ex-yes":{const xid=UI.sheet.id;await del("exercises",xid);
      for(const [rid,r] of Object.entries(S.routines))if((r.items||[]).some(it=>it.exId===xid))await put("routines",rid,{...clone(r),items:r.items.filter(it=>it.exId!==xid)});
      UI.sheet=null;UI.confirm=null;toast("Oefening verwijderd");render();break}
    case "open-session":UI.sheet={type:"session",id};UI.confirm=null;render();break;
    case "del-session":UI.confirm="del-session";render();break;
    case "del-session-yes":await del("sessions",UI.sheet.id);UI.sheet=null;UI.confirm=null;toast("Training verwijderd");render();break;
  }
});
document.addEventListener("input",ev=>{
  const t=ev.target,id=t.id||"";let m;
  if((m=id.match(/^s-(\d+)-(\d+)-([kr])$/))&&draft){
    const e=draft.entries[+m[1]],st=e.sets[+m[2]];st[m[3]]=t.value;saveDraft();
    const f=document.getElementById(`f-${m[1]}-${m[2]}`);if(f)f.textContent=rowIsPR(e,st)?"PR":"";
  }else if(id==="d-date"&&draft){draft.date=t.value||today();saveDraft()}
  else if(id==="d-note"&&draft){draft.note=t.value;saveDraft()}
  else if(id==="np-name")UI.newName=t.value;
  else if(id.startsWith("pf-")&&UI.pf!==undefined){const f=pfDraft();if(id==="pf-age")f.age=t.value;else if(id==="pf-height")f.height=t.value;else if(id==="pf-target")f.targetWeight=t.value;else if(id==="pf-work")f.work=t.value;else{const mm=id.match(/^pf-([nm])-(\w+)$/);if(mm){f.sports[mm[2]]=f.sports[mm[2]]||{};f.sports[mm[2]][mm[1]==="n"?"n":"min"]=t.value}}}
  else if(id.startsWith("c-")&&UI.cardio){const map={"c-date":"date","c-h":"h","c-m":"m","c-s":"s","c-km":"km","c-avg":"avgHr","c-max":"maxHr","c-note":"note"};if(map[id])UI.cardio[map[id]]=t.value;saveCardioDraft();const lv=document.getElementById("c-live");if(lv)lv.innerHTML=cardioLive()}
  else if(id==="np-tpl")UI.useTemplate=t.checked;
  else if(id==="li-name")UI.loginName=t.value;
  else if(id.startsWith("co-")&&UI.coach&&UI.coach.form){const map={"co-date":"date","co-title":"title","co-dur":"durMin","co-km":"km","co-desc":"desc","co-rep":"repeat"};if(map[id])UI.coach.form[map[id]]=t.value}
  else if(id==="re-name"&&UI.edit)UI.edit.name=t.value;
  else if((m=id.match(/^re-([srn])-(\d+)$/))&&UI.edit)UI.edit.items[+m[2]][{s:"sets",r:"reps",n:"note"}[m[1]]]=t.value;
  else if(id==="fd-name"&&UI.folderEdit)UI.folderEdit.name=t.value;
  else if(id.startsWith("pa-")&&UI.sheet&&UI.sheet.type==="pl-add"){const map={"pa-title":"title","pa-dur":"durMin","pa-km":"km","pa-note":"note","pa-time":"time"};if(map[id])UI.sheet[map[id]]=t.value}
  else if(id==="pk-q"){UI.pickQ=t.value;renderSheet();const el=document.getElementById("pk-q");if(el){el.focus();const n=el.value.length;try{el.setSelectionRange(n,n)}catch(e){}}}
  else if(id==="pk-g")UI.pickG=t.value;
  else if(id==="rec-q"){UI.recQ=t.value;render()}
});
document.addEventListener("change",ev=>{
  if(ev.target.id==="pf-work"&&UI.pf)UI.pf.work=ev.target.value;
  if(ev.target.id==="re-folder"&&UI.edit)UI.edit.folderId=ev.target.value;
  if(ev.target.id==="pa-rep"&&UI.sheet)UI.sheet.repeat=ev.target.value;
  if(ev.target.id==="pa-routine"&&UI.sheet)UI.sheet.routineId=ev.target.value;
  if(ev.target.id==="co-who"&&UI.coach){UI.coach={who:ev.target.value||null,data:null,form:null};UI.confirm=null;render();coachLoad()}
  if(ev.target.id==="co-rep"&&UI.coach&&UI.coach.form)UI.coach.form.repeat=ev.target.value;
  if(ev.target.id==="imp-file"&&ev.target.files&&ev.target.files[0]){const f=ev.target.files[0];const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);UI.importObj=o;UI.confirm="import";render()}catch(e){toast("Dit bestand kan niet gelezen worden.")}};rd.readAsText(f);ev.target.value=""}
if(ev.target.id==="pk-g")UI.pickG=ev.target.value;if(ev.target.id==="np-tpl")UI.useTemplate=ev.target.checked});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&UI.sheet){UI.sheet=null;UI.confirm=null;render()}if(ev.key==="Enter"&&(ev.target.id==="pin-1"||ev.target.id==="pin-2")){ev.preventDefault();document.querySelector('[data-act="submit-firstpin"]')?.click()}if(ev.key==="Enter"&&(ev.target.id==="li-name"||ev.target.id==="li-pin")){ev.preventDefault();if(ev.target.id==="li-name")document.getElementById("li-pin")?.focus();else document.querySelector('[data-act="submit-login"]')?.click()}if(ev.key==="Enter"&&ev.target.id==="sh-code"){ev.preventDefault();document.querySelector('[data-act="sh-lookup"]')?.click()}if(ev.key==="Enter"&&ev.target.id==="fd-name"){ev.preventDefault();document.querySelector('[data-act="fd-save"]')?.click()}if(ev.key==="Enter"&&ev.target.id==="gc-code"){ev.preventDefault();document.querySelector('[data-act="submit-code"]')?.click()}if(ev.key==="Enter"&&ev.target.id==="np-name"){ev.preventDefault();document.querySelector('[data-act="create-profile"]')?.click()}});

{const mm=location.hash.match(/deel=([A-Za-z0-9]{6})/);if(mm){UI.pendingShare=mm[1].toUpperCase();try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}}
window.addEventListener("hashchange",()=>{const mm=location.hash.match(/deel=([A-Za-z0-9]{6})/);if(!mm)return;try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}if(pid&&S.ready)lookupShare(mm[1]);else{UI.pendingShare=mm[1].toUpperCase();render()}});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
initStore();
