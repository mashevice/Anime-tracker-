const API_BASE = 'https://api.jikan.moe/v4';

// ===== ELEMENTS =====
const carousels = {
  top: document.getElementById('carousel-top'),
  airing: document.getElementById('carousel-airing'),
  upcoming: document.getElementById('carousel-upcoming'),
  genreResults: document.getElementById('carousel-genre-results')
};
const genreList = document.getElementById('genre-list');
const detailModal = document.getElementById('detailModal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('closeModal');
const heroImage = document.getElementById('hero-image');
const heroExplore = document.getElementById('hero-explore');
const heroAiring = document.getElementById('hero-airing');
const globalSearch = document.getElementById('globalSearch');

// ===== USER & FAVORITES =====
let currentUser = localStorage.getItem('animeUser') || null;
let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');

// ===== UTILS =====
function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.innerHTML = `
    <div class="favorite-btn" title="Add to favorites">❤</div>
    <img src="${anime.images?.jpg?.large_image_url}" alt="${anime.title}">
    <div class="info">
      <h3>${anime.title}</h3>
      <div class="score">⭐ ${anime.score ?? 'N/A'}</div>
    </div>
  `;
  // click on card -> open modal
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-btn')) return;
    openDetail(anime);
  });
  // favorite button
  card.querySelector('.favorite-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(anime);
  });
  return card;
}

function renderCarousel(element, data) {
  element.innerHTML = '';
  data.forEach(anime => element.appendChild(createAnimeCard(anime)));
}

// ===== API CALLS =====
async function fetchSection(endpoint, element) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const json = await res.json();
    renderCarousel(element, json.data);
  } catch (err) {
    element.innerHTML = `<p class="error">Error loading data</p>`;
    console.error(err);
  }
}

async function loadGenres() {
  try {
    const res = await fetch(`${API_BASE}/genres/anime`);
    const json = await res.json();
    genreList.innerHTML = '';
    json.data.slice(0, 20).forEach(g => {
      const item = document.createElement('div');
      item.className = 'genre-item';
      item.textContent = g.name;
      item.addEventListener('click', () => loadByGenre(g.mal_id));
      genreList.appendChild(item);
    });
  } catch (err) {
    genreList.innerHTML = 'Failed to load genres.';
  }
}

async function loadByGenre(id) {
  try {
    const res = await fetch(`${API_BASE}/anime?genres=${id}&limit=20`);
    const json = await res.json();
    renderCarousel(carousels.genreResults, json.data);
  } catch {
    carousels.genreResults.innerHTML = 'Failed to load.';
  }
}

async function loadHero() {
  try {
    const res = await fetch(`${API_BASE}/top/anime?limit=5`);
    const json = await res.json();
    const pick = json.data[Math.floor(Math.random() * json.data.length)];
    heroImage.style.backgroundImage = `url(${pick.images.jpg.large_image_url})`;
  } catch {
    heroImage.style.background = '#222';
  }
}

// ===== DETAILS MODAL =====
function openDetail(anime) {
  modalBody.innerHTML = `
    <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
    <h2>${anime.title}</h2>
    <p><strong>Score:</strong> ${anime.score ?? 'N/A'}</p>
    <p><strong>Episodes:</strong> ${anime.episodes ?? 'Unknown'}</p>
    <p><strong>Status:</strong> ${anime.status}</p>
    <p><strong>Synopsis:</strong> ${anime.synopsis ?? 'No synopsis available.'}</p>
    <a href="https://myanimelist.net/anime/${anime.mal_id}" target="_blank" style="color:#ff66b2;">View on MyAnimeList →</a>
  `;
  detailModal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => detailModal.classList.add('hidden'));
detailModal.addEventListener('click', e => {
  if (e.target === detailModal) detailModal.classList.add('hidden');
});

// ===== FAVORITES =====
function toggleFavorite(anime) {
  if (!currentUser) return alert('Sign in to add favorites');
  if (!favorites[currentUser]) favorites[currentUser] = [];
  const list = favorites[currentUser];
  const exists = list.find(a => a.mal_id === anime.mal_id);
  if (exists) {
    favorites[currentUser] = list.filter(a => a.mal_id !== anime.mal_id);
  } else {
    list.push(anime);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert(exists ? 'Removed from favorites' : 'Added to favorites');
}

function renderFavorites() {
  const favList = document.getElementById('favList');
  favList.innerHTML = '';
  const list = favorites[currentUser] || [];
  if (!list.length) {
    favList.textContent = 'No favorites yet.';
    return;
  }
  list.forEach(anime => favList.appendChild(createAnimeCard(anime)));
}

// ===== LOGIN / LOGOUT =====
const userDropdown = document.getElementById('userDropdown');
const userBtn = document.getElementById('userBtn');
const openLogin = document.getElementById('openLogin');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginSubmit = document.getElementById('loginSubmit');
const loginName = document.getElementById('loginName');
const logoutBtn = document.getElementById('logout');
const userNameDisplay = document.getElementById('userNameDisplay');
const favModal = document.getElementById('favModal');
const viewFavorites = document.getElementById('viewFavorites');
const closeFav = document.getElementById('closeFav');

userBtn.addEventListener('click', () => {
  userDropdown.classList.toggle('hidden');
});

openLogin.addEventListener('click', () => {
  userDropdown.classList.add('hidden');
  loginModal.classList.remove('hidden');
});

closeLogin.addEventListener('click', () => loginModal.classList.add('hidden'));
loginModal.addEventListener('click', e => {
  if (e.target === loginModal) loginModal.classList.add('hidden');
});

loginSubmit.addEventListener('click', () => {
  const name = loginName.value.trim();
  if (!name) return;
  currentUser = name;
  localStorage.setItem('animeUser', name);
  userNameDisplay.textContent = name;
  logoutBtn.classList.remove('hidden');
  loginModal.classList.add('hidden');
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('animeUser');
  currentUser = null;
  userNameDisplay.textContent = 'Not signed in';
  logoutBtn.classList.add('hidden');
});

viewFavorites.addEventListener('click', () => {
  if (!currentUser) return alert('Sign in first.');
  favModal.classList.remove('hidden');
  renderFavorites();
});

closeFav.addEventListener('click', () => favModal.classList.add('hidden'));
favModal.addEventListener('click', e => {
  if (e.target === favModal) favModal.classList.add('hidden');
});

// ===== SEARCH =====
let searchTimeout;
globalSearch.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  clearTimeout(searchTimeout);
  if (query.length < 3) return;
  searchTimeout = setTimeout(() => searchAnime(query), 400);
});

async function searchAnime(q) {
  try {
    const res = await fetch(`${API_BASE}/anime?q=${encodeURIComponent(q)}&limit=20`);
    const json = await res.json();
    renderCarousel(carousels.top, json.data);
  } catch {
    carousels.top.innerHTML = 'Search failed.';
  }
}

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
let darkMode = true;
themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? '#0c0c0c' : '#fff';
  document.body.style.color = darkMode ? '#fff' : '#000';
});

// ===== HERO BUTTONS =====
heroExplore.addEventListener('click', () => {
  document.getElementById('section-top').scrollIntoView({ behavior: 'smooth' });
});
heroAiring.addEventListener('click', () => {
  document.getElementById('section-airing').scrollIntoView({ behavior: 'smooth' });
});

// ===== INITIAL LOAD =====
window.addEventListener('load', () => {
  fetchSection('/top/anime?limit=20', carousels.top);
  fetchSection('/top/anime?filter=airing&limit=20', carousels.airing);
  fetchSection('/top/anime?filter=upcoming&limit=20', carousels.upcoming);
  loadGenres();
  loadHero();
  if (currentUser) {
    userNameDisplay.textContent = currentUser;
    logoutBtn.classList.remove('hidden');
  }
});
