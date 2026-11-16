const cfg=window.WIZZY_CONFIG||{};let sb=null;
if(window.supabase&&cfg.SUPABASE_URL&&cfg.SUPABASE_URL.startsWith("http")&&!cfg.SUPABASE_ANON_KEY.includes("PASTE")) sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function fallback(){document.querySelector("#music-list").innerHTML='<div class="item-card"><h3>Music coming soon</h3><p>Wizzy songs will appear here.</p></div>';document.querySelector("#video-list").innerHTML='<div class="item-card"><h3>Videos coming soon</h3><p>Wizzy videos will appear here.</p></div>';document.querySelector("#news-list").innerHTML='<div class="item-card"><h3>Welcome to Wizzy Official</h3><p>New updates will appear here.</p></div>'}
async function load(){if(!sb){fallback();return}const {data,error}=await sb.from("posts").select("*").eq("published",true).order("created_at",{ascending:false});if(error){console.error(error);fallback();return}const music=data.filter(x=>x.type==="music"),videos=data.filter(x=>x.type==="video"),gallery=data.filter(x=>x.type==="photo"),news=data.filter(x=>x.type==="news");
document.querySelector("#music-list").innerHTML=music.length?music.map(x=>`<article class="item-card"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p>${x.media_url?`<audio controls src="${esc(x.media_url)}"></audio>`:""}</article>`).join(""):'<div class="item-card"><h3>No music yet</h3><p>Music added from the Admin Dashboard will appear here.</p></div>';

document.querySelector("#video-list").innerHTML=videos.length?videos.map(x=>{
  let u=x.media_url||"";
  let id=(u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/)||[])[1];

  let player=id
    ? `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${id}" title="${esc(x.title)}" allowfullscreen></iframe>`
    : u
      ? `<video controls playsinline preload="metadata" src="${esc(u)}"></video>`
      : "";

  return `<article class="item-card">
    <h3>${esc(x.title)}</h3>
    <p>${esc(x.body)}</p>
    ${player}
  </article>`;
}).join(""):'<div class="item-card"><h3>No videos yet</h3><p>Add a video from the Admin Dashboard.</p></div>';

document.querySelector("#gallery-list").innerHTML=gallery.length?gallery.map(x=>`<article class="item-card"><img src="${esc(x.media_url)}" alt="${esc(x.title)}"><h3>${esc(x.title)}</h3></article>`).join(""):'<div class="gallery-one"><img src="wizzy-photo.png" alt="Wizzy Official portrait"></div>';
document.querySelector("#news-list").innerHTML=news.length?news.map(x=>`<article class="item-card"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join(""):'<div class="item-card"><h3>No news yet</h3><p>New updates will appear here.</p></div>'}
load();document.querySelector(".menu").addEventListener("click",()=>document.querySelector(".nav nav").classList.toggle("open"));
