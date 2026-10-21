export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { id, season } = req.query;

    if (!id || season === undefined) {
        return res.status(400).json({ error: "Show ID and Season number are required" });
    }

    const url = `https://api.themoviedb.org/3/tv/${id}/season/${season}?language=en-US`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            return res.status(response.status).json({ error: "Season not found", episodes: [] });
        }

        const data = await response.json();
        const cleanEpisodes = (data.episodes || []).map(e => ({
            id: e.id,
            episode_number: e.episode_number,
            name: e.name || `Episode ${e.episode_number}`,
            overview: e.overview || 'No description available.',
            runtime: e.runtime || null,
            air_date: e.air_date || '',
            still_path: e.still_path ? `https://image.tmdb.org/t/p/w300${e.still_path}` : null,
            vote_average: typeof e.vote_average === 'number' ? Number(e.vote_average.toFixed(1)) : null
        }));

        res.status(200).json({
            season_number: data.season_number,
            name: data.name,
            episodes: cleanEpisodes
        });
    } catch (error) {
        console.error('getEpisodes error:', error);
        res.status(500).json({ error: "Failed to fetch episodes", episodes: [] });
    }
}
