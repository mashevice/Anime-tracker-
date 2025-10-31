const API_BASE = "https://api.jikan.moe/v4";

// === Fetch Anime Data === //
async function fetchAnime(endpoint, containerId) {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    const data = await response.json();

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!data.data || data.data.length === 0) {
      container.innerHTML = "<p>No data available right now.</p>";
      return;
    }

    data.data.forEach(anime => {
      const card = document.createElement("div");
      card.classList.add("anime-card");
      card.innerHTML = `
        <img src="${anime.images?.jpg?.image_url || ''}" alt="${anime.title}">
        <h3>${anime.title}</h3>
        <p>⭐ ${anime.score || "N/A"} | 📅 ${anime.year || "Unknown"}</p>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    const container = document.getElementById(containerId);
    container.innerHTML = `<p class="error">Failed to load anime data.</p>`;
  }
}

// === Search Function === //
async function searchAnime(query) {
  const searchBox = document.querySelector(".search-bar");
  const grid = document.getElementById("top-rated");

  if (query.trim() === "") {
    fetchAnime("top/anime?limit=12", "top-rated");
    return;
  }

  grid.innerHTML = "<p>Searching...</p>";
  try {
    const response = await fetch(`${API_BASE}/anime?q=${query}&limit=12`);
    const data = await response.json();

    grid.innerHTML = "";
    if (!data.data || data.data.length === 0) {
      grid.innerHTML = "<p>No results found.</p>";
      return;
    }

    data.data.forEach(anime => {
      const card = document.createElement("div");
      card.classList.add("anime-card");
      card.innerHTML = `
        <img src="${anime.images?.jpg?.image_url || ''}" alt="${anime.title}">
        <h3>${anime.title}</h3>
        <p>⭐ ${anime.score || "N/A"} | ${anime.type || "TV"}</p>
      `;
      grid.appendChild(card);
    });
  } catch (error) {
    grid.innerHTML = "<p>Error fetching search results.</p>";
  }
}

// === Notification Placeholder === //
function showNotification() {
  alert("🔔 New anime updates feature coming soon!");
}

// === Initialize === //
window.addEventListener("DOMContentLoaded", () => {
  // Load main sections
  fetchAnime("top/anime?limit=12", "top-rated");
  fetchAnime("seasons/now?limit=12", "upcoming");

  // Setup event listeners
  document.querySelector(".icon.notification").addEventListener("click", showNotification);
  document.querySelector(".search-bar").addEventListener("keyup", e => {
    if (e.key === "Enter") searchAnime(e.target.value);
  });
});
