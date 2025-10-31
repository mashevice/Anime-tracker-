async function loadAnime() {
  const animeList = document.getElementById('anime-list');
  animeList.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

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
  } catch (error) {
    console.error(error);
    animeList.innerHTML = `<p style="color:red;">Failed to load anime. Try refreshing.</p>`;
  }
}

loadAnime();
