/* ---------- muziek bij het trainen: je eigen playlist met één tik openen ---------- */
function musicUrl(){const m=S.meta&&S.meta.music;return m&&m.url||""}
function musicKind(u){return /spotify/.test(u)?"Spotify":/music\.apple/.test(u)?"Apple Music":/youtu/.test(u)?"YouTube Music":/deezer/.test(u)?"Deezer":/soundcloud/.test(u)?"SoundCloud":"je muziek"}
function musicCard(){const u=musicUrl();
  return `<h2>Muziek bij het trainen</h2><div class="card stack"><p class="hp small" style="margin:0">Plak de link van je trainingsplaylist (Spotify, Apple Music of YouTube Music). Tijdens je training open je hem dan met één tik in je muziek-app.</p>
    <div class="codeinput"><input type="url" id="mu-url" value="${esc(u)}" placeholder="https://open.spotify.com/playlist/…" autocomplete="off"><button class="btn" data-act="mu-save">Opslaan</button></div>
    <p class="small muted" style="margin:0">In Spotify: bij je playlist ⋯ → Delen → Link kopiëren.</p></div>`}
function musicBtn(){const u=musicUrl();return u?`<a class="btn musicbtn" href="${esc(u)}" target="_blank" rel="noopener">♪ ${esc(musicKind(u))} openen</a>`:`<button class="linkbtn musicbtn" data-act="mu-set">♪ Muziek koppelen</button>`}
document.addEventListener("click",async ev=>{const b=ev.target.closest("[data-act]");if(!b)return;
  if(b.dataset.act==="mu-save"){let u=(document.getElementById("mu-url")?.value||"").trim();if(u&&!/^https:\/\/[^\s]+$/.test(u)){toast("Plak een volledige link die begint met https://");return}await put("meta","music",{url:u.slice(0,300)});toastOk(u?"Playlist opgeslagen":"Playlist verwijderd");render()}
  if(b.dataset.act==="mu-set"){UI.tab="profile";lsSet(LS_TAB,"profile");render();setTimeout(()=>{const e=document.getElementById("mu-url");if(e){e.scrollIntoView({block:"center"});e.focus()}},60)}});

