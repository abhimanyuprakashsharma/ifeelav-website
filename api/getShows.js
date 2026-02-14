export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';

    const { genre, query, lang } = req.query;

    try {
        let url;
        if (query) {
            // Search Mode
            url = `https://api.themoviedb.org/3/search/tv?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
        } else {
            // --- SMART RANDOM LOGIC ---
            // English content bahut sara hai -> Page 1 to 20 random
            // Bollywood/Anime kam hai -> Sirf Page 1 to 3 random (Safe Zone)
            let maxPage = 20;
            if (lang && lang !== 'en') {
                maxPage = 3; 
            }
            
            const randomPage = Math.floor(Math.random() * maxPage) + 1;

            url = `https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=popularity.desc&first_air_date.gte=2010-01-01&vote_count.gte=50&include_null_first_air_dates=false&page=${randomPage}`;
            
            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            if (lang === 'ja') url += `&with_genres=16`; 
        }

        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${BEARER_TOKEN}`
            }
        };

        let response = await fetch(url, options);
        let data = await response.json();
        
        // --- FAILSAFE (Magic Trick) ---
        // Agar Random Page khali nikla (Results 0 aaye), toh turant Page 1 mangwa lo
        // Isse user ko kabhi "End of list" nahi dikhega
        if (data.results && data.results.length === 0 && !query) {
            console.log("Random page empty, fetching Page 1...");
            // URL me page number badal kar 1 kar do
            const fallbackUrl = url.replace(/&page=\d+/, '&page=1');
            response = await fetch(fallbackUrl, options);
            data = await response.json();
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
