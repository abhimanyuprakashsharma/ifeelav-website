export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { genre, query, lang } = req.query;

    try {
        let url;
        if (query) {
            // Search Update: Include adult false, but sort isn't supported in search directly.
            // We rely on TMDB relevance.
            url = `https://api.themoviedb.org/3/search/multi?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
        } else {
            // --- SMART DISCOVER LOGIC ---
            let sort = "popularity.desc";
            let voteCount = 50;
            let page = Math.floor(Math.random() * 10) + 1;

            // Bollywood Fix: Filters hata diye taaki content dikhe
            if (lang === 'hi') {
                voteCount = 0; // Show everything
                page = Math.floor(Math.random() * 3) + 1; // Safe pages
            }

            url = `https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=${sort}&vote_count.gte=${voteCount}&include_null_first_air_dates=false&page=${page}`;
            
            // Movies vs TV logic handled by frontend usually, but here we prioritize TV discovery
            // If genre implies movies (like Action 28 is movie, 10759 is TV Action), handle gracefully
            
            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            if (lang === 'ja') url += `&with_genres=16`; // Anime
        }

        const options = {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${BEARER_TOKEN}` }
        };

        let response = await fetch(url, options);
        let data = await response.json();
        
        // FAILSAFE: Agar result khali hai, toh Page 1 se uthao
        if (!data.results || data.results.length === 0) {
            if(!query) {
                const fallbackUrl = url.replace(/&page=\d+/, '&page=1');
                response = await fetch(fallbackUrl, options);
                data = await response.json();
            }
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
