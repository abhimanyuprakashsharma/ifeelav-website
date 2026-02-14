export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { genre, query, lang } = req.query;

    try {
        let url;
        if (query) {
            // Search: Prioritize Indian/New content logic not directly possible in search query, 
            // but we fetch results and frontend can sort. 
            url = `https://api.themoviedb.org/3/search/tv?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
        } else {
            // --- SMART RANDOM LOGIC ---
            // Bollywood/Indian content ke liye safe zone (Page 1-3 only)
            // Hollywood ke liye wide range (Page 1-20)
            let maxPage = 20;
            let sort = "popularity.desc";
            
            if (lang === 'hi' || lang === 'ko' || lang === 'ja') {
                maxPage = 3; 
            }
            
            const randomPage = Math.floor(Math.random() * maxPage) + 1;

            url = `https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=${sort}&first_air_date.gte=2015-01-01&vote_count.gte=10&include_null_first_air_dates=false&page=${randomPage}`;
            
            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            // Anime fix
            if (lang === 'ja') url += `&with_genres=16`; 
            // Bollywood bias: If lang is hindi, ensure region IN is prioritized implicitly by language
        }

        const options = {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${BEARER_TOKEN}` }
        };

        let response = await fetch(url, options);
        let data = await response.json();
        
        // --- FAILSAFE (Blank Page Fix) ---
        // Agar random page khali aaya, toh Page 1 manga lo (Backup)
        if (!data.results || data.results.length === 0) {
            console.log("Empty page found, switching to Page 1 backup...");
            const fallbackUrl = url.replace(/&page=\d+/, '&page=1');
            response = await fetch(fallbackUrl, options);
            data = await response.json();
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
