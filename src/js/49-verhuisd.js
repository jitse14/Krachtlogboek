/* ---------- verhuisd: melding op het oude adres ---------- */
// MOVED_TO wordt bij het bouwen ingevuld (zie scripts/build.mjs). Leeg = geen melding.
// Op het oude adres eerst wachten tot de offline wachtrij verstuurd is, want
// de gegevens in deze browser (code, wachtrij) gaan niet mee naar het nieuwe adres.
const MOVED_TO="__MOVED_TO__";
(function movedNotice(){
  if(!MOVED_TO||MOVED_TO.startsWith("__"))return;
  let target;try{target=new URL(MOVED_TO)}catch(e){return}
  if(location.origin===target.origin)return;
  let shown=false;
  function show(){
    if(shown)return;shown=true;
    const wrap=document.createElement("div");
    Object.assign(wrap.style,{position:"fixed",inset:"0",zIndex:"100",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"});
    const card=document.createElement("div");card.className="card stack";card.style.maxWidth="420px";
    const h=document.createElement("h3");h.textContent="Athlevon heeft een nieuw adres";
    const p=document.createElement("p");p.textContent="Je gegevens zijn veilig opgeslagen. Op het nieuwe adres log je één keer opnieuw in met je naam en je persoonlijke code. Zet daarna de nieuwe app op je beginscherm en verwijder deze.";
    // De groepscode gaat mee in de link, en staat er ook bij voor als je hem toch moet intypen.
    const a=document.createElement("a");a.className="btn primary";a.href=target.href+(code?"#groepscode="+encodeURIComponent(code):"");a.textContent="Naar het nieuwe adres";
    card.append(h,p);
    if(code){const c=document.createElement("p");c.className="small muted";c.textContent="Vraagt de app om de groepscode? Die is: "+code;card.append(c)}
    card.append(a);wrap.append(card);document.body.append(wrap);
  }
  function check(){
    // Niet ingelogd: niets te versturen. Ingelogd: pas tonen als de wachtrij leeg is.
    if(!pid||(!queue().length&&S.mode==="cloud"))show();
    else{flushQueue().catch(()=>{});setTimeout(check,3000)}
  }
  window.addEventListener("load",()=>setTimeout(check,1500));
})();
