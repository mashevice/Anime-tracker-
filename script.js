const container = document.getElementById('anime-container');
const searchBox = document.getElementById('searchBox');

async function fetchAnime(query = "one piece") {
    container.innerHTML = "<p>Loading...</p>";
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=12`);
    const data = await response.json();

    container.innerHTML = "";
    data.data.forEach(anime => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
            <h3>${anime.title}</h3>
            <p>Score: ${anime.score || 'N/A'}</p>
            <p>${anime.synopsis ? anime.synopsis.substring(0, 100) + '...' : ''}</p>
        `;
        container.appendChild(card);
    });
}

searchBox.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length > 2) fetchAnime(value);
});

fetchAnime();
