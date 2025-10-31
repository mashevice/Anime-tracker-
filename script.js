async function loadAnime() {
  const response = await fetch('https://api.jikan.moe/v4/top/anime');
  const data = await response.json();

  const animeList = document.getElementById('anime-list');
  animeList.innerHTML = '';

  data.data.forEach(anime => {
    const card = document.createElement('div');
    card.classList.add('anime-card');
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <h3>${anime.title}</h3>
      <p>⭐ ${anime.score || 'N/A'}</p>
    `;
    animeList.appendChild(card);
  });
}

loadAnime();
