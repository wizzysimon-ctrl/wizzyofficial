const cfg = window.WIZZY_CONFIG || {};
let sb = null;
let manualMusicData = [];
let manualVideoData = [];
let youtubeRefreshInProgress = false;
if (
  window.supabase &&
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_URL.startsWith("http") &&
  cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_ANON_KEY.includes("PASTE")
) {
  sb = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );
}

const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[m]));

function slug(s) {
  return String(s || "content")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// SHARE BUTTONS
function shareButtons(x, section) {
  const title = x.title || "Wizzy Official";
  const anchor = `${section}-${slug(title)}`;
  const url = `${location.origin}${location.pathname}#${anchor}`;
  const message = `${title} | Wizzy Official\n${url}`;

  return `
    <div class="share-tools">
      <button type="button" class="share-native"
        data-title="${esc(title)}"
        data-url="${esc(url)}">
        📤 Share
      </button>

      <a class="share-whatsapp"
        href="https://wa.me/?text=${encodeURIComponent(message)}"
        target="_blank" rel="noopener noreferrer">
        🟢 WhatsApp
      </a>

      <a class="share-facebook"
        href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}"
        target="_blank" rel="noopener noreferrer">
        Facebook
      </a>

      <button type="button" class="share-copy"
        data-url="${esc(url)}">
        🔗 Copy Link
      </button>
    </div>
  `;
}

// COPY LINK
async function copyWizzyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied! Share it with your friends.");
  } catch {
    prompt("Copy this link:", url);
  }
}

// SHARE BUTTON ACTIONS
document.addEventListener("click", async e => {
  const shareBtn = e.target.closest(".share-native");
  const copyBtn = e.target.closest(".share-copy");

  if (shareBtn) {
    const title = shareBtn.dataset.title;
    const url = shareBtn.dataset.url;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check this out on Wizzy Official: ${title}`,
          url: url
        });
      } catch {}
    } else {
      await copyWizzyLink(url);
    }
  }

  if (copyBtn) {
    await copyWizzyLink(copyBtn.dataset.url);
  }
});

// FALLBACK
function fallback() {
  document.querySelector("#music-list").innerHTML =
    '<div class="item-card"><h3>Music coming soon</h3><p>Wizzy songs will appear here.</p></div>';

  document.querySelector("#video-list").innerHTML =
    '<div class="item-card"><h3>Videos coming soon</h3><p>Wizzy videos will appear here.</p></div>';

  document.querySelector("#gallery-list").innerHTML =
    '<div class="gallery-one"><img src="wizzy-photo.png" alt="Wizzy Official portrait"></div>';

  document.querySelector("#news-list").innerHTML =
    '<div class="item-card"><h3>No news yet</h3><p>New updates will appear here.</p></div>';
}
// REFRESH YOUTUBE ONLY
async function refreshYouTube() {
  if (youtubeRefreshInProgress) return;

  youtubeRefreshInProgress = true;

  try {
    const response = await fetch(
      "https://hywmvpdktjesdndpsjhm.supabase.co/functions/v1/youtube-videos",
      {
        method: "GET",
        headers: {
          "apikey": cfg.SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${cfg.SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Could not refresh YouTube content");
    }

    const result = await response.json();

    const youtubeMusic = result.music || [];
    const youtubeVideos = result.videos || [];

    const musicHTML = [
      ...manualMusicData.map(x => `
        <article class="item-card" id="music-${slug(x.title)}">
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.body)}</p>
          ${x.media_url ? `<audio controls preload="metadata" src="${esc(x.media_url)}"></audio>` : ""}
          ${shareButtons(x, "music")}
        </article>
      `),
      ...youtubeMusic.map(x => `
        <article class="item-card" id="music-${slug(x.title)}">
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.description)}</p>
          <iframe width="100%" height="240"
            src="https://www.youtube.com/embed/${encodeURIComponent(x.videoId)}"
            title="${esc(x.title)}" allowfullscreen loading="lazy">
          </iframe>
          ${shareButtons(x, "music")}
        </article>
      `)
    ];

    document.querySelector("#music-list").innerHTML = musicHTML.length
      ? musicHTML.join("")
      : '<div class="item-card"><h3>No music yet</h3><p>Wizzy songs will appear here.</p></div>';

    const videoHTML = [
      ...manualVideoData.map(x => {
        const u = x.media_url || "";
        const id = (u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/) || [])[1];

        const player = id
          ? `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${id}" title="${esc(x.title)}" allowfullscreen></iframe>`
          : u ? `<video controls playsinline preload="metadata" src="${esc(u)}"></video>` : "";

        return `
          <article class="item-card" id="video-${slug(x.title)}">
            <h3>${esc(x.title)}</h3>
            <p>${esc(x.body)}</p>
            ${player}
            ${shareButtons(x, "video")}
          </article>
        `;
      }),
      ...youtubeVideos.map(x => `
        <article class="item-card" id="video-${slug(x.title)}">
          <h3>${esc(x.title)}</h3>
          <p>${esc(x.description)}</p>
          <iframe width="100%" height="240"
            src="https://www.youtube.com/embed/${encodeURIComponent(x.videoId)}"
            title="${esc(x.title)}" allowfullscreen loading="lazy">
          </iframe>
          <a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">
            Watch on YouTube
          </a>
          ${shareButtons(x, "video")}
        </article>
      `)
    ];

    document.querySelector("#video-list").innerHTML = videoHTML.length
      ? videoHTML.join("")
      : '<div class="item-card"><h3>No videos yet</h3><p>Add a video from Admin Dashboard or YouTube.</p></div>';

  } catch (error) {
    console.error("YouTube refresh error:", error);
  } finally {
    youtubeRefreshInProgress = false;
  }
}
// LOAD CONTENT
async function load() {
  if (!sb) {
    fallback();
    return;
  }

  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    fallback();
    return;
  }

  const music = data.filter(x => x.type === "music");
  const videos = data.filter(x => x.type === "video");
  const gallery = data.filter(x => x.type === "photo");
  const news = data.filter(x => x.type === "news");

 
    // SAVE ADMIN DASHBOARD CONTENT
  manualMusicData = music;
  manualVideoData = videos;

  // LOAD YOUTUBE MUSIC AND VIDEOS
  await refreshYouTube();
  // GALLERY
  document.querySelector("#gallery-list").innerHTML = gallery.length
    ? gallery.map(x => `
      <article class="item-card" id="photo-${slug(x.title)}">
        <img src="${esc(x.media_url)}" alt="${esc(x.title)}">
        <h3>${esc(x.title)}</h3>
        ${shareButtons(x, "photo")}
      </article>
    `).join("")
    : '<div class="gallery-one"><img src="wizzy-photo.png" alt="Wizzy Official portrait"></div>';

  
  // NEWS
  document.querySelector("#news-list").innerHTML = news.length
    ? news.map(x => `
      <article class="item-card" id="news-${slug(x.title)}">
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.body)}</p>
        ${shareButtons(x, "news")}
      </article>
    `).join("")
    : '<div class="item-card"><h3>No news yet</h3><p>New updates will appear here.</p></div>';

  // OPEN THE SHARED CONTENT AFTER SUPABASE LOADS
  if (window.location.hash) {
    requestAnimationFrame(() => {
      const target = document.getElementById(
        decodeURIComponent(window.location.hash.substring(1))
      );

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }
}

// START
load();
setInterval(refreshYouTube, 120000);
document.querySelector(".menu").addEventListener("click", () =>
  document.querySelector(".nav nav").classList.toggle("open")
);

