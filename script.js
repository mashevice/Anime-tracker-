// =============== GLOBALS ===============
const API = "https://api.jikan.moe/v4";
const sections = {
  top: document.getElementById("top-rated-container"),
  airing: document.getElementById("airing-container"),
  upcoming: document.getElementById("upcoming-container"),
};

// =============== FETCH HELPERS ===============
async function fetchAnime(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error: " + res.status);
  const data = await res.json();
  return data.data;
}

function renderAnime(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  list.slice(0, 20).forEach((anime) => {
    const card = document.createElement("div");
    card.className = "anime-card";
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div class="info">
        <h3>${anime.title}</h3>
        <p>${anime.score ? "⭐ " + anime.score : "No rating yet"}</p>
      </div>
    `;
    // click for details modal (simplified)
    card.addEventListener("click", () => showDetails(anime));
    container.appendChild(card);
  });
}

// =============== MODAL HANDLER ===============
const modal = document.getElementById("anime-modal");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

function showDetails(anime) {
  modalContent.innerHTML = `
    <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
    <h2>${anime.title}</h2>
    <p><strong>Type:</strong> ${anime.type || "N/A"}</p>
    <p><strong>Episodes:</strong> ${anime.episodes || "?"}</p>
    <p><strong>Score:</strong> ${anime.score || "N/A"}</p>
    <p><strong>Genres:</strong> ${
      anime.genres?.map((g) => g.name).join(", ") || "Unknown"
    }</p>
    <p>${anime.synopsis || "No synopsis available."}</p>
  `;
  modal.classList.add("show");
}

if (modalClose) {
  modalClose.addEventListener("click", () => {
    modal.classList.remove("show");
  });
}

// =============== NAVBAR SCROLL (Desktop + Touch) ===============
const navLinks = document.querySelector(".nav-links");
if (navLinks) {
  let isDown = false;
  let startX, scrollLeft;

  // desktop drag
  navLinks.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - navLinks.offsetLeft;
    scrollLeft = navLinks.scrollLeft;
  });
  navLinks.addEventListener("mouseleave", () => (isDown = false));
  navLinks.addEventListener("mouseup", () => (isDown = false));
  navLinks.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - navLinks.offsetLeft;
    navLinks.scrollLeft = scrollLeft - (x - startX) * 2;
  });

  // mobile swipe
  navLinks.addEventListener("touchstart", (e) => {
    startX = e.touches[0].pageX - navLinks.offsetLeft;
    scrollLeft = navLinks.scrollLeft;
  });
  navLinks.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX - navLinks.offsetLeft;
    navLinks.scrollLeft = scrollLeft - (x - startX) * 2;
  });
}

// =============== LOAD ALL SECTIONS ===============
async function init() {
  try {
    const [top, airing, upcoming] = await Promise.all([
      fetchAnime(`${API}/top/anime`),
      fetchAnime(`${API}/seasons/now`),
      fetchAnime(`${API}/seasons/upcoming`),
    ]);
    renderAnime(top, "top-rated-container");
    renderAnime(airing, "airing-container");
    renderAnime(upcoming, "upcoming-container");
  } catch (err) {
    console.error("Failed to load anime:", err);
    Object.values(sections).forEach((el) => {
      el.innerHTML =
        "<p class='error'>⚠️ Failed to load data. Please retry later.</p>";
    });
  }
}

window.addEventListener("load", init);
