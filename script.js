// OtakuVerse — Phase 1 (frontend with live Jikan API, local favorites/watchlist)
// NOTE: put index.html, style.css, script.js in same folder.

const API = 'https://api.jikan.moe/v4';

// ELEMENTS
const el = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);

const carouselTop = el('carousel-top');
const carouselAiring = el('carousel-airing');
const carouselUpcoming = el('carousel-upcoming');
const genreList = el('genreList');
const genreResults = el('genreResults');
const heroImage = el('heroImage');
const heroTitle = el('heroTitle');
const heroSub = el('heroSub');

const searchInput = el('searchInput');
const searchResults = el('searchResults');

const notifBtn = el('notifBtn');
const notifBadge = el('notifBadge');

const userBtn = el('userBtn');
const userDropdown = el('userDropdown');
const userDisplay = el('userDisplay');
const openLogin = el('openLogin');
const openSettings = el('openSettings');
const openFav = el('openFav');
const openWatch = el('openWatch');
const openReviews = el('openReviews');
const logoutBtn = el('logoutBtn');

const detailModal = el('detailModal');
const closeDetail = el('closeDetail');
const detailImage = el('detailImage');
const detailTitle = el('detailTitle');
const detailSynopsis = el('detailSynopsis');
const detailGenres = el('detailGenres');
const detailScore = el('detailScore');
const detailEpisodes = el('detailEpisodes');
const detailAge = el('detailAge');
const favBtn = el('favBtn');
const watchBtn = el('watchBtn');
const malLink = el('malLink');
const userRating = el('userRating');
const submitRating = el('submitRating');

const loginModal = el('loginModal');
const closeLogin = el('closeLogin');
const loginSubmit = el('loginSubmit');
const loginName = el('loginName');

const settingsModal = el('settingsModal');
const closeSettings = el('closeSettings');
const themeSelect = el('themeSelect');

const favModal = el('favModal'), favList = el('favList'), closeFav = el('closeFav');
const watchModal = el('watchModal'), watchList = el('watchList'), closeWatch = el('closeWatch');

const sections = {
  home: el('section-top'),
  top: el('section-top'),
  airing: el('section-airing'),
  upcoming: el('section-upcoming'),
  genres: el('section-genres'),
  watchlist: el('section-watchlist'),
  favorites: el('section-favorites')
};

// USER + STORAGE
let currentUser = localStorage.getItem('ov_user') || null;
let favorites = JSON.parse(localStorage.getItem('ov_favorites') || '{}'); // { username: [animeObj,...] }
let watchlist = JSON.parse(localStorage.getItem('ov_watchlist') || '{}');
let seenAiring = JSON.parse(localStorage.getItem('ov_seen') || '[]'); // store seen mal_ids for notif simulation

// HELPERS
function saveFavs(){ localStorage.setItem('ov_favorites', JSON.stringify(favorites)); }
function saveWatch(){ localStorage.setItem('ov_watchlist', JSON.stringify(watchlist)); }
function saveSeen(){ localStorage.setItem('ov_seen', JSON.stringify(seenAiring)); }
function userKey(){ return currentUser || 'guest'; }

function makeCard(anime){
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="favorite-btn" title="Toggle favorite">❤</div>
    <img loading="lazy" src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''}" alt="${anime.title}">
    <div class="card-body">
      <div class="title">${anime.title}</div>
      <div class="meta">⭐ ${anime.score ?? 'N/A'}</div>
    </div>
  `;
  // click open detail (except when favorite clicked)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.favorite-btn')) return;
    openDetail(anime);
  });
  // favorite toggle
  const favBtnEl = card.querySelector('.favorite-btn');
  favBtnEl.addEventListener('click', (ev) => {
    ev.stopPropagation();
    toggleFavorite(anime);
  });
  return card;
}

async function fetchJson(path){
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

// LOAD SECTION DATA
async function loadTop(){
  carouselTop.innerHTML = 'Loading...';
  try{
    const json = await fetchJson('top/anime?limit=12');
    carouselTop.innerHTML = '';
    json.data.forEach(a => carouselTop.appendChild(makeCard(a)));
    // set hero
    const pick = json.data[0];
    heroImage.style.backgroundImage = `url(${pick.images?.jpg?.large_image_url})`;
    heroTitle.textContent = pick.title;
    heroSub.textContent = pick.synopsis ? pick.synopsis.slice(0,140) + '...' : 'Featured anime';
  }catch(err){
    console.error(err); carouselTop.innerHTML = '<div class="err">Failed to load top</div>';
  }
}

async function loadAiring(){
  carouselAiring.innerHTML = 'Loading...';
  try{
    const json = await fetchJson('seasons/now');
    carouselAiring.innerHTML = '';
    (json.data||[]).slice(0,12).forEach(a => carouselAiring.appendChild(makeCard(a)));
    // notifications simulation: find new ids not in seenAiring
    const ids = (json.data||[]).map(a=>a.mal_id);
    const newOnes = ids.filter(id => !seenAiring.includes(id));
    if (newOnes.length) {
      notifBadge.textContent = newOnes.length;
      notifBadge.classList.remove('hidden');
    } else {
      notifBadge.classList.add('hidden');
    }
  }catch(err){
    console.error(err); carouselAiring.innerHTML = '<div class="err">Failed to load airing</div>';
  }
}

async function loadUpcoming(){
  carouselUpcoming.innerHTML = 'Loading...';
  try{
    const json = await fetchJson('seasons/upcoming');
    carouselUpcoming.innerHTML = '';
    (json.data||[]).slice(0,12).forEach(a => carouselUpcoming.appendChild(makeCard(a)));
  }catch(err){
    console.error(err); carouselUpcoming.innerHTML = '<div class="err">Failed to load upcoming</div>';
  }
}

async function loadGenres(){
  try{
    const json = await fetchJson('genres/anime');
    genreList.innerHTML = '';
    (json.data||[]).slice(0,20).forEach(g=>{
      const b = document.createElement('button');
      b.className = 'genre-item';
      b.textContent = g.name;
      b.addEventListener('click', ()=> loadByGenre(g.mal_id));
      genreList.appendChild(b);
    });
  }catch(err){ console.error(err); genreList.innerHTML = '<div class="err">Failed to load genres</div>'; }
}

async function loadByGenre(id){
  try{
    genreResults.innerHTML = 'Loading...';
    const json = await fetchJson(`anime?genres=${id}&limit=24`);
    genreResults.innerHTML = '';
    (json.data||[]).forEach(a => genreResults.appendChild(makeCard(a)));
  }catch(err){ console.error(err); genreResults.innerHTML = '<div class="err">Failed to load genre</div>'; }
}

// SEARCH (debounced + dropdown)
let searchTimer = null;
searchInput.addEventListener('input', (e)=>{
  const q = e.target.value.trim();
  if (searchTimer) clearTimeout(searchTimer);
  if (q.length < 3) { searchResults.classList.add('hidden'); return; }
  searchTimer = setTimeout(()=> doSearch(q), 350);
});

async function doSearch(q){
  try{
    const json = await fetchJson(`anime?q=${encodeURIComponent(q)}&limit=8`);
    searchResults.innerHTML = '';
    (json.data||[]).forEach(a=>{
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `<img src="${a.images?.jpg?.image_url}" alt="" /><div><strong>${a.title}</strong><div class="muted">⭐ ${a.score ?? 'N/A'}</div></div>`;
      item.addEventListener('click', ()=>{ searchResults.classList.add('hidden'); openDetail(a); });
      searchResults.appendChild(item);
    });
    searchResults.classList.remove('hidden');
  }catch(err){ console.error(err); }
}

// NOTIFICATIONS (simple)
notifBtn.addEventListener('click', async ()=>{
  try{
    const json = await fetchJson('seasons/now');
    const newIds = (json.data||[]).map(a=>a.mal_id).filter(id => !seenAiring.includes(id));
    if (newIds.length === 0) {
      alert('No new airing updates since your last visit.');
      return;
    }
    // show simple modal / alert listing new titles
    const newTitles = (json.data||[]).filter(a=> newIds.includes(a.mal_id)).map(a=>a.title).slice(0,8);
    alert(`New airing this session:\n\n• ${newTitles.join('\n• ')}`);
    // mark as seen
    seenAiring = Array.from(new Set([...seenAiring, ...newIds]));
    saveSeen();
    notifBadge.classList.add('hidden');
  }catch(err){ console.error(err); alert('Failed to load notifications'); }
});

// 3-DOT USER MENU
userBtn.addEventListener('click', ()=> {
  userDropdown.classList.toggle('hidden');
});
openLogin.addEventListener('click', ()=> {
  userDropdown.classList.add('hidden');
  loginModal.classList.remove('hidden');
});
openSettings.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); settingsModal.classList.remove('hidden'); });
openFav.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); favModal.classList.remove('hidden'); renderFavs(); });
openWatch.addEventListener('click', ()=> { userDropdown.classList.add('hidden'); watchModal.classList.remove('hidden'); renderWatch(); });
openReviews.addEventListener('click', ()=> { alert('Reviews feature coming soon (Phase 2).'); });

// LOGIN (very simple local demo)
loginSubmit.addEventListener('click', ()=>{
  const name = (loginName.value || '').trim();
  if (!name) return alert('Enter a display name');
  currentUser = name;
  localStorage.setItem('ov_user', name);
  userDisplay.textContent = name;
  logoutBtn.style.display = 'block';
  loginModal.classList.add('hidden');
  alert(`Signed in as ${name} (local demo).`);
});
closeLogin.addEventListener('click', ()=> loginModal.classList.add('hidden'));
logoutBtn.addEventListener('click', ()=>{
  currentUser = null;
  localStorage.removeItem('ov_user');
  userDisplay.textContent = 'Not signed in';
  logoutBtn.style.display = 'none';
  alert('Signed out (local demo).');
});

// DETAIL MODAL (open/close + actions)
function openDetail(anime){
  detailImage.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  detailTitle.textContent = anime.title;
  detailSynopsis.textContent = anime.synopsis || 'No synopsis available.';
  detailGenres.textContent = (anime.genres || (anime.genres===undefined? []:[])).map(g=>g.name).join(', ') || (anime.tags||[]).map(t=>t.name).join(', ');
  detailScore.textContent = `Score: ${anime.score ?? 'N/A'}`;
  detailEpisodes.textContent = `Episodes: ${anime.episodes ?? 'N/A'}`;
  detailAge.textContent = anime.rating || 'N/A';
  malLink.onclick = ()=> window.open(`https://myanimelist.net/anime/${anime.mal_id}`, '_blank');
  // track currently opened anime for fav/watch toggles
  detailModal.dataset.current = anime.mal_id;
  detailModal.dataset.anime = JSON.stringify(anime);
  // show modal
  detailModal.classList.remove('hidden');
}
closeDetail.addEventListener('click', ()=> detailModal.classList.add('hidden'));
detailModal.addEventListener('click', (e)=> { if (e.target === detailModal) detailModal.classList.add('hidden'); });

// FAVORITES & WATCHLIST functions
function toggleFavorite(anime){
  const key = userKey();
  if (!favorites[key]) favorites[key] = [];
  const exists = favorites[key].find(a=>a.mal_id === anime.mal_id);
  if (exists) {
    favorites[key] = favorites[key].filter(a=>a.mal_id !== anime.mal_id);
    alert('Removed from favorites');
  } else {
    favorites[key].push(anime);
    alert('Added to favorites');
  }
  saveFavs();
}
function toggleWatchlist(anime){
  const key = userKey();
  if (!watchlist[key]) watchlist[key] = [];
  const exists = watchlist[key].find(a=>a.mal_id === anime.mal_id);
  if (exists) {
    watchlist[key] = watchlist[key].filter(a=>a.mal_id !== anime.mal_id);
    alert('Removed from watchlist');
  } else {
    watchlist[key].push(anime);
    alert('Added to watchlist');
  }
  saveWatch();
}
function renderFavs(){
  const key = userKey();
  favList.innerHTML = '';
  const list = favorites[key] || [];
  if (!list.length) favList.innerHTML = '<div style="padding:18px;color:var(--muted)">No favorites yet</div>';
  else list.forEach(a => favList.appendChild(makeCard(a)));
}
function renderWatch(){
  const key = userKey();
  watchList.innerHTML = '';
  const list = watchlist[key] || [];
  if (!list.length) watchList.innerHTML = '<div style="padding:18px;color:var(--muted)">No items</div>';
  else list.forEach(a => watchList.appendChild(makeCard(a)));
}

// wire the modal fav/watch buttons to operate on currently open anime
favBtn.addEventListener('click', ()=> {
  const anime = JSON.parse(detailModal.dataset.anime || '{}');
  if (anime && anime.mal_id) toggleFavorite(anime);
});
watchBtn.addEventListener('click', ()=> {
  const anime = JSON.parse(detailModal.dataset.anime || '{}');
  if (anime && anime.mal_id) toggleWatchlist(anime);
});

// settings modal
openSettings?.addEventListener('click', ()=> settingsModal.classList.remove('hidden'));
closeSettings?.addEventListener('click', ()=> settingsModal.classList.add('hidden'));

// favorites/watch modal close
closeFav?.addEventListener('click', ()=> favModal.classList.add('hidden'));
closeWatch?.addEventListener('click', ()=> watchModal.classList.add('hidden'));

// NAVIGATION: handle nav-btn clicks to show corresponding sections (scroll into view)
qsa('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    qsa('.nav-btn').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    // hide main sections and show appropriate one
    // scroll to matching section element if present
    const map = {
      home: 0,
      top: el('section-top'),
      airing: el('section-airing'),
      upcoming: el('section-upcoming'),
      genres: el('section-genres'),
      watchlist: el('section-watchlist'),
      favorites: el('section-favorites')
    };
    const target = map[section];
    if (section === 'home') window.scrollTo({top:0, behavior:'smooth'});
    else if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// helper
function userKey(){ return currentUser || 'guest'; }

// INIT
async function init(){
  if (currentUser) {
    userDisplay.textContent = currentUser;
    logoutBtn.style.display = 'block';
  }
  // initial loads
  await Promise.all([loadTop(), loadAiring(), loadUpcoming(), loadGenres()]);
  // hide search results when click outside
  document.addEventListener('click', (e)=> {
    if (!e.target.closest('.search-wrapper')) searchResults.classList.add('hidden');
    if (!e.target.closest('.user-menu')) userDropdown.classList.add('hidden');
  });
}

init().catch(console.error);
