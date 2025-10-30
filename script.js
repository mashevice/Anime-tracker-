const container = document.getElementById('episodes-container');

async function fetchAiringAnime() {
  try {
    const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=20');
    const data = await response.json();

    container.innerHTML = ''; // clear "Loading..."

    data.data.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'episode-card';
      card.innerHTML = `
        <h3>${anime.title}</h3>
        <p><strong>Episodes Aired:</strong> ${anime.episodes_aired ?? 'Unknown'}</p>
        <p><strong>Rank:</strong> ${anime.rank ?? 'N/A'}</p>
        <p>${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'No synopsis available.'}</p>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

window.addEventListener('load', fetchAiringAnime);