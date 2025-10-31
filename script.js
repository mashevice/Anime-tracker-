const API = 'https://api.jikan.moe/v4';
const els = {
  carouselTop: document.getElementById('carousel-top'),
  carouselAiring: document.getElementById('carousel-airing'),
  carouselUpcoming: document.getElementById('carousel-upcoming'),
  heroTitle: document.getElementById('hero-title'),
  heroImage: document.getElementById('hero-image'),
  heroExplore: document.getElementById('hero-explore'),
  heroAiring: document.getElementById('hero-airing'),
  globalSearch: document.getElementById('globalSearch'),
  detailModal: document.getElementById('detailModal'),
  modalBody: document.getElementById('modal-body'),
  closeModal: document.getElementById('closeModal')
};

function el(tag, cls) { const d = document.createElement(tag); if (cls) d.className = cls; return d; }

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

function makeCard(anime) {
  const c = el('div','card');
  c.tabIndex = 0;
  c.innerHTML = `
    <img src="${anime.images?.jpg?.image_url || ''}" alt="${anime.title}">
    <div class="card-body">
      <div class="card-title">${anime.title}</div>
      <div class="card-meta">⭐ ${anime.score ?? 'N/A'}</div>
    </div>`;
  c.onclick = () => openDetail(anime);
  c.onkeypress = (e) => { if (e.key === 'Enter') openDetail(anime); };
  return c;
}

async function loadTop() {
  try {
    els.carouselTop.innerHTML = 'Loading...';
    const data = await fetchJson(`${API}/top/anime?limit=12`);
    els.carouselTop.innerHTML = '';
    data.data.forEach(a => els.carouselTop.appendChild(makeCard(a)));
    setHero(data.data[0]); // pick first for hero
  } catch(e) {
    els.carouselTop.innerHTML = '<div style="color:#f00">Failed to load top</div>';
    console.error(e);
  }
}

async function loadAiring() {
  try {
    els.carouselAiring.innerHTML = 'Loading...';
    const data = await fetchJson(`${API}/seasons/now`);
    els.carouselAiring.innerHTML = '';
    data.data.slice(0,12).forEach(a => els.carouselAiring.appendChild(makeCard(a)));
  } catch(e) {
    els.carouselAiring.innerHTML = '<div style="color:#f00">Failed to load airing</div>';
    console.error(e);
  }
}

async function loadUpcoming() {
  try {
    els.carouselUpcoming.innerHTML = 'Loading...';
    const data = await fetchJson(`${API}/seasons/upcoming`);
    els.carouselUpcoming.innerHTML = '';
    (data.data||[]).slice(0,12).forEach(a => els.carouselUpcoming.appendChild(makeCard(a)));
  } catch(e) {
    els.carouselUpcoming.innerHTML = '<div style="color:#f00">Failed to load upcoming</div>';
    console.error(e);
  }
}

function setHero(anime) {
  if(!anime) return;
  els.heroTitle.textContent = anime.title;
  els.heroImage.style.backgroundImage = `url(${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''})`;
  els.heroSub = anime;
  els.heroExplore.onclick = () => openDetail(anime);
  els.heroAiring.onclick = () => loadAiring();
}

async function openDetail(anime) {
  // show modal content
  const html = `
    <div style="display:flex;gap:16px">
      <div style="flex:0 0 260px"><img src="${anime.images?.jpg?.image_url}" style="width:100%;border-radius:8px"></div>
      <div style="flex:1">
        <h2>${anime.title}</h2>
        <p><strong>Score:</strong> ${anime.score ?? 'N/A'} • <strong>Type:</strong> ${anime.type ?? 'N/A'}</p>
        <p style="color:#555">${anime.synopsis ?? 'No description available.'}</p>
        <p><a href="https://myanimelist.net/anime/${anime.mal_id}" target="_blank" rel="noopener">View on MyAnimeList</a></p>
      </div>
    </div>
  `;
  els.modalBody.innerHTML = html;
  els.detailModal.classList.remove('hidden');
  els.detailModal.setAttribute('aria-hidden','false');
}

function closeModal() {
  els.detailModal.classList.add('hidden');
  els.detailModal.setAttribute('aria-hidden','true');
}

// search
let searchTimer = null;
els.globalSearch.addEventListener('input', ()=>{
  const q=els.globalSearch.value.trim();
  if(searchTimer) clearTimeout(searchTimer);
  if(q.length<3) return;
  searchTimer = setTimeout(()=>searchAnime(q), 400);
});

async function searchAnime(q){
  try{
    const res = await fetchJson(`${API}/anime?q=${encodeURIComponent(q)}&limit=12`);
    // show results by replacing a section (simple)
    document.querySelector('#carousel-top').innerHTML = '';
    (res.data || []).forEach(a => document.querySelector('#carousel-top').appendChild(makeCard(a)));
    window.scrollTo({top:200, behavior:'smooth'});
  }catch(e){
    console.error(e);
  }
}

// modal close hooks
els.closeModal?.addEventListener('click', closeModal);
els.detailModal?.addEventListener('click', (e)=>{ if(e.target===els.detailModal) closeModal(); });

// init
loadTop();
loadAiring();
loadUpcoming();
