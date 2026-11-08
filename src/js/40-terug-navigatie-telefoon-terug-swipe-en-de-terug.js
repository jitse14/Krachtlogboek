/* ---------- terug-navigatie: telefoon-terug, swipe en de terugknop linksboven ---------- */
const NAV_SUBS=["sc","edit","cardio","planEdit","mealEdit","cg","ec","coach","folderEdit","permEdit","nutEdit","prefDraft"];
const navTabKey=()=>[UI.tab,UI.tab==="food"?UI.foodTab||"advies":"",UI.tab==="records"?UI.recTab||"voortgang":""].join("|");
const navSubs=()=>NAV_SUBS.filter(k=>UI[k]);
let navHist=[],navLast=null,navBusy=false;const navScroll={};
function navSnap(){return{tab:UI.tab,foodTab:UI.foodTab,recTab:UI.recTab,key:navTabKey()}}
function navCanBack(){return !!pid&&(!!UI.sheet||navSubs().length>0||navHist.length>1)}
function navAfter(){
  const bb=document.getElementById("navback");if(bb)bb.hidden=!navCanBack();
  if(!pid){navHist=[];navLast=null;return}
  const sig=JSON.stringify([navTabKey(),navSubs(),UI.sheet?UI.sheet.type:""]);
  if(navBusy){navBusy=false;navLast=sig;return}
  if(sig===navLast)return;
  const k=navTabKey(),top=navHist[navHist.length-1];
  if(!top||top.key!==k){navHist.push(navSnap());if(navHist.length>40)navHist.shift();const v=document.getElementById("view");if(v&&top){v.classList.remove("vf");void v.offsetWidth;v.classList.add("vf")}}
  if(navLast!==null)try{history.pushState({kl:1},"")}catch(e){}
  navLast=sig;if(bb)bb.hidden=!navCanBack();
}
function navBack(){
  if(UI.sheet){UI.sheet=null;UI.confirm=null;navBusy=true;render();return true}
  const subs=navSubs();if(subs.length){for(const k of subs)UI[k]=null;UI.confirm=null;navBusy=true;render();window.scrollTo(0,0);return true}
  if(navHist.length>1){const cur=navHist.pop();navScroll[cur.key]=window.scrollY;const p=navHist[navHist.length-1];UI.tab=p.tab;UI.foodTab=p.foodTab;UI.recTab=p.recTab;UI.confirm=null;lsSet(LS_TAB,UI.tab);navBusy=true;render();window.scrollTo(0,navScroll[p.key]||0);return true}
  return false;
}
window.addEventListener("popstate",()=>{if(!pid)return;if(!navBack()){/* al op het beginscherm: blijf in de app */try{history.pushState({kl:1},"")}catch(e){}}});
document.addEventListener("click",ev=>{if(ev.target.closest("#navback")){ev.preventDefault();if(navCanBack())history.back()}});
/* scrollpositie per tabblad onthouden bij wisselen via de tabbalk */
document.addEventListener("click",ev=>{const tb=ev.target.closest("nav.tabs button");if(tb)navScroll[navTabKey()]=window.scrollY},true);
const _renderNav=render;render=function(){const r=_renderNav.apply(this,arguments);try{navAfter()}catch(e){}return r};
const _renderSheetNav=renderSheet;renderSheet=function(){const r=_renderSheetNav.apply(this,arguments);try{navAfter()}catch(e){}return r};

