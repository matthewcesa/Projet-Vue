// On appelle une API de vrais films
const API_KEY = 'a4cf495cd7d5e12a3c2947f6ac0fd4c9';
const BASE_URL = 'https://api.themoviedb.org/3';

function mapMovie(movie) {
    const genreIds = movie.genre_ids || [];

    return {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x400?text=Pas+d%27affiche',
        year: movie.release_date ? movie.release_date.split('-')[0] : 'Inconnue',
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : '0.0',
        genreIds,
        genre: genreIdToString(genreIds[0])
    };
}

function genreIdToString(id) {
    const genres = {
        18: 'Drame',
        35: 'Comédie',
        53: 'Thriller',
        10749: 'Romance',
        99: 'Documentaire',
        16: 'Animation',
        28: 'Action',
        12: 'Aventure'
    };

    return genres[id] || 'Film';
}

export async function getPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=1`);
        const data = await response.json();

        return (data.results || []).map(mapMovie);
    } catch (error) {
        console.error("Erreur API films populaires :", error);
        return [];
    }
}

export async function searchMovies(query) {
    if (!query || query.trim() === '') {
        return [];
}

    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            query: query.trim()
        });
        const response = await fetch(`${BASE_URL}/search/movie?${params}`);
        const data = await response.json();

        return (data.results || []).map(mapMovie);
    } catch (error) {
        console.error('Erreur API de recherche :', error);
        return [];
    }
}