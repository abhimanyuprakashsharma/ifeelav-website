export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    
    // 'type' parameter add kiya hai (movie ya tv)
    const { genre, query, lang, type } = req.query;

    try {
        let url;
        if (query) {
            // Search: Multi search (Movies + TV)
            url = `https://api.themoviedb.org/3/search/multi?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
        } else {
            // DISCOVERY LOGIC
            let endpoint = type || 'movie'; // Default movie, but frontend will send 'tv' or 'movie'
            let sort = "popularity.desc";
            
            // Random Page Logic
            let maxPage = 15; 
            if (lang === 'hi') maxPage = 5; // Bollywood content kam hai, safe limit
            
            let page = Math.floor(Math.random() * maxPage) + 1;

            url = `https://api.themoviedb.org/3/discover/${endpoint}?language=en-US&sort_by=${sort}&include_null_first_air_dates=false&page=${page}`;
            
            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            if (lang === 'ja' && endpoint === 'tv') url += `&with_genres=16`; // Anime logic
        }

        const options = {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${BEARER_TOKEN}` }
        };

        let response = await fetch(url, options);
        let data = await response.json();
        
        // FAILSAFE: Agar data nahi mila, to Page 1 try karo
        if (!data.results || data.results.length === 0) {
            if (!query) {
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
