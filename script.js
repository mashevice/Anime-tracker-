const API_BASE = 'https://api.jikan.moe/v4';
const container = document.getElementById('episodes-container');

async function fetchUpcomingEpisodes() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=20');
        const data = await response.json();
        
        if (!data.data) throw new Error('No data received');
        
        container.innerHTML = ''; // Clear loading
        
        data.data.forEach(anime => {
            if (anime.status === "Currently Airing") {
                const nextEpisode = anime.episodes_aired + 1;
                const card = document.createElement('div');
                card.className = 'episode-card';
                card.innerHTML = `
                    <h3>${anime.title}</h3>
                    <p><strong>Next Episode:</strong> ${nextEpisode}</p>
                    <p><strong>Air Date:</strong> ${anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : 'TBA'}</p>
                    <p>${anime.synopsis ? anime.synopsis.substring(0, 150) + '...' : 'No synopsis available.'}</p>
                `;
                container.appendChild(card);
            }
        });
        
        if (container.children.length === 0) {
            container.innerHTML = '<p class="error">No upcoming episodes found.</p>';
        }
    } catch (error) {
        container.innerHTML = `<p class="error">Error fetching data: ${error.message}</p>`;
    }
}

window.addEventListener('load', fetchUpcomingEpisodes);
