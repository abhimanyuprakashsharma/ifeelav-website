export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';

    const { genre, query, lang } = req.query;

    let url;
    if (query) {
        // Search me random nahi chahiye, accurate chahiye
        url = `https://api.themoviedb.org/3/search/tv?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
    } else {
        // --- RANDOM LOGIC ADDED HERE ---
        // 1 se 15 ke beech koi bhi random page number chun lo
        const randomPage = Math.floor(Math.random() * 15) + 1;

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

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Kabhi kabhi random page khali aa sakta hai, to safety check
        if (!response.ok) return res.status(response.status).json(data);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
