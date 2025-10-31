// OtakuVerse final (responsive + mobile bottom-sheet + live Jikan API)
// Put index.html, style.css, script.js together in same folder.

const API = 'https://api.jikan.moe/v4';
const API = 'https://api.jikan.moe/v4';
const carouselTop = document.getElementById('carousel-top');

async function loadTopAnime() {
  try {
    const res = await fetch(`${API}/top/anime`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    console.log("Fetched data:", data); // Debug log
    if (!data.data || data.data.length === 0) {
      carouselTop.innerHTML = "<p>No anime found.</p>";
      return;
    }

    carouselTop.innerHTML = data.data
      .slice(0, 10)
      .map(a => `
        <div class="anime-card">
          <img src="${a.images.jpg.image_url}" alt="${a.title}">
          <h4>${a.title}</h4>
        </div>
      `)
      .join('');
  } catch (err) {
    console.error("Failed to load top anime:", err);
    carouselTop.innerHTML = `<p style="color:red;">Error loading anime: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadTopAnime);
// helpers
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// elements
const carouselTop = $('carousel-top');
const carouselAiring = $('carousel-airing');
const carouselUpcoming = $('carousel-upcoming');
const genreList = $('genreList');
const genreResults = $('genreResults');
const heroImage = $('heroImage');
const heroTitle = $('heroTitle');
const heroSub = $('heroSub');

const searchInput = $('searchInput');
const searchResults = $('searchResults');

const notifBtn = $('notifBtn');
const notifBadge = $('notifBadge');

const userBtn = $('userBtn');
const userDropdown = $('userDropdown');
const userDisplay = $('userDisplay');
const openLogin = $('openLogin');
const openSettings = $('openSettings');
const openFav = $('openFav');
const openWatch = $('openWatch');
const openReviews = $('openReviews');
const logoutBtn = $('logoutBtn');

const detailModal = $('detailModal');
const closeDetail = $('closeDetail');
const detailImage = $('detailImage');
const detailTitle = $('detailTitle');
const detailSynopsis = $('detailSynopsis');
const detailGenres = $('detailGenres');
const detailScore = $('detailScore');
const detailEpisodes = $('detailEpisodes');
const detailAge = $('detailAge');
const favBtn = $('favBtn');
const watchBtn = $('watchBtn');
const malLink = $('malLink');
const userRating = $('userRating');
const submitRating = $('submitRating');

const loginModal = $('loginModal');
const closeLogin = $('closeLogin');
const loginSubmit = $('loginSubmit');
const loginName = $('loginName');

const settingsModal = $('settingsModal');
const closeSettings = $('closeSettings');

const favModal = $('favModal'); const favList = $('favList'); const closeFav = $('closeFav');
const watchModal = $('watchModal'); const watchList = $('watchList'); const closeWatch = $('closeWatch');

// storage keys
let currentUser = localStorage.getItem('ov_user') || null;
let favorites = JSON.parse(localStorage.getItem('ov_favorites') || '{}');
let watchlist = JSON.parse(localStorage.getItem('ov_watchlist') || '{}');
let seenAiring = JSON.parse(localStorage.getItem('ov_seen') || '[]');

function saveFavs(){ localStorage.setItem('ov_favorites', JSON.stringify(favorites)); }
function saveWatch(){ localStorage.setItem('ov_watchlist', JSON.stringify(watchlist)); }
function saveSeen(){ localStorage.setItem('ov_seen', JSON.stringify(seenAiring)); }
function userKey(){ return currentUser || 'guest'; }

async function fetchJson(path){
  const full = `${API}/${path}`;
  const res = await fetch(full);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

// create card (use large images to avoid blur)
function makeCard(anime){
  const div = document.createElement('div');
  div.className = 'card';
  const imgUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  div.innerHTML = `
    <div class="favorite-btn" title="Toggle favorite">❤</div>
    <img loading="lazy" src="${imgUrl}" alt="${escapeHtml(anime.title)}" />
    <div class="card-body">
      <div class="title">${escapeHtml(anime.title)}</div>
      <div class="meta">⭐ ${anime.score ?? 'N/A'}</div>
    </div>
  `;
  // open detail unless favorite tapped
  div.addEventListener('click', (e)=>{
    if (e.target.closest('.favorite-btn')) return;
    openDetail(anime);
  }, {passive:true});
  // favorite handler
  div.querySelector('.favorite-btn').addEventListener('click', (e)=>{
    e.stopPropagation();
    toggleFavorite(anime);
  });
  return div;
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// load top anime
async function loadTop(){
  carouselTop.innerHTML = 'Loading...';
  try{
    const json = await fetchJson('top/anime?limit=12');
    carouselTop.innerHTML = '';
    json.data.forEach(a=> carouselTop.appendChild(makeCard(a)));
    // hero set
    const pick = json.data[0];
    heroImage.style.backgroundImage = `url(${pick.images?.jpg?.large_image_url})`;
    heroTitle.textContent = pick.title;
    heroSub.textContent = pick.synopsis ? pick.synopsis.slice(0,140)+'...' : 'Featured anime';
  }catch(err){ carouselTop.innerHTML = '<div class="err">Failed to load top</div>'; console.error(err); }
}

// load airing
async function loadAiring(){
  carouselAiring.innerHTML = 'Loading...';
  try{
    const json = await fetchJson('seasons/now');
    carouselAiring.innerHTML = '';
    (json.data||[]).slice(0,12).forEach(a=> carouselAiring.appendChild(makeCard(a)));
    // notification simulation
    const ids = (json.data||[]).map(a=>a.mal_id);
    const newOnes = ids.filter(id => !seenAiring.includes(id));
    if (newOnes.length) { notifBadge.textContent = newOnes.length; notifBadge.classList.remove('hidden'); } else notifBadge.classList.add('hidden');
  }catch(err){ carouselAiring.innerHTML = '<div class="err">Failed to load airing</div>'; console.error(err); }
}

// load upcoming
async function loadUpcoming(){
  carouselUpcoming.innerHTML = 'Loading...';
  try{
    const json = await fetchJson('seasons/upcoming');
    carouselUpcoming.innerHTML = '';
    (json.data||[]).slice(0,12).forEach(a=> carouselUpcoming.appendChild(makeCard(a)));
  }catch(err){ carouselUpcoming.innerHTML = '<div class="err">Failed to load upcoming</div>'; console.error(err); }
}

// load genres
async function loadGenres(){
  try{
    const json = await fetchJson('genres/anime');
    genreList.innerHTML = '';
    (json.data||[]).slice(0,20).forEach(g=>{
      const b = document.createElement('button'); b.className='genre-item'; b.textContent=g.name;
      b.addEventListener('click', ()=> loadByGenre(g.mal_id)); genreList.appendChild(b);
    });
  }catch(err){ genreList.innerHTML = '<div class="err">Failed to load genres</div>'; console.error(err); }
}
async function loadByGenre(id){
  genreResults.innerHTML='Loading...';
  try{
    const json = await fetchJson(`anime?genres=${id}&limit=24`);
    genreResults.innerHTML=''; (json.data||[]).forEach(a=> genreResults.appendChild(makeCard(a)));
  }catch(err){ genreResults.innerHTML='<div class="err">Failed to load genre</div>'; console.error(err); }
}

// SEARCH (debounced + dropdown)
let timer = null;
searchInput.addEventListener('input',(e)=>{
  const q = e.target.value.trim();
  if (timer) clearTimeout(timer);
  if (q.length < 3) { searchResults.classList.add('hidden'); return; }
  timer = setTimeout(()=> doSearch(q), 300);
});
async function doSearch(q){
  try{
    const json = await fetchJson(`anime?q=${encodeURIComponent(q)}&limit=8`);
    searchResults.innerHTML='';
    (json.data||[]).forEach(a=>{
      const item = document.createElement('div'); item.className='search-item';
      item.innerHTML = `<img src="${a.images?.jpg?.image_url}" alt="" /><div><strong>${escapeHtml(a.title)}</strong><div class="muted">⭐ ${a.score ?? 'N/A'}</div></div>`;
      item.addEventListener('click', ()=>{ searchResults.classList.add('hidden'); openDetail(a); });
      searchResults.appendChild(item);
    });
    if ((json.data||[]).length===0) searchResults.innerHTML='<div class="err" style="padding:8px">No results</div>';
    searchResults.classList.remove('hidden');
  }catch(err){ console.error(err); }
}

// notifications
notifBtn.addEventListener('click', async ()=>{
  try{
    const json = await fetchJson('seasons/now');
    const newIds = (json.data||[]).map(a=>a.mal_id).filter(id => !seenAiring.includes(id));
    if (!newIds.length) { alert('No new airing updates since last check.'); return; }
    const titles = (json.data||[]).filter(a=>newIds.includes(a.mal_id)).map(x=>x.title).slice(0,8);
    alert(`New airing this session:\n\n• ${titles.join('\n• ')}`);
    seenAiring = Array.from(new Set([...seenAiring, ...newIds])); saveSeen(); notifBadge.classList.add('hidden');
  }catch(err){ alert('Failed to load notifications'); console.error(err); }
});

// 3-dot menu
userBtn.addEventListener('click', ()=> userDropdown.classList.toggle('hidden'));
openLogin.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); loginModal.classList.remove('hidden'); });
openSettings.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); settingsModal.classList.remove('hidden'); });
openFav.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); favModal.classList.remove('hidden'); renderFavs(); });
openWatch.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); watchModal.classList.remove('hidden'); renderWatch(); });
openReviews.addEventListener('click', ()=> { alert('Reviews coming soon — Phase 2.'); });

// LOGIN (local demo)
loginSubmit.addEventListener('click', ()=>{
  const name = (loginName.value||'').trim();
  if (!name) return alert('Enter a display name');
  currentUser = name; localStorage.setItem('ov_user', name); userDisplay.textContent = name; logoutBtn.style.display='block';
  loginModal.classList.add('hidden'); alert(`Signed in as ${name} (local demo)`);
});
closeLogin.addEventListener('click', ()=> loginModal.classList.add('hidden'));
logoutBtn.addEventListener('click', ()=> { currentUser=null; localStorage.removeItem('ov_user'); userDisplay.textContent='Not signed in'; logoutBtn.style.display='none'; alert('Signed out'); });

// DETAILS bottom-sheet open/close
function openDetail(anime){
  detailImage.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  detailTitle.textContent = anime.title;
  detailSynopsis.textContent = anime.synopsis || 'No synopsis available.';
  detailGenres.textContent = (anime.genres||[]).map(g=>g.name).join(', ') || '';
  detailScore.textContent = `Score: ${anime.score ?? 'N/A'}`;
  detailEpisodes.textContent = `Episodes: ${anime.episodes ?? 'N/A'}`;
  detailAge.textContent = anime.rating || 'N/A';
  malLink.href = `https://myanimelist.net/anime/${anime.mal_id}`;
  detailModal.dataset.anime = JSON.stringify(anime);
  detailModal.classList.remove('hidden');
  // ensure bottom-sheet on mobile scroll into view
  setTimeout(()=> { detailModal.querySelector('.modal-sheet')?.scrollIntoView({behavior:'smooth'}); }, 80);
}
closeDetail.addEventListener('click', ()=> detailModal.classList.add('hidden'));
detailModal.addEventListener('click', (e)=> { if (e.target === detailModal) detailModal.classList.add('hidden'); });

// favorites / watchlist actions
function toggleFavorite(anime){
  const key = userKey();
  if (!favorites[key]) favorites[key]=[];
  const exists = favorites[key].find(a=>a.mal_id===anime.mal_id);
  if (exists) { favorites[key]=favorites[key].filter(a=>a.mal_id!==anime.mal_id); alert('Removed from favorites'); }
  else { favorites[key].push(anime); alert('Added to favorites'); }
  saveFavs();
}
function toggleWatchlist(anime){
  const key = userKey();
  if (!watchlist[key]) watchlist[key]=[];
  const exists = watchlist[key].find(a=>a.mal_id===anime.mal_id);
  if (exists) { watchlist[key]=watchlist[key].filter(a=>a.mal_id!==anime.mal_id); alert('Removed from watchlist'); }
  else { watchlist[key].push(anime); alert('Added to watchlist'); }
  saveWatch();
}
favBtn.addEventListener('click', ()=> { const anime = JSON.parse(detailModal.dataset.anime||'{}'); if (anime.mal_id) toggleFavorite(anime); });
watchBtn.addEventListener('click', ()=> { const anime = JSON.parse(detailModal.dataset.anime||'{}'); if (anime.mal_id) toggleWatchlist(anime); });

function renderFavs(){ const key=userKey(); favList.innerHTML=''; const list=favorites[key]||[]; if (!list.length) favList.innerHTML='<div style="padding:10px;color:var(--muted)">No favorites</div>'; else list.forEach(a=> favList.appendChild(makeCard(a))); }
function renderWatch(){ const key=userKey(); watchList.innerHTML=''; const list=watchlist[key]||[]; if (!list.length) watchList.innerHTML='<div style="padding:10px;color:var(--muted)">No items</div>'; else list.forEach(a=> watchList.appendChild(makeCard(a));) }

// nav buttons scroll handler
$$('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.nav-btn').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    if (section === 'home') window.scrollTo({top:0, behavior:'smooth'});
    else {
      const target = document.getElementById('section-'+section) || document.getElementById('section-'+section);
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// favorites/watchlist modal close
closeFav?.addEventListener('click', ()=> favModal.classList.add('hidden'));
closeWatch?.addEventListener('click', ()=> watchModal.classList.add('hidden'));

// safe init
async function init(){
  if (currentUser) { userDisplay.textContent = currentUser; logoutBtn.style.display='block'; }
  await Promise.all([loadTop(), loadAiring(), loadUpcoming(), loadGenres()]);
  // click outside closers
  document.addEventListener('click', e=>{
    if (!e.target.closest('.search-wrapper')) searchResults.classList.add('hidden');
    if (!e.target.closest('.user-menu')) userDropdown.classList.add('hidden');
  });
}
// start
init().catch(console.error);
