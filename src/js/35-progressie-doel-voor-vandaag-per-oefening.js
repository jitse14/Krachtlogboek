/* ---------- progressie: doel voor vandaag per oefening ---------- */
const PROG_SMALL=["Biceps","Triceps","Schouders","Onderarmen","Kuiten","Core"];
function progRange(reps){const t=String(reps||"");let x;
  if(/\d+\s*(s|sec|min)\b/i.test(t))return{time:true};
  if((x=t.match(/(\d+)\s*[-–]\s*(\d+)/)))return{lo:+x[1],hi:+x[2]};
  if((x=t.match(/^\s*(\d+)\s*$/)))return{lo:+x[1],hi:+x[1]};
  return null}
function progPlan(){const p=draft&&draft.planId&&S.plan[draft.planId];return p&&p.prog?p:null}
function progTip(e){
  const last=lastFor(e.exId);if(!last)return"";
  const sets=last.sets.filter(s=>s.r>0);if(!sets.length)return"";
  const pl=progPlan(),rec=pl&&(pl.prog.rec||pl.prog.taper),rg=progRange(e.target&&e.target.reps),n=parseInt(e.target&&e.target.sets)||sets.length;
  const topK=Math.max(...sets.map(s=>+s.k||0)),work=sets.filter(s=>(+s.k||0)===topK).slice(0,n),grp=exGroup(e.exId,e.group),kTxt=k=>k?fmt1(k)+" kg":"eigen gewicht";
  const adj=pl&&pl.prog.adj,ls=lastSessionFor(e.exId),lf=ls&&ls.feel;
  if(adj==="pain")return `Train pijnvrij: doet deze oefening pijn, sla hem dan over of kies een lichtere variant. Anders: ${kTxt(topK)} × dezelfde herhalingen als vorige keer.`;
  if(rec||adj==="lighter")return `Rustiger aan: ${kTxt(topK)}, 1 set minder en stop 2-3 herhalingen voor het falen.`;
  if(lf==="tezwaar"||lf==="pijn")return `Vorige keer was het ${lf==="pijn"?"pijnlijk":"te zwaar"}: houd ${kTxt(topK)} en probeer dezelfde herhalingen, met goede techniek.`;
  if(rg&&rg.time)return "Probeer meer herhalingen in dezelfde tijd, of houd het net iets langer vol dan vorige keer.";
  const reps=work.map(s=>s.r);
  if(rg&&reps.length>=Math.min(n,work.length)&&reps.every(r=>r>=rg.hi)){
    if(!topK)return `Je haalde overal ${rg.hi}. Maak het zwaarder: extra gewicht, langzamer tempo of een moeilijkere variant, en begin weer bij ${rg.lo}.`;
    const inc=PROG_SMALL.includes(grp)?(topK<20?1:2):(topK<40?2.5:2.5);
    return `Je haalde overal ${rg.hi}: tijd voor meer gewicht. Probeer ${fmt1(topK+inc)} kg × ${rg.lo}${PROG_SMALL.includes(grp)?" (of de kleinste stap die kan)":""}.`}
  if((adj==="harder"||lf==="licht")&&topK&&rg)return `${lf==="licht"?"Vorige keer was het te licht":"Het mag zwaarder"}: probeer ${fmt1(topK+(PROG_SMALL.includes(grp)?1:2.5))} kg × ${rg.lo}-${rg.hi}.`;
  const goal=reps.map(r=>rg?Math.min(rg.hi,r+1):r+1);
  return `Doel: ${kTxt(topK)} × ${goal.join(", ")}. Dat is 1 herhaling meer per set dan vorige keer.`;
}
function progBanner(){const p=progPlan();if(!p||!p.note)return"";return `<div class="card insight in-info" style="margin-top:10px"><p><b>Deze week</b> · ${esc((t=>t.charAt(0).toUpperCase()+t.slice(1))(p.note.replace(/^Week \d+( · [^:]*)?: ?/,"")))}</p></div>`}

