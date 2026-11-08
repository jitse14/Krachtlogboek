/* ---------- wat is er nieuw & suggesties ---------- */
const APP_VERSION="6.6";
const CHANGELOG=[
 {v:"6.6",date:"2026-10-24",items:[["Toelichting per oefening, mappen en schema's hernoemen, soort kiezen en archiveren, en een startvraag voor nieuwe gebruikers.",""]]},
 {v:"6.5",date:"2026-10-23",items:[["Mappen met schema's hebben de kleur van hun sport; een gemengde map is turquoise.",""]]},
 {v:"6.4",date:"2026-10-23",items:[
  ["Kleur per sport in je planning, de juiste emoji in je agenda, en trail bij hardlopen.",""],
  ["Wedstrijd kiezen staat nu bovenaan bij Sportschema op maat. Voorgestelde producten passen bij de maaltijd.",""]]},
 {v:"6.3",date:"2026-10-23",items:[
  ["Duurtraining naar je horloge, via intervals.icu.",""],
  ["Voortgang: grafieken per oefening en per duursport. Samen gesport? Registreer het ook voor je maatje.",""],
  ["Voeding: kiezen tussen gram en ml, en meer producten.",""]]},
 {v:"6.2",date:"2026-10-21",items:[["Trainer ziet met toestemming de hele training en je voortgang. Profiel in twee delen. Breder scherm op tablet en laptop.",""]]},
 {v:"6.1",date:"2026-10-21",items:[["Kies welke sporten en onderdelen je ziet.",""]]},
 {v:"6.0",date:"2026-10-20",items:[["Nieuwe naam Athlevon, sportschema op maat, kennis per sport, samen trainen, voortgang met kleuren en veel meer voeding.",""]]},
 {v:"5.0",date:"2026-10-19",items:[["Voedingsadvies met voorbeelddagen en dagboek, records per afstand.",""]]},
 {v:"4.0",date:"2026-10-18",items:[["Mappen voor schema's, delen met een code en een weekplanning.",""]]},
 {v:"3.0",date:"2026-10-18",items:[["Inloggen met naam en code, en trainingen bewaren zonder internet.",""]]},
 {v:"2.0",date:"2026-10-18",items:[["Profiel, gewicht, voedingsadvies en duurtraining loggen.",""]]},
 {v:"1.0",date:"2026-10-18",items:[["Eerste versie: schema's, trainingen loggen en records.",""]]}
];const FB_STATUS={nieuw:"Nieuw",bekeken:"Bekeken",gepland:"Gepland",opgelost:"Opgelost",niet:"Niet gepland"};
function newsBanner(){return "";
  if(lsGet("krachtlogboek.seen")===APP_VERSION)return "";
  return `<div class="banner newsb"><span><b>Nieuw in versie ${APP_VERSION}</b> · maaltijden, boodschappenlijst, privacy en meer.</span><span class="nbtns"><button class="linkbtn" data-act="go-news">Bekijken</button><button class="ib" data-act="news-dismiss" aria-label="Melding sluiten">✕</button></span></div>`;
}
async function loadFeedback(){
  try{UI.fb=(await rpc(S.me&&S.me.isAdmin?"kl_admin_feedback_list":"kl_feedback_mine",S.me&&S.me.isAdmin?{p_code:code,p_admin:pid,p_admin_pin:myPin()}:{p_code:code,p_profile:pid,p_pin:myPin()}))||[]}
  catch(e){UI.fb="error"}
  if(UI.tab==="news")render();
}
function viewNews(){
  if(lsGet("krachtlogboek.seen")!==APP_VERSION)lsSet("krachtlogboek.seen",APP_VERSION);
  if(UI.fb===undefined){UI.fb=null;loadFeedback()}
  const adm=S.me&&S.me.isAdmin,f=UI.fbDraft||(UI.fbDraft={kind:"idee",body:""});
  const card=c=>`<div class="card stack changelog"><div class="clh"><b>Versie ${c.v}</b><span class="small muted">${dateTxt(c.date)}</span></div><ul class="hl">${c.items.map(([t,w])=>`<li>${esc(t)}${w?`<br><span class="small muted">${esc(w)}</span>`:""}</li>`).join("")}</ul></div>`;
  let h=`<h2>Wat is er nieuw</h2>`+card(CHANGELOG[0])+`<h2>Suggestie of probleem melden</h2><div class="card stack">
    <div class="seg seg2"><button class="segb" data-act="fb-kind" data-v="idee" aria-pressed="${f.kind==="idee"}">Idee voor de app</button><button class="segb" data-act="fb-kind" data-v="probleem" aria-pressed="${f.kind==="probleem"}">Iets werkt niet</button></div>
    <label class="f">${f.kind==="probleem"?"Wat ging er mis? Wat deed je net daarvoor?":"Wat zou je graag zien?"}<textarea id="fb-body" rows="4" placeholder="${f.kind==="probleem"?"Bijv. de app hangt als ik bij Planning op + Plannen tik.":"Bijv. graag meer uitleg over voeding na de training."}">${esc(f.body)}</textarea></label>
    <button class="btn primary" data-act="fb-send">Versturen naar Jitse</button>
    <span class="hintline">Je naam wordt meegestuurd, zodat Jitse weet van wie het komt.</span></div>`;
  const fb=UI.fb;
  h+=`<h2>${adm?"Alle meldingen":"Jouw meldingen"}</h2>`;
  if(fb===null)h+=`<p class="muted small">Laden…</p>`;
  else if(fb==="error")h+=`<p class="muted small">Meldingen konden niet geladen worden. Controleer je internet.</p>`;
  else if(!fb.length)h+=`<p class="muted small">${adm?"Nog geen meldingen.":"Je hebt nog niets gemeld."}</p>`;
  else h+=`<div class="stack">${fb.map(x=>`<div class="card fbitem ${x.kind}"><div class="fbh"><b>${esc(x.name||"Onbekend")}</b><span class="chip">${x.kind==="probleem"?"Probleem":"Idee"}</span><span class="chip st-${x.status}">${FB_STATUS[x.status]||x.status}</span></div>
      <p class="fbb">${esc(x.body)}</p><span class="small muted">${dateTxt(String(x.created).slice(0,10))}${x.version?` · versie ${esc(x.version)}`:""}</span>
      ${adm?`<div class="fbadm"><select id="fbs-${x.id}">${Object.entries(FB_STATUS).map(([k,l])=>`<option value="${k}" ${x.status===k?"selected":""}>${l}</option>`).join("")}</select><input type="text" id="fbr-${x.id}" value="${esc(x.reply||"")}" placeholder="Antwoord (optioneel)"><button class="btn" data-act="fb-set" data-v="${x.id}">Opslaan</button></div>`
        :x.reply?`<p class="fbreply"><b>Jitse:</b> ${esc(x.reply)}</p>`:""}</div>`).join("")}</div>`;
  h+=`<h2>Eerdere versies</h2>`+CHANGELOG.slice(1).map(card).join("");
  return h;
}
async function sendFeedback(){
  const f=UI.fbDraft,body=(document.getElementById("fb-body")?.value||f.body||"").trim();
  if(body.length<3){toast("Schrijf kort wat je wilt melden.");return}
  try{await rpc("kl_feedback_add",{p_code:code,p_profile:pid,p_pin:myPin(),p_kind:f.kind,p_body:body,p_version:APP_VERSION});UI.fbDraft={kind:f.kind,body:""};toast("Bedankt! Je melding is verstuurd naar Jitse.");UI.fb=null;render();loadFeedback()}
  catch(e){if(e.code==="net")toast("Versturen lukt alleen met internet.");else if(/te veel/.test(e.message))toast("Je hebt vandaag al veel gemeld. Probeer het morgen weer.");else handleErr(e)}
}
async function setFeedback(id){
  try{await rpc("kl_admin_feedback_set",{p_code:code,p_admin:pid,p_admin_pin:myPin(),p_id:+id,p_status:document.getElementById("fbs-"+id)?.value,p_reply:document.getElementById("fbr-"+id)?.value||""});toast("Melding bijgewerkt");loadFeedback()}
  catch(e){handleErr(e)}
}

