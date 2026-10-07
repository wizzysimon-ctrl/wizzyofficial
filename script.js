const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu');

menu.addEventListener('click', () => {
  nav.classList.toggle('open');
});

document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('open'));
});


// Load music from Supabase
async function loadMusic() {
  const musicContainer = document.querySelector('#music .placeholder');

  if (!musicContainer) return;

  const { data, error } = await supabaseClient
    .from('music')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading music:', error);
    musicContainer.innerHTML = '<p>Unable to load music.</p>';
    return;
  }

  if (!data || data.length === 0) {
    musicContainer.innerHTML = '<span>♪</span><p>Your songs will appear here.</p>';
    return;
  }

  musicContainer.innerHTML = '';

  data.forEach(song => {
    const item = document.createElement('div');
    item.className = 'music-item';

    item.innerHTML = `
      <h3>${song.title}</h3>
      ${song.artist ? `<p>${song.artist}</p>` : ''}
      <audio controls src="${song.audio_url}"></audio>
    `;

    musicContainer.appendChild(item);
  });
}

loadMusic();
