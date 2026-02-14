export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { genre, query, lang, type } = req.query;

    try {
        let url;
        if (query) {
            // Search Mode
            url = `https://api.themoviedb.org/3/search/multi?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
        } else {
            // --- QUALITY CONTROL LOGIC ---
            // Ab hum 'vote_average.desc' use karenge taaki high rated content pehle aaye
            let sort = "vote_average.desc"; 
            let endpoint = type || 'tv'; // Default TV
            let minVotes = 300; // Kam se kam 300 logo ne vote kiya ho (Kachra hatane ke liye)
            
            // BOLLYWOOD: Movies dikhao
            if (lang === 'hi') {
                endpoint = 'movie'; 
                minVotes = 50; // Bollywood ke liye thoda kam threshold
            } else if (endpoint === 'movie') {
                minVotes = 500; // Hollywood movies ke liye high threshold
            }

            // Page 1 se 5 ke beech hi raho (Best content shuru me hota hai)
            let page = Math.floor(Math.random() * 3) + 1; 

            url = `https://api.themoviedb.org/3/discover/${endpoint}?language=en-US&sort_by=${sort}&vote_count.gte=${minVotes}&include_null_first_air_dates=false&page=${page}`;
            
            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            if (lang === 'ja' && endpoint === 'tv') url += `&with_genres=16`; 
        }

        const options = {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${BEARER_TOKEN}` }
        };

        let response = await fetch(url, options);
        let data = await response.json();
        
        // Agar high rating wala page khali mila, toh popularity se backup uthao
        if (!data.results || data.results.length === 0) {
            if (!query) {
                const fallbackUrl = url.replace('vote_average.desc', 'popularity.desc').replace(/&page=\d+/, '&page=1');
                response = await fetch(fallbackUrl, options);
                data = await response.json();
            }
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
