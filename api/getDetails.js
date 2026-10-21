export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { id, type } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Media ID is required" });
    }

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    const append = 'credits,images,external_ids,videos,recommendations,similar,watch/providers';

    try {
        let actualType = type === 'movie' ? 'movie' : (type === 'tv' ? 'tv' : null);
        let data = null;

        if (actualType) {
            const url = `https://api.themoviedb.org/3/${actualType}/${id}?language=en-US&append_to_response=${append}`;
            const response = await fetch(url, options);
            if (response.ok) {
                data = await response.json();
            }
        }

        // Auto-detect fallback if type was wrong or omitted
        if (!data) {
            const candidateTypes = actualType === 'movie' ? ['tv'] : ['tv', 'movie'];
            for (const candidate of candidateTypes) {
                const url = `https://api.themoviedb.org/3/${candidate}/${id}?language=en-US&append_to_response=${append}`;
                const response = await fetch(url, options);
                if (response.ok) {
                    data = await response.json();
                    actualType = candidate;
                    break;
                }
            }
        }

        if (!data) {
            return res.status(404).json({ error: "Show or Movie not found" });
        }

        // Extract Trailer
        let trailerKey = null;
        if (data.videos && Array.isArray(data.videos.results)) {
            const officialTrailer = data.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
            const anyTrailer = data.videos.results.find(v => v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Clip'));
            trailerKey = (officialTrailer || anyTrailer)?.key || null;
        }

        // Extract Watch Providers (India first, then US)
        const providersRaw = data['watch/providers']?.results;
        const regionData = providersRaw?.IN || providersRaw?.US || null;
        const streamingProviders = [];
        const seenProviders = new Set();

        if (regionData) {
            const streams = [...(regionData.flatrate || []), ...(regionData.rent || []), ...(regionData.buy || [])];
            for (const p of streams) {
                if (!seenProviders.has(p.provider_name)) {
                    seenProviders.add(p.provider_name);
                    streamingProviders.push({
                        id: p.provider_id,
                        name: p.provider_name,
                        logo_path: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
                        link: regionData.link || ''
                    });
                }
            }
        }

        // Extract Cast
        const topCast = (data.credits?.cast || []).slice(0, 12).map(c => ({
            id: c.id,
            name: c.name,
            character: c.character,
            profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
        }));

        // Extract Director or Creator
        let directorOrCreator = '';
        if (actualType === 'movie') {
            const director = data.credits?.crew?.find(c => c.job === 'Director');
            directorOrCreator = director ? director.name : '';
        } else {
            directorOrCreator = (data.created_by || []).map(c => c.name).join(', ');
        }

        // Extract Recommendations
        const recs = (data.recommendations?.results || data.similar?.results || [])
            .filter(r => r.poster_path)
            .slice(0, 8)
            .map(r => ({
                id: r.id,
                title: r.title || r.name,
                poster_path: r.poster_path,
                vote_average: typeof r.vote_average === 'number' ? Number(r.vote_average.toFixed(1)) : 0,
                media_type: r.media_type || actualType
            }));

        const cleanResponse = {
            id: data.id,
            media_type: actualType,
            title: data.title || data.name || data.original_title || data.original_name,
            tagline: data.tagline || '',
            overview: data.overview || 'No description available.',
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            vote_average: typeof data.vote_average === 'number' ? Number(data.vote_average.toFixed(1)) : 0,
            vote_count: data.vote_count,
            release_date: data.release_date || data.first_air_date || '',
            status: data.status || '',
            genres: data.genres || [],
            runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
            number_of_seasons: data.number_of_seasons || (data.seasons ? data.seasons.length : 0),
            number_of_episodes: data.number_of_episodes || 0,
            director: directorOrCreator,
            trailer_key: trailerKey,
            streaming_providers: streamingProviders,
            cast: topCast,
            seasons: (data.seasons || []).filter(s => s.season_number > 0).map(s => ({
                id: s.id,
                name: s.name,
                season_number: s.season_number,
                episode_count: s.episode_count,
                poster_path: s.poster_path
            })),
            recommendations: recs
        };

        res.status(200).json(cleanResponse);
    } catch (error) {
        console.error('getDetails error:', error);
        res.status(500).json({ error: "Failed to fetch details" });
    }
}
