const API_URL = "https://api.jikan.moe/v4";

// Elements
const contentDiv = document.getElementById("content");
const sectionTitle = document.getElementById("sectionTitle");
const searchInput = document.getElementById("searchInput");

// Navbar buttons
const airingBtn = document.getElementById("airingBtn");
const upcomingBtn = document.getElementById("upcomingBtn");
const topBtn = document.getElementById("topBtn");
const genreBtn = document.getElementById("genreBtn");
const reviewsBtn = document.getElementById("reviewsBtn");

// ====== EVENT LISTENERS ======
airingBtn.addEventListener("click", () => fetchAnime("airing"));
upcomingBtn.addEventListener("click", () => fetchAnime("upcoming"));
topBtn.addEventListener("click", () => fetchAnime("top"));
genreBtn.addEventListener("click", () => fetchGenres());
reviewsBtn.addEventListener("click", () => fetchReviews());
searchInput.addEventListener("input", searchAnime);

// ====== FUNCTIONS ======
async function fetchAnime(type) {
  sectionTitle.textContent =
    type === "airing"
      ? "Airing Anime"
      : type === "upcoming"
      ? "Upcoming Anime"
      : "Top Rated Anime";

  contentDiv.innerHTML = "<p>Loading...</p>";

  try {
    const url =
      type === "top"
        ? `${API_URL}/top/anime`
        : `${API_URL}/seasons/${type}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data) throw new Error("No data found");

    displayAnime(data.data);
  } catch (err) {
    contentDiv.innerHTML = `<p>Error loading data 😭</p>`;
    console.error(err);
  }
}

function displayAnime(animeList) {
  contentDiv.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "grid";

  animeList.forEach((anime) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <h3>${anime.title}</h3>
      <p style="padding: 0 8px;">⭐ ${anime.score || "N/A"}</p>
    `;

    grid.appendChild(card);
  });

  contentDiv.appendChild(grid);
}

// ====== SEARCH ======
async function searchAnime() {
  const query = searchInput.value.trim();
  if (query.length < 3) return; // wait until user types 3+ chars
  sectionTitle.textContent = `Search Results for "${query}"`;
  contentDiv.innerHTML = "<p>Searching...</p>";

  try {
    const res = await fetch(`${API_URL}/anime?q=${query}&limit=20`);
    const data = await res.json();

    if (!data.data.length) {
      contentDiv.innerHTML = "<p>No anime found 😞</p>";
      return;
    }

    displayAnime(data.data);
  } catch (err) {
    console.error(err);
    contentDiv.innerHTML = "<p>Search failed 😭</p>";
  }
}

// ====== GENRES ======
async function fetchGenres() {
  sectionTitle.textContent = "Genres";
  contentDiv.innerHTML = "<p>Loading genres...</p>";

  try {
    const res = await fetch(`${API_URL}/genres/anime`);
    const data = await res.json();
    const genres = data.data;

    const div = document.createElement("div");
    div.className = "genre-list";

    genres.forEach((g) => {
      const btn = document.createElement("button");
      btn.className = "genre-btn";
      btn.textContent = g.name;
      btn.onclick = () => fetchAnimeByGenre(g.mal_id);
      div.appendChild(btn);
    });

    contentDiv.innerHTML = "";
    contentDiv.appendChild(div);
  } catch (err) {
    contentDiv.innerHTML = "<p>Failed to load genres 😭</p>";
  }
}

async function fetchAnimeByGenre(id) {
  sectionTitle.textContent = "Genre Results";
  contentDiv.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`${API_URL}/anime?genres=${id}&limit=20`);
    const data = await res.json();
    displayAnime(data.data);
  } catch (err) {
    contentDiv.innerHTML = "<p>Error loading genre data 😭</p>";
  }
}

// ====== REVIEWS ======
async function fetchReviews() {
  sectionTitle.textContent = "Recent Reviews";
  contentDiv.innerHTML = "<p>Loading reviews...</p>";

  try {
    const res = await fetch(`${API_URL}/reviews/anime`);
    const data = await res.json();

    const reviews = data.data.slice(0, 10);
    const list = document.createElement("div");
    list.className = "reviews-list";

    reviews.forEach((review) => {
      const div = document.createElement("div");
      div.className = "review";
      div.innerHTML = `
        <h3>${review.entry.title}</h3>
        <p>${review.review.substring(0, 150)}...</p>
        <p><strong>Score:</strong> ${review.score}</p>
      `;
      list.appendChild(div);
    });

    contentDiv.innerHTML = "";
    contentDiv.appendChild(list);
  } catch (err) {
    contentDiv.innerHTML = "<p>Failed to load reviews 😭</p>";
  }
}

// ====== DEFAULT ======
fetchAnime("airing");
