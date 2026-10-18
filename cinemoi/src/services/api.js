// On appelle une API de vrais films
const API_KEY = 'a4cf495cd7d5e12a3c2947f6ac0fd4c9';
const BASE_URL = 'https://api.themoviedb.org/3';

function mapMovie(movie) {
    const genreIds = movie.genre_ids || [];

    // On transforme tous les IDs de genres du film en un tableau de mots (ex: ['Action', 'Science-Fiction'])
    const genresList = genreIds.map(id => genreIdToString(id));

    return {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x400?text=Pas+d%27affiche',
        year: movie.release_date ? movie.release_date.split('-')[0] : 'Inconnue',
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : '0.0',
        genreIds,
        genres: genresList, // Tableau de tous les genres du film
        genre: genresList[0] || 'Film' // Le genre principal pour l'affichage rapide
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

export async function getPopularMovies(page = 1) {
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            page: String(page)
        });
        const response = await fetch(`${BASE_URL}/movie/popular?${params}`);
        const data = await response.json();

        return (data.results || []).map(mapMovie);
    } catch (error) {
        console.error("Erreur API films populaires :", error);
        return [];
    }
}

export async function getTopRatedMovies() {
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            page: '1'
        });
        const response = await fetch(`${BASE_URL}/movie/top_rated?${params}`);
        if (!response.ok) {
            throw new Error(`TMDB a répondu avec le statut ${response.status}`);
        }

        const data = await response.json();
        return (data.results || []).map(mapMovie);
    } catch (error) {
        console.error('Erreur API des films les mieux notés :', error);
        return [];
    }
}

export async function getMoviesByGenre(genreId, page = 1) {
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            with_genres: String(genreId),
            sort_by: 'popularity.desc',
            page: String(page)
        });
        const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
        if (!response.ok) {
            throw new Error(`TMDB a répondu avec le statut ${response.status}`);
        }

        const data = await response.json();
        return {
            movies: (data.results || []).map(mapMovie),
            totalPages: Math.min(data.total_pages || 0, 500)
        };
    } catch (error) {
        console.error('Erreur API des films par genre :', error);
        return { movies: [], totalPages: 0 };
    }
}

export async function searchCatalogue({ query = '', genreId = null, genres = [], page = 1 } = {}) {
    const normalizedQuery = query.trim();
    const normalizedForMatch = normalizedQuery
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('fr-FR');
    const matchingGenre = genres.find(genre => genre.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('fr-FR') === normalizedForMatch);
    const selectedGenres = [genreId, matchingGenre?.id].filter((id, index, ids) =>
        id !== null && id !== undefined && ids.indexOf(id) === index
    );
    const yearMatch = normalizedQuery.match(/\b(18\d{2}|19\d{2}|20\d{2}|2100)\b/);

    try {
        const makeParams = values => new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            page: String(page),
            ...values
        });
        const fetchDiscover = async values => {
            const response = await fetch(`${BASE_URL}/discover/movie?${makeParams(values)}`);
            if (!response.ok) throw new Error(`TMDB a répondu avec le statut ${response.status}`);
            return response.json();
        };

        // Une année et/ou un genre se recherchent directement avec l'endpoint discover.
        if (!normalizedQuery || yearMatch || selectedGenres.length > 0 && matchingGenre) {
            const params = {};
            if (selectedGenres.length) params.with_genres = selectedGenres.join(',');
            if (yearMatch) params.primary_release_year = yearMatch[0];
            if (!selectedGenres.length && !yearMatch) params.sort_by = 'popularity.desc';
            const data = await fetchDiscover(params);
            return {
                movies: (data.results || []).map(mapMovie),
                totalPages: Math.min(data.total_pages || 0, 500)
            };
        }

        // TMDB distingue le texte d'un titre et les personnes: on interroge les deux.
        const queryParams = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            query: normalizedQuery,
            page: String(page)
        });
        const [movieResponse, peopleResponse] = await Promise.all([
            fetch(`${BASE_URL}/search/movie?${queryParams}`),
            fetch(`${BASE_URL}/search/person?${queryParams}`)
        ]);
        if (!movieResponse.ok || !peopleResponse.ok) {
            throw new Error('TMDB n’a pas pu effectuer la recherche.');
        }

        const [movieData, peopleData] = await Promise.all([
            movieResponse.json(),
            peopleResponse.json()
        ]);
        const matchingPerson = peopleData.results?.[0];
        let peopleMovies = [];
        let peopleTotalPages = 0;

        if (matchingPerson) {
            const peopleFilters = { with_people: String(matchingPerson.id) };
            if (selectedGenres.length) peopleFilters.with_genres = selectedGenres.join(',');
            const peopleDataResults = await fetchDiscover(peopleFilters);
            peopleMovies = peopleDataResults.results || [];
            peopleTotalPages = Math.min(peopleDataResults.total_pages || 0, 500);
        }

        const titleMovies = (movieData.results || []).filter(movie =>
            !selectedGenres.length || selectedGenres.every(id => (movie.genre_ids || []).includes(id))
        );
        const mergedMovies = [...titleMovies, ...peopleMovies]
            .filter((movie, index, allMovies) => allMovies.findIndex(item => item.id === movie.id) === index);

        return {
            movies: mergedMovies.map(mapMovie),
            totalPages: Math.min(Math.max(movieData.total_pages || 0, peopleTotalPages), 500)
        };
    } catch (error) {
        console.error('Erreur de recherche dans le catalogue :', error);
        return { movies: [], totalPages: 0, error: error.message };
    }
}

export async function getMovieGenres() {
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR'
        });
        const response = await fetch(`${BASE_URL}/genre/movie/list?${params}`);
        const data = await response.json();

        return data.genres || [];
    } catch (error) {
        console.error('Erreur API des genres :', error);
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

export async function getMovieRecommendations(movieId, genreIds) {
    if (!genreIds?.length) {
        return [];
    }

    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            // Le séparateur | demande les films qui partagent au moins un genre.
            with_genres: genreIds.join('|'),
            sort_by: 'vote_average.desc',
            // Le seuil réduit les recommandations très bien notées mais presque jamais votées.
            'vote_count.gte': '100',
            page: '1'
        });
        const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
        const data = await response.json();

        // On exige au moins un genre partagé et on exclut le film courant.
        return (data.results || [])
            .filter(movie =>
                movie.id !== Number(movieId) &&
                (movie.genre_ids || []).some(genreId => genreIds.includes(genreId))
            )
            // On trie aussi côté client pour que les six suggestions soient bien les mieux notées.
            .sort((first, second) => second.vote_average - first.vote_average)
            .slice(0, 6)
            .map(mapMovie);
    } catch (error) {
        console.error('Erreur API des recommandations :', error);
        return [];
    }
}

// recup les infos avec l'id
export async function getMovieDetails(movieId) {
  try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            language: 'fr-FR',
            append_to_response: 'credits'
        });
        const response = await fetch(`${BASE_URL}/movie/${movieId}?${params}`);
    const data = await response.json();
    
    return {
      id: data.id,
      title: data.title,
            originalTitle: data.original_title,
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://via.placeholder.com/300x400?text=Pas+d%27affiche',
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '',
      year: data.release_date ? data.release_date.split('-')[0] : 'Inconnue',
            releaseDate: data.release_date || 'Date inconnue',
      rating: data.vote_average ? data.vote_average.toFixed(1) : '0.0',
      overview: data.overview || "Aucun synopsis disponible.",
      runtime: data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}min` : 'Durée inconnue',
    runtimeMinutes: data.runtime || null,
    runtimeMinutes: data.runtime || null,
    genreIds: (data.genres || []).map(genre => genre.id),
            genres: data.genres ? data.genres.map(g => g.name).join(', ') : '',
            cast: (data.credits?.cast || []).slice(0, 10).map(person => ({
                id: person.id,
                name: person.name,
                character: person.character,
                profile: person.profile_path
                    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                    : null
            })),
            director: (data.credits?.crew || []).find(person => person.job === 'Director')?.name || ''
    };
  } catch (error) {
    console.error("Erreur API détails du film :", error);
    return null;
  }
}