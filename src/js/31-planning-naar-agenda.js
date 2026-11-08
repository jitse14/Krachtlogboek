/* ---------- planning naar agenda ---------- */
function planDetail(p){const k=planKind(p),bits=[];
  if(k==="cardio"){if(p.km)bits.push(fmt1(p.km)+" km");if(p.durMin)bits.push("± "+durTxt(p.durMin))}
  if(k==="routine"){const r=S.routines[p.routineId];if(r)bits.push(...(r.items||[]).map(it=>`${exName(it.exId)}${it.sets||it.reps?` ${it.sets||"?"}×${it.reps||"?"}`:""}`))}
  return bits;}
function workoutText(p){const k=planKind(p),d=planDetail(p),txt=p.desc||p.note||"";
  return [`${planTitle(p)} (${dayName(p.date)})`,k==="routine"?d.map(x=>"• "+x).join("\n"):d.join(" · "),txt].filter(Boolean).join("\n");}
function icsEsc(s){return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n")}
function exportIcs(){
  const t=today(),to=addDays(t,56),items=planList().filter(p=>p.date>=t&&p.date<=to&&planKind(p)!=="rest").sort((a,b)=>a.date.localeCompare(b.date));
  if(!items.length){toast("Er staat de komende 8 weken nog niets in je planning.");return}
  const st=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
  const ev=items.map(p=>{const d=p.date.replace(/-/g,""),e=addDays(p.date,1).replace(/-/g,"");
    let when=[`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${e}`];
    if(p.time&&/^\d\d:\d\d$/.test(p.time)){const [hh,mm]=p.time.split(":").map(Number),dur=Math.max(30,Math.round(p.durMin||(planKind(p)==="routine"?60:45))),endM=hh*60+mm+dur,ed=endM>=1440?addDays(p.date,1):p.date,em=endM%1440;
      const f=(dt,h,m)=>dt.replace(/-/g,"")+"T"+String(h).padStart(2,"0")+String(m).padStart(2,"0")+"00";when=[`DTSTART:${f(p.date,hh,mm)}`,`DTEND:${f(ed,Math.floor(em/60),em%60)}`]}
    return ["BEGIN:VEVENT",`UID:${p.id}@krachtlogboek`,`DTSTAMP:${st}`,...when,`SUMMARY:${icsEsc(planEmoji(p)+" "+planTitle(p))}`,`DESCRIPTION:${icsEsc(workoutText(p)+"\n\nUit Athlevon")}`,...(p.time?["TRANSP:OPAQUE","BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Training","TRIGGER:-PT30M","END:VALARM"]:["TRANSP:TRANSPARENT"]),"END:VEVENT"].join("\r\n")});
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Athlevon//NL","CALSCALE:GREGORIAN","X-WR-CALNAME:Athlevon",...ev,"END:VCALENDAR"].join("\r\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download="krachtlogboek-planning.ics";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);
  toast(`${items.length} trainingen klaargezet voor je agenda. Open het bestand om ze toe te voegen.`);
}
const CALS=[["iphone","Agenda van mijn iPhone"],["google","Google Agenda"],["other","Andere / Android"]];
function calPref(){try{return lsGet("krachtlogboek.cal")||(isIOS()?"iphone":"other")}catch(e){return "other"}}
function calHelp(){const k=calPref();
  if(k==="iphone")return `<ol class="hl small"><li>Tik op <b>Zet in mijn agenda</b>.</li><li>Kies <b>Voeg alles toe</b> en daarna de agenda waar ze in moeten.</li></ol>`;
  if(k==="google")return `<p class="hp small" style="margin:0">Je kunt een gedeelde Google-agenda kiezen, bijvoorbeeld die met je partner. Er zijn drie manieren:</p><ol class="hl small">
    <li><b>Via je iPhone (makkelijkst):</b> staat je Google-account op je iPhone (Instellingen → Agenda → Accounts)? Tik dan op de knop hieronder, kies <b>Voeg alles toe</b> en selecteer bij <b>Agenda</b> je (gedeelde) Google-agenda.</li>
    <li><b>Via de computer:</b> download het bestand, open <b>calendar.google.com</b> → ⚙ Instellingen → <b>Importeren en exporteren</b>, kies het bestand en de agenda.</li>
    <li><b>Eén training tegelijk:</b> open een training in je planning en tik op <b>Zet in Google Agenda</b>; je kiest daar zelf de agenda.</li></ol>`;
  return `<p class="hp small" style="margin:0">Tik op de knop en open het bestand met je agenda-app. Lukt dat niet, importeer het dan via de website van je agenda.</p>`}
function gcalUrl(p){const d=p.date.replace(/-/g,"");let dates;
  if(p.time&&/^\d\d:\d\d$/.test(p.time)){const [hh,mm]=p.time.split(":").map(Number),dur=Math.max(30,Math.round(p.durMin||(planKind(p)==="routine"?60:45))),e=hh*60+mm+dur,ed=(e>=1440?addDays(p.date,1):p.date).replace(/-/g,""),em=e%1440,f=(x,h,m)=>x+"T"+String(h).padStart(2,"0")+String(m).padStart(2,"0")+"00";dates=f(d,hh,mm)+"/"+f(ed,Math.floor(em/60),em%60)}
  else dates=d+"/"+addDays(p.date,1).replace(/-/g,"");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&ctz=Europe/Amsterdam&text="+encodeURIComponent(planEmoji(p)+" "+planTitle(p))+"&dates="+dates+"&details="+encodeURIComponent(workoutText(p)+"\n\nUit Athlevon")}
function watchSheet(){
  return `<div class="sh"><h2>Naar je agenda</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div>
  <div class="card stack"><p class="hp" style="margin:0">Zet je geplande trainingen van de komende 8 weken in je agenda, met de uitleg van de training erbij.</p>
    <div class="f">Welke agenda gebruik je?<div class="chips">${CALS.map(([k,l])=>`<button class="chipb" data-act="cal-pick" data-v="${k}" aria-pressed="${calPref()===k}">${l}</button>`).join("")}</div></div>
    ${calHelp()}
    <button class="btn primary" data-act="ics">${calPref()==="google"?"Download agendabestand":"Zet in mijn agenda"}</button><span class="small muted">Trainingen met een tijdstip komen als afspraak met een herinnering 30 minuten vooraf; zonder tijdstip als hele-dag-item. Opnieuw exporteren na een wijziging? Dan worden bestaande afspraken bijgewerkt (bij de meeste agenda's).</span>
    <span class="small muted"><b>Privacy:</b> het bestand bevat alleen de naam, het tijdstip en de uitleg van je trainingen. Geen gewicht, voeding, records of inloggegevens, en er is geen koppeling terug naar de app. Je agenda valt verder onder de beveiliging van je eigen agenda-account.</span></div>
  <details class="privdet" style="margin-top:10px"><summary>Toch op je horloge zetten?</summary><div class="stack" style="margin-top:8px">
    <p class="hp small" style="margin:0">Rechtstreeks vanuit de app naar je horloge sturen kan niet. Het kan wel met de hand, maar dat is wat omslachtig:</p>
    <ul class="hl small"><li><b>Garmin:</b> open in de app de training in je planning en tik op <b>Kopieer training</b>. Ga in Garmin Connect naar Training en planning → Trainingen → Maak een training, en neem de stappen over. Daarna synchroniseer je je horloge.</li><li><b>Apple Watch:</b> open de Workout-app → tik op ⋯ bij hardlopen of fietsen → Maak training → Aangepast, en voer de stappen in.</li></ul>
    <p class="hp small" style="margin:0"><b>Andersom</b> (een gelopen training van je horloge naar de app): neem duur, afstand en hartslag uit je horloge-app over bij Trainen → Hardlopen of Wielrennen.</p></div></details>`;
}
EXTRA_SHEETS["watch"]=watchSheet;

