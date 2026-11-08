/* ---------- profiel: persoonlijk en instellingen gescheiden ---------- */
const PF_TABS=[["persoonlijk","Persoonlijk"],["instellingen","Instellingen"]];
UI.pfTab=lsGet("krachtlogboek.pftab")||"persoonlijk";
const _viewProfileAll=viewProfile;viewProfile=function(){
  const h=_viewProfileAll(),i=h.indexOf("<h2>Mijn gegevens</h2>"),j=h.indexOf("<!--pf-set-->");
  if(i<0||j<0)return h;
  const t=PF_TABS.some(x=>x[0]===UI.pfTab)?UI.pfTab:"persoonlijk";
  const seg=`<div class="seg seg2 pftabs" style="margin-top:16px" role="tablist">${PF_TABS.map(([k,l])=>`<button class="segb" role="tab" data-act="pf-tab" data-v="${k}" aria-pressed="${t===k}">${l}</button>`).join("")}</div>`;
  return seg+(t==="persoonlijk"?h.slice(0,j):h.slice(0,i)+h.slice(j));
};
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="pf-tab"]');if(!b)return;UI.pfTab=b.dataset.v;lsSet("krachtlogboek.pftab",UI.pfTab);render();window.scrollTo(0,0)});
/* knoppen die naar iets in Instellingen springen */
document.addEventListener("click",ev=>{const b=ev.target.closest('[data-act="go-settings"]');if(!b)return;UI.tab="profile";UI.pfTab="instellingen";lsSet(LS_TAB,"profile");render();window.scrollTo(0,0)},true);

/* ---------- afgeronde training plakken (uit intervals.icu, Garmin Connect, Strava, Apple Fitness) ----------
   Alles wordt hier op de telefoon gelezen; er gaat niets naar een andere dienst. */
const PI_MON={jan:1,januari:1,january:1,feb:2,februari:2,february:2,mrt:3,maart:3,mar:3,march:3,apr:4,april:4,mei:5,may:5,jun:6,juni:6,june:6,jul:7,juli:7,july:7,aug:8,augustus:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,oct:10,october:10,nov:11,november:11,dec:12,december:12};
const piNum=s=>parseFloat(String(s).replace(/\s/g,"").replace(",","."));
function piSecs(t){t=String(t).trim();let m=t.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);if(m)return +m[1]*3600+ +m[2]*60+ +m[3];
  m=t.match(/^(\d{1,3}):(\d{2})$/);if(m)return +m[1]*60+ +m[2];
  m=t.match(/^(?:(\d+)\s*(?:h|u|uur|hr)\s*)?(?:(\d+)\s*(?:m|min)\s*)?(?:(\d+)\s*(?:s|sec)\s*)?$/i);if(m&&(m[1]||m[2]||m[3]))return (+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0);return 0}
const PI_DUR="(\\d{1,2}:\\d{2}:\\d{2}|\\d{1,3}:\\d{2}(?!\\s*\\/)|\\d+\\s*(?:h|u|uur)\\s*\\d+\\s*(?:m|min)(?:\\s*\\d+\\s*s)?|\\d+\\s*(?:m|min)\\s*\\d+\\s*s|\\d+\\s*(?:h|u|uur)(?![a-z])|\\d+\\s*min(?![a-z]))";
/* zoek een waarde bij een label; kopieën hebben "label: waarde", "waarde label", of waarde en label op aparte regels */
let PI_LINES=[],PI_DIR="before";
function piNear(_t,labels,valRe){
  const L=new RegExp("(^|[^a-z])("+labels+")(?![a-z])","i"),A=new RegExp("^[\\s:=\\-–|]*"+valRe,"i"),B=new RegExp(valRe+"[\\s:|]*$","i");
  for(let i=0;i<PI_LINES.length;i++){const line=PI_LINES[i],m=line.match(L);if(!m)continue;
    const st=m.index+m[1].length,en=st+m[2].length,af=line.slice(en).match(A),bf=line.slice(0,st).match(B);
    if(af)return af[1];if(bf)return bf[1];
    const prev=[PI_LINES[i-2],PI_LINES[i-1]].filter(x=>x!=null).join(" "),next=[PI_LINES[i+1],PI_LINES[i+2]].filter(x=>x!=null).join(" ");
    const p=prev.match(B),n=next.match(A);
    if(PI_DIR==="before"){if(p)return p[1];if(n)return n[1]}else{if(n)return n[1];if(p)return p[1]}}
  return null}
function piDir(lines){const li=lines.findIndex(l=>/(^|[^a-z])(distance|afstand)(?![a-z])/i.test(l));if(li<0||/\d\s*(km|mi)\b/i.test(lines[li]))return "before";
  const prev=(lines[li-2]||"")+" "+(lines[li-1]||""),next=(lines[li+1]||"")+" "+(lines[li+2]||"");
  if(/\d[\d.,]*\s*(km|mi|m)\s*$/i.test(prev))return "before";if(/^\s*\d[\d.,]*\s*(km|mi|m)\b/i.test(next))return "after";return "before"}
function piParse(raw){
  const txt=String(raw||"").replace(/ /g," ").replace(/\r/g,"").slice(0,20000),lo=txt.toLowerCase(),r={};
  PI_LINES=txt.split("\n").map(x=>x.trim()).filter(Boolean);PI_DIR=piDir(PI_LINES);
  /* sport */
  if(/\b(trail\s*run|trailrun|trailloop)/.test(lo))r.sport="Hardlopen",r.trail=true;
  else if(/\b(zwem|swim|baantjes|open water)/.test(lo))r.sport="Zwemmen";
  else if(/\b(ride|rit\b|fiets|wielren|cycling|bike|virtualride|gravel|mtb|mountainbike)/.test(lo))r.sport="Wielrennen";
  else if(/\b(run|hardloop|hardlopen|loop|jog|duurloop|interval|tempo\s*run)/.test(lo))r.sport="Hardlopen";
  /* afstand */
  let km=piNear(txt,"distance|afstand|dist\\.?","(\\d+(?:[.,]\\d+)?)\\s*(?:km|kilometer)");
  if(km)r.km=piNum(km);else{const mi=piNear(txt,"distance|afstand","(\\d+(?:[.,]\\d+)?)\\s*mi\\b");if(mi)r.km=piNum(mi)*1.609;
    else{const any=txt.match(/(\d+(?:[.,]\d+)?)\s*km\b(?!\s*\/\s*u|\/h)/i);if(any)r.km=piNum(any[1])}}
  if(r.sport==="Zwemmen"&&!r.km){const m=piNear(txt,"distance|afstand","(\\d{1,2}[.,]\\d{3}|\\d{2,5})\\s*m\\b");if(m)r.km=piNum(m.replace(/[.,]/,""))/1000}
  if(r.km!=null&&!(r.km>0&&r.km<1000))delete r.km;
  /* duur: liefst bewegingstijd */
  let d=piNear(txt,"moving time|bewegingstijd|beweegtijd|tijd in beweging",PI_DUR)||piNear(txt,"duration|duur|time|tijd|total time|totale tijd|elapsed time|verstreken tijd",PI_DUR);
  if(!d){const m=txt.match(/(?:^|\s)(\d{1,2}:\d{2}:\d{2})(?!\s*\/)/);if(m)d=m[1]}
  if(d){const s=piSecs(d);if(s>=60&&s<86400)r.secs=s}
  /* hartslag */
  const hr="(\\d{2,3})\\s*(?:bpm|spm|slagen)?";
  let a=piNear(txt,"avg hr|average hr|avg heart rate|average heart rate|gem\\.? hartslag|gemiddelde hartslag|hartslag gem\\.?|hr avg|avg bpm",hr);
  let x=piNear(txt,"max hr|max heart rate|maximum heart rate|max\\.? hartslag|maximale hartslag|hr max",hr);
  if(a&&+a>=40&&+a<=230)r.avgHr=+a;if(x&&+x>=40&&+x<=240)r.maxHr=+x;
  if(!r.avgHr){const m=txt.match(/(\d{2,3})\s*bpm/i);if(m&&+m[1]>=40&&+m[1]<=230)r.avgHr=+m[1]}
  if(r.maxHr&&r.avgHr&&r.maxHr<r.avgHr)delete r.maxHr;
  /* extra's voor de toelichting */
  const el=piNear(txt,"elevation gain|elevation|hoogtemeters|stijging|total ascent|totale stijging|klimmen","(\\d{1,5})\\s*m\\b");
  const pw=piNear(txt,"avg power|average power|gem\\.? vermogen|gemiddeld vermogen|np|normalized power","(\\d{2,4})\\s*w\\b");
  const cad=piNear(txt,"avg cadence|average cadence|cadans|gem\\.? cadans","(\\d{2,3})\\s*(?:spm|rpm)?");
  const extra=[];if(el)extra.push(`Hoogtemeters: ${el} m`);if(pw)extra.push(`Gem. vermogen: ${pw} W`);if(cad)extra.push(`Gem. cadans: ${cad}`);r.extra=extra;
  /* datum */
  const t=today();let dt=null,m;
  if((m=txt.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)))dt=`${m[1]}-${m[2]}-${m[3]}`;
  else if((m=txt.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/)))dt=`${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  else if((m=lo.match(/\b(\d{1,2})\s+(jan|januari|january|feb|februari|february|mrt|maart|mar|march|apr|april|mei|may|jun|juni|june|jul|juli|july|aug|augustus|august|sep|sept|september|okt|oktober|oct|october|nov|november|dec|december)\.?\s*(20\d{2})?/)))dt=`${m[3]||t.slice(0,4)}-${String(PI_MON[m[2]]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
  else if((m=lo.match(/\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\.?\s+(\d{1,2}),?\s*(20\d{2})?/)))dt=`${m[3]||t.slice(0,4)}-${String(PI_MON[m[1]]).padStart(2,"0")}-${String(m[2]).padStart(2,"0")}`;
  else if(/\b(gisteren|yesterday)\b/.test(lo))dt=addDays(t,-1);
  if(dt&&!isNaN(Date.parse(dt+"T12:00:00"))&&dt<=t&&dt>=addDays(t,-400))r.date=dt;
  /* naam: eerste korte regel met letters die geen label of getal is */
  const LBL=/^(type|sport|activity|activiteit|distance|afstand|duration|duur|time|tijd|moving|beweg|elapsed|pace|tempo|speed|snelheid|avg|average|gem|max|hr|heart|hartslag|elevation|hoogte|calorie|calorieën|kcal|power|vermogen|cadence|cadans|load|training load|intensity|rpe|zone|laps?|splits?|ronde)/i;
  for(const line of txt.split("\n").map(s=>s.trim()).filter(Boolean).slice(0,8)){if(line.length>2&&line.length<=70&&/[a-zA-Z]{3}/.test(line)&&!LBL.test(line)&&!/^\d/.test(line)&&!/https?:/.test(line)&&!/^[^:]{2,20}:\s/.test(line)){r.name=line;break}}
  return r;
}
function piFound(r){return [r.km!=null?`${fmt1(r.km)} km`:null,r.secs?durTxt(r.secs/60):null,r.avgHr?`gem. ${r.avgHr} bpm`:null,r.maxHr?`max ${r.maxHr} bpm`:null].filter(Boolean)}
/* geplande duurtraining op die dag, met dezelfde sport, nog niet gedaan */
function piPlanFor(date,sport){return planList().find(p=>p.date===date&&planKind(p)==="cardio"&&!planDoneFor(p)&&(sport==="Zwemmen"?!isRunBike(p.sport):(p.sport||"Hardlopen")===sport))||null}
function piApply(r){
  const sport=r.sport||(UI.cardio&&UI.cardio.sport!=="Anders"?UI.cardio.sport:"Hardlopen"),date=r.date||today();
  let c=UI.cardio;
  if(!c){const p=piPlanFor(date,sport);newCardio(sport==="Zwemmen"?"Zwemmen":sport,p?{...p,id:p.id}:null);c=UI.cardio}
  else if(r.sport&&r.sport!==c.sport&&!(r.sport==="Zwemmen"&&c.sport==="Anders")){if(isRunBike(r.sport)){c.sport=r.sport}else{c.sport="Anders";c.other="Zwemmen"}}
  c.date=date;
  if(r.secs){c.h=String(Math.floor(r.secs/3600)||"");c.m=String(Math.floor(r.secs%3600/60));c.s=String(r.secs%60)}
  if(r.km!=null)c.km=String(Math.round(r.km*100)/100).replace(".",",");
  if(r.avgHr)c.avgHr=String(r.avgHr);if(r.maxHr)c.maxHr=String(r.maxHr);
  const add=[r.name&&!/^(hardlopen|wielrennen|run|ride)$/i.test(r.name)?r.name:null,...(r.extra||[])].filter(Boolean).join(" · ");
  if(add&&!(c.note||"").includes(add))c.note=((c.note||"").trim()?c.note.trim()+"\n":"")+add;
  saveCardioDraft();
}
EXTRA_SHEETS["paste-in"]=function(sh){const r=sh.res;
  return `<div class="sh"><h2>Afgeronde training plakken</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
    <p class="hp small" style="margin:0">Open je training in <b>intervals.icu</b>, Garmin Connect, Strava of Apple Fitness. Selecteer de samenvatting (afstand, tijd, hartslag), kopieer en plak hier. De app leest de getallen eruit; jij controleert alles voordat je opslaat.</p>
    <textarea id="pi-text" rows="7" placeholder="Plak hier de tekst van je training">${esc(sh.text||"")}</textarea>
    <div class="btnrow">${navigator.clipboard&&navigator.clipboard.readText?`<button class="btn" data-act="pi-clip">Plakken</button>`:""}<button class="btn primary" data-act="pi-read">Herkennen</button></div>
    ${r?(piFound(r).length?`<p class="hp small" style="margin:0">Gevonden: <b>${esc(piFound(r).join(" · "))}</b>${r.date?` · ${esc(dateTxt(r.date))}`:""}${r.sport?` · ${esc(r.sport)}`:""}</p>`:`<p class="hp small" style="margin:0;color:var(--warn)">Ik vond geen afstand of tijd. Kopieer het stuk met de samenvatting (de getallen met km, tijd en bpm) en probeer het opnieuw.</p>`):""}
    <p class="small muted" style="margin:0">Privacy: de tekst wordt alleen op je telefoon gelezen. Er gaat niets naar een andere dienst, en er wordt pas iets bewaard als jij de training opslaat.</p></div>`};
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act^="pi-"]');if(!b)return;const act=b.dataset.act;
  if(act==="pi-open"){UI.sheet={type:"paste-in",text:"",res:null};renderSheet();setTimeout(()=>document.getElementById("pi-text")?.focus(),50);return}
  const sh=UI.sheet;if(!sh||sh.type!=="paste-in")return;
  if(act==="pi-clip"){try{const t=await navigator.clipboard.readText();sh.text=t||"";sh.res=null;renderSheet()}catch(e){toast("Plakken lukt niet automatisch. Houd het tekstvak ingedrukt en kies Plakken.")}return}
  if(act==="pi-read"){sh.text=document.getElementById("pi-text")?.value||"";const r=piParse(sh.text);
    if(!piFound(r).length){sh.res=r;renderSheet();return}
    piApply(r);UI.sheet=null;renderSheet();render();window.scrollTo(0,0);
    const c=UI.cardio;toast(`Ingevuld: ${piFound(r).join(" · ")}${c&&c.planId?" · gekoppeld aan je planning":""}. Controleer en sla op.`)}
});

/* ---------- duurtraining als intervals.icu-code (twee kanten op) ----------
   Athlevon -> code: van een geplande training (sportschema of eigen omschrijving) maakt de app stappen.
   Code -> Athlevon: een trainer of gebruiker plakt intervals.icu-code; de app leest en toont hem in het Nederlands. */
const icuClean=t=>String(t||"").replace(/\b\d+(?:[.,]\d+)?\s*(?:min|km|m|s|sec)?\b/gi,"").replace(/×/g,"").replace(/[(),:±]/g," ").replace(/\s+/g," ").trim().replace(/^./,c=>c.toUpperCase());
const icuDur=min=>{min=Math.round(min*60);const m=Math.floor(min/60),s=min%60;return m&&s?`${m}m${s}`:m?`${m}m`:`${s}s`};
const icuDist=(v,u)=>{v=piNum(v);if(/^k/i.test(u))return `${String(Math.round(v*100)/100)}km`;return `${Math.round(v)}mtr`};
/* Athlevon-omschrijving -> intervals.icu-code */
function nlToIcu(p){
  if(!p)return null;const run=(p.sport||"Hardlopen")==="Hardlopen",txt=[p.title,p.desc,p.note].filter(Boolean).join(". "),lo=txt.toLowerCase();
  const pace=s=>{const m=String(s||"").match(/(\d{1,2}:\d{2})\s*(?:min)?\s*\/\s*km/);return run&&m?m[1]:null};
  const L=[(p.title||"Duurtraining").replace(/[\n\r]/g," ").slice(0,60),""];
  const wu=lo.match(/(\d+)(?:\s*-\s*(\d+))?\s*min\s*(?:rustig\s*)?(inlopen|infietsen|inzwemmen|warming[- ]?up|opwarmen|losfietsen|warm\s*lopen)/);
  const cd=lo.match(/(\d+)\s*min\s*(?:rustig\s*)?(uitlopen|uitfietsen|uitzwemmen|cooling[- ]?down|uitwandelen|losfietsen)/);
  const rep=lo.match(/(\d+)\s*[×x]\s*(\d+(?:[.,]\d+)?)\s*(min|km|m|meter|s|sec)\b([^.]*?)(?:\bmet\b|,|\+)\s*(\d+(?:[.,]\d+)?)\s*(min|s|sec|m)\b\s*([a-zé ]{0,40})/);
  const tempo=lo.match(/(\d+)\s*min\s*(?:op\s*)?(?:tempo|drempel|threshold)([^.]*)/);
  const easy=["easy","long"].includes(p.qual)||/rustig|duurloop|duurrit|lange|zone 2|herstel/.test(lo);
  if(wu||rep||tempo){
    if(wu)L.push("Warmup",`- ${run?"Inlopen":"Rustig opwarmen"} ${+(wu[2]||wu[1])}m Z2 HR`,"");
    if(rep){const n=+rep[1],wv=rep[2],wu2=rep[3],pc=pace(rep[4]),rv=piNum(rep[5]),ru=rep[6],rl=icuClean(rep[7].replace(/\bertussen\b/,""))||"Herstel";
      const work=/^(min)$/.test(wu2)?icuDur(piNum(wv)):/^(s|sec)$/.test(wu2)?`${Math.round(piNum(wv))}s`:icuDist(wv,wu2==="km"?"km":"m");
      const rest=/^(s|sec)$/.test(ru)?`${Math.round(rv)}s`:/^m$/.test(ru)&&rv>=50?`${Math.round(rv)}mtr`:icuDur(rv);
      L.push(`Main Set ${n}x`,`- Snel ${work} ${pc?pc+"/km Pace":"Z4 HR"}`,`- ${rl.split(" ").slice(0,3).join(" ")} ${rest} Z1 HR`,"")}
    else if(tempo){const pc=pace(tempo[2]);L.push("Main Set",`- Tempo ${+tempo[1]}m ${pc?pc+"/km Pace":"Z3 HR"}`,"")}
    if(cd)L.push("Cooldown",`- ${run?"Uitlopen":"Rustig uitrijden"} ${+cd[1]}m Z1 HR`);
    return L.join("\n").trim()}
  const main=p.km?`${String(Math.round(p.km*100)/100)}km`:p.durMin?icuDur(p.durMin):null;if(!main)return null;
  const pc=pace(txt),tgt=p.qual==="race"?"":pc&&!easy?pc+"/km Pace":easy||!p.qual?"Z2 HR":p.qual==="tempo"?"Z3 HR":"Z2 HR";
  L.push(`- ${icuClean(p.title)||"Duurtraining"} ${main}${tgt?" "+tgt:""}`);return L.join("\n").trim();
}
/* intervals.icu-code lezen */
function icuParse(code){
  const out={title:"",blocks:[]};let cur=null;
  for(const raw of String(code||"").replace(/\r/g,"").split("\n")){const line=raw.trim();if(!line)continue;
    if(/^-/.test(line)){if(!cur){cur={name:"",reps:1,steps:[]};out.blocks.push(cur)}
      const s=line.replace(/^-\s*/,""),st={raw:s,secs:0,m:0};
      const toks=s.split(/\s+/);let fi=-1;
      toks.forEach((t,i)=>{const mm=t.match(/^(?:(\d+)h)?(?:(\d+)m(\d{1,2})?)?(?:(\d+)s)?$/);
        if(!st.secs&&mm&&(mm[1]||mm[2]||mm[4])){st.secs=(+mm[1]||0)*3600+(+mm[2]||0)*60+(+mm[3]||0)+(+mm[4]||0);if(fi<0)fi=i;toks[i]="";return}
        const dm=t.match(/^(\d+(?:\.\d+)?)(km|mtr|mi)$/);if(!st.m&&dm){st.m=dm[2]==="km"?+dm[1]*1000:dm[2]==="mi"?+dm[1]*1609:+dm[1];if(fi<0)fi=i;toks[i]=""}});
      st.txt=(fi<0?s:toks.slice(0,fi).join(" ")).trim();st.target=fi<0?"":toks.slice(fi).filter(Boolean).join(" ");
      cur.steps.push(st)}
    else{const rm=line.match(/^(.*?)\s*(\d+)\s*x$/i);
      if(!out.blocks.length&&!out.title&&!rm&&!/^(warm ?up|main ?set|cool ?down|intervals?)$/i.test(line)){out.title=line;continue}
      cur={name:rm?rm[1].trim():line,reps:rm?+rm[2]:1,steps:[]};out.blocks.push(cur)}}
  out.blocks=out.blocks.filter(b=>b.steps.length);return out;
}
function icuTargetNl(t){if(!t)return "";return t.replace(/\bZ(\d)\s*HR\b/gi,"hartslagzone $1").replace(/\bZ(\d)\s*Pace\b/gi,"tempozone $1").replace(/(\d{1,2}:\d{2})(?:-(\d{1,2}:\d{2}))?\/km\s*Pace/gi,(m,a,b)=>`tempo ${a}${b?"-"+b:""} /km`)
  .replace(/(\d+)(?:-(\d+))?w\b/gi,(m,a,b)=>`${a}${b?"-"+b:""} W`).replace(/\bZ(\d)\b/g,"vermogenszone $1").replace(/(\d+)rpm/gi,"cadans $1").replace(/\bramp\b/gi,"oplopend").replace(/\bLTHR\b/g,"van je drempelhartslag").replace(/\bHR\b/g,"hartslag").replace(/\bPace\b/g,"van je drempeltempo")}
function icuStepNl(st){const d=st.secs?durTxt(st.secs/60):st.m?(st.m>=1000?`${fmt1(st.m/1000)} km`:`${Math.round(st.m)} m`):"";return [st.txt,d,icuTargetNl(st.target)].filter(Boolean).join(" · ")}
function icuNameNl(n){return({warmup:"Warming-up","warm up":"Warming-up","main set":"Kern",cooldown:"Cooling-down","cool down":"Cooling-down"})[String(n).toLowerCase()]||n}
function icuTotals(P){let s=0,m=0;for(const b of P.blocks)for(const st of b.steps){s+=st.secs*b.reps;m+=st.m*b.reps}return{min:s/60,km:m/1000}}
function icuNlHtml(P){return `<ol class="icusteps">${P.blocks.map(b=>`<li>${b.name?`<b>${esc(icuNameNl(b.name))}</b>`:""}${b.reps>1?` <span class="chip">${b.reps}×</span>`:""}${b.steps.map(st=>`<div class="small">${esc(icuStepNl(st))}</div>`).join("")}</li>`).join("")}</ol>`}
function planIcu(p){return (p&&p.steps)||nlToIcu(p)}
function icuBox(p){const code=planIcu(p);if(!code)return "";const P=icuParse(code);if(!P.blocks.length)return "";
  return `<details class="card icubox" style="margin-top:10px"><summary><b>Op je horloge zetten</b> <span class="small muted">via intervals.icu</span></summary>
    <div class="stack" style="margin-top:8px">${icuNlHtml(P)}<button class="btn" data-act="icu-copy" data-id="${esc(p.id)}">Kopieer code voor intervals.icu</button>
    <p class="small muted" style="margin:0">Plak de code in intervals.icu bij een nieuwe workout. Vandaar gaat hij naar je Garmin, of met de app Intervals.icu Companion naar je Apple Watch.${p.steps?"":" De stappen zijn gemaakt uit de omschrijving: kijk ze even na."}</p></div></details>`}
/* invoer bij plannen: code plakken of schrijven */
function icuField(sh){const v=sh.steps||"",P=v.trim()?icuParse(v):null;
  return `<details class="privdet" ${v?"open":""}><summary>Stappen voor je horloge <i class="small muted">optioneel, intervals.icu-code</i></summary><div class="stack" style="margin-top:8px">
    <textarea id="pa-steps" rows="6" placeholder="Bijv.\nWarmup\n- Inlopen 15m Z2 HR\nMain Set 5x\n- Snel 3m 4:30/km Pace\n- Wandelpas 2m Z1 HR\nCooldown\n- Uitlopen 10m Z1 HR">${esc(v)}</textarea>
    <div id="pa-steps-pv">${icuPreview(P)}</div>
    <p class="small muted" style="margin:0">Plak een workout uit intervals.icu, of schrijf hem zelf zo. Duur: 10m, 30s, 1m30. Afstand: 1km, 400mtr. Doel: Z2 HR, 4:30/km Pace, 200w. Herhalen: zet "5x" achter de kop.</p></div></details>`}
function icuPreview(P){if(!P)return "";if(!P.blocks.length)return `<p class="small" style="margin:0;color:var(--warn)">Nog geen stappen herkend. Begin elke stap met "- ".</p>`;const T=icuTotals(P);
  return icuNlHtml(P)+`<p class="small muted" style="margin:0">Totaal ± ${[T.min?durTxt(T.min):null,T.km?fmt1(T.km)+" km":null].filter(Boolean).join(" · ")||"–"}</p>`}
document.addEventListener("input",ev=>{if(ev.target.id!=="pa-steps"||!UI.sheet)return;UI.sheet.steps=ev.target.value;const pv=document.getElementById("pa-steps-pv");if(pv)pv.innerHTML=icuPreview(ev.target.value.trim()?icuParse(ev.target.value):null)});
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act="icu-copy"]');if(!b)return;const p0=S.plan[b.dataset.id];if(!p0)return;const code=planIcu({id:b.dataset.id,...p0});
  try{await navigator.clipboard.writeText(code);toastOk("Code gekopieerd. Plak hem in intervals.icu.")}catch(e){UI.sheet={type:"icu-show",code};renderSheet()}});
EXTRA_SHEETS["icu-show"]=sh=>`<div class="sh"><h2>Code voor intervals.icu</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack"><p class="hp small" style="margin:0">Houd de tekst ingedrukt, kies Alles selecteren en Kopieer.</p><textarea rows="10" readonly>${esc(sh.code)}</textarea></div>`;

