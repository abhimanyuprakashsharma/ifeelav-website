export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { genre, query, lang, type, category, page = 1 } = req.query;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    try {
        let url;
        let inferredType = type || (lang === 'hi' ? 'movie' : 'tv');

        if (query && query.trim() !== '') {
            // Multi Search (Movies + TV)
            url = `https://api.themoviedb.org/3/search/multi?language=en-US&page=${page}&query=${encodeURIComponent(query.trim())}&include_adult=false`;
        } else if (category === 'trending') {
            // Trending All (Today)
            url = `https://api.themoviedb.org/3/trending/all/day?language=en-US&page=${page}`;
        } else {
            // Discover Mode
            let endpoint = inferredType;
            let sortBy = 'popularity.desc';
            let minVotes = endpoint === 'movie' ? (lang === 'hi' ? 10 : 150) : 100;

            url = `https://api.themoviedb.org/3/discover/${endpoint}?language=en-US&sort_by=${sortBy}&vote_count.gte=${minVotes}&include_null_first_air_dates=false&page=${page}`;

            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            if (lang === 'ja' && endpoint === 'tv') url += `&with_genres=16`;
        }

        let response = await fetch(url, options);
        let data = await response.json();

        // Fallback if empty
        if ((!data.results || data.results.length === 0) && !query && category !== 'trending') {
            const fallbackUrl = `https://api.themoviedb.org/3/discover/${inferredType}?language=en-US&sort_by=popularity.desc&page=1`;
            response = await fetch(fallbackUrl, options);
            data = await response.json();
        }

        // Clean & Normalize results
        const cleanedResults = (data.results || [])
            .filter(item => {
                // Remove people/actors and items without poster/backdrop
                if (item.media_type === 'person') return false;
                return Boolean(item.poster_path || item.backdrop_path);
            })
            .map(item => {
                const itemMediaType = item.media_type || inferredType || (item.title ? 'movie' : 'tv');
                return {
                    id: item.id,
                    title: item.title || item.name || item.original_title || item.original_name,
                    overview: item.overview,
                    poster_path: item.poster_path,
                    backdrop_path: item.backdrop_path,
                    vote_average: typeof item.vote_average === 'number' ? Number(item.vote_average.toFixed(1)) : 0,
                    vote_count: item.vote_count,
                    release_date: item.release_date || item.first_air_date || '',
                    media_type: itemMediaType,
                    genre_ids: item.genre_ids || []
                };
            });

        res.status(200).json({
            page: data.page || 1,
            total_pages: data.total_pages || 1,
            total_results: cleanedResults.length,
            results: cleanedResults
        });
    } catch (error) {
        console.error('getShows error:', error);
        res.status(500).json({ error: "Failed to fetch shows", results: [] });
    }
}
