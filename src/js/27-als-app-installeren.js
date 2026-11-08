/* ---------- als app installeren ---------- */
let installEvt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;if(UI.tab==="profile"||UI.tab==="help")render()});
const isStandalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function installCard(){
  if(isStandalone())return "";
  return `<div class="card start installcard"><span><span class="name">Installeer als app</span><br><span class="muted small">Eigen icoon op je beginscherm, opent zonder adresbalk en werkt offline.</span></span><button class="btn primary" data-act="inst">Installeren</button></div>`;
}
function installSheet(){
  const ios=isIOS();
  return `<div class="sh"><h2>Installeren als app</h2><button class="ib" data-act="close-sheet" aria-label="Sluiten">✕</button></div><div class="card stack">
    ${ios?`<ol class="hl"><li>Open deze pagina in <b>Safari</b> (niet in een andere app of browser).</li><li>Tik onderaan op het <b>deel-icoon</b> (vierkantje met pijl omhoog).</li><li>Scroll en kies <b>Zet op beginscherm</b>, dan <b>Voeg toe</b>.</li><li>Open voortaan Athlevon-icoon op je beginscherm.</li></ol>`
    :`<ol class="hl"><li>Open deze pagina in <b>Chrome</b>.</li><li>Tik rechtsboven op de <b>drie puntjes</b>.</li><li>Kies <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.</li></ol>`}
    <p class="small muted" style="margin:0">Op het beginscherm blijft je login ook bewaard; in Safari worden gegevens anders na 7 dagen zonder gebruik gewist.</p></div>`;
}
EXTRA_SHEETS["install"]=installSheet;
document.addEventListener("click",async ev=>{const b=ev.target.closest('[data-act="inst"]');if(!b)return;
  if(installEvt){installEvt.prompt();try{const r=await installEvt.userChoice;if(r.outcome==="accepted")toast("De app wordt geïnstalleerd")}catch(e){}installEvt=null;render()}
  else{UI.sheet={type:"install"};render()}});

