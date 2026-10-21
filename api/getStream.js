export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY || 'btDHGeF3hPorU1ZDAJ1LTjI9qSYkzXNsfzMust3H';
    const { tmdb_id, type = 'tv' } = req.query;

    if (!tmdb_id) {
        return res.status(400).json({ error: "TMDB ID required" });
    }

    const endpointType = type === 'movie' ? 'movie' : 'tv';
    const sources = [];
    const seen = new Set();

    // 1. First Priority: TMDB Watch Providers (Fast, highly accurate for Indian platforms like JioCinema, Hotstar, Prime)
    try {
        const tmdbUrl = `https://api.themoviedb.org/3/${endpointType}/${tmdb_id}/watch/providers`;
        const tmdbRes = await fetch(tmdbUrl, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_BEARER_TOKEN}`
            }
        });

        if (tmdbRes.ok) {
            const tmdbData = await tmdbRes.json();
            const region = tmdbData.results?.IN || tmdbData.results?.US;
            if (region) {
                const combined = [
                    ...(region.flatrate || []),
                    ...(region.rent || []),
                    ...(region.buy || [])
                ];

                for (const item of combined) {
                    if (!seen.has(item.provider_name.toLowerCase())) {
                        seen.add(item.provider_name.toLowerCase());
                        sources.push({
                            name: item.provider_name,
                            url: region.link || '',
                            logo: item.logo_path ? `https://image.tmdb.org/t/p/w92${item.logo_path}` : null,
                            type: region.flatrate?.includes(item) ? 'Subscription' : 'Rent/Buy'
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error('TMDB providers fetch error:', e);
    }

    // 2. Second Priority: Watchmode API (if TMDB returned no providers)
    if (sources.length === 0 && WATCHMODE_API_KEY) {
        try {
            const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=tmdb_id&search_value=${tmdb_id}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.title_results && searchData.title_results.length > 0) {
                const watchmodeId = searchData.title_results[0].id;
                const sourceUrl = `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=IN`;
                const sourceRes = await fetch(sourceUrl);
                const sourceData = await sourceRes.json();

                if (Array.isArray(sourceData)) {
                    for (const item of sourceData) {
                        if (!seen.has(item.name.toLowerCase())) {
                            seen.add(item.name.toLowerCase());
                            sources.push({
                                name: item.name,
                                url: item.web_url || '',
                                logo: null,
                                type: item.type || 'Stream'
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Watchmode error:', error);
        }
    }

    res.status(200).json({ sources });
}
