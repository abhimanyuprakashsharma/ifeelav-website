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

        const title = data.title || data.name || data.original_title || data.original_name || 'Title';

        // Extract Trailer
        let trailerKey = null;
        if (data.videos && Array.isArray(data.videos.results)) {
            const officialTrailer = data.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
            const anyTrailer = data.videos.results.find(v => v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Clip'));
            trailerKey = (officialTrailer || anyTrailer)?.key || null;
        }

        // Extract Watch Providers (India first, then US as fallback)
        const providersRaw = data['watch/providers']?.results;
        const regionData = providersRaw?.IN || providersRaw?.US || null;
        const streamingProviders = [];
        const seenProviders = new Set();

        if (regionData) {
            const flatrate = (regionData.flatrate || []).map(p => ({ ...p, tier: 'Subscription' }));
            const free = (regionData.free || []).map(p => ({ ...p, tier: 'Free Stream' }));
            const rent = (regionData.rent || []).map(p => ({ ...p, tier: 'Rent / Buy' }));
            const buy = (regionData.buy || []).map(p => ({ ...p, tier: 'Rent / Buy' }));

            const allStreams = [...free, ...flatrate, ...rent, ...buy];
            for (const p of allStreams) {
                const key = `${p.provider_name.toLowerCase()}`;
                if (!seenProviders.has(key)) {
                    seenProviders.add(key);
                    streamingProviders.push({
                        id: p.provider_id,
                        name: p.provider_name,
                        tier: p.tier || 'Stream',
                        logo_path: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
                        link: regionData.link || `https://www.themoviedb.org/${actualType}/${data.id}/watch`
                    });
                }
            }
        }

        // Free Player Servers Config
        const freeServers = [
            {
                name: 'Server 1 (VidSrc Fast)',
                url: actualType === 'movie' 
                    ? `https://vidsrc.cc/v2/embed/movie/${data.id}` 
                    : `https://vidsrc.cc/v2/embed/tv/${data.id}/{season}/{episode}`
            },
            {
                name: 'Server 2 (VidSrc Pro)',
                url: actualType === 'movie' 
                    ? `https://vidsrc.to/embed/movie/${data.id}` 
                    : `https://vidsrc.to/embed/tv/${data.id}/{season}/{episode}`
            },
            {
                name: 'Server 3 (Embed.su HD)',
                url: actualType === 'movie' 
                    ? `https://embed.su/embed/movie/${data.id}` 
                    : `https://embed.su/embed/tv/${data.id}/{season}/{episode}`
            },
            {
                name: 'Server 4 (SuperEmbed)',
                url: actualType === 'movie'
                    ? `https://multiembed.mov/?video_id=${data.id}&tmdb=1`
                    : `https://multiembed.mov/?video_id=${data.id}&tmdb=1&s={season}&e={episode}`
            }
        ];

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
            title: title,
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
            youtube_search_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' full movie')}`,
            streaming_providers: streamingProviders,
            free_servers: freeServers,
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
