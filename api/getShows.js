export default async function handler(req, res) {
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';
    const { genre, query, lang } = req.query;

    try {
        let url;
        if (query) {
            url = `https://api.themoviedb.org/3/search/tv?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
        } else {
            // --- SMART LOGIC FOR BOLLYWOOD ---
            let maxPage = 20;
            let voteCount = 50; // Standard strictness
            let sort = "popularity.desc";

            // Agar Bollywood (Hi) hai, toh filter thoda loose karo taaki content dikhe
            if (lang === 'hi') {
                maxPage = 5;       // Kam pages dhoondo
                voteCount = 2;     // Kam votes wale bhi chalenge (Action movies ke liye zaroori)
            } else if (lang === 'ja' || lang === 'ko') {
                maxPage = 3;
            }

            const randomPage = Math.floor(Math.random() * maxPage) + 1;

            // Date filter hata diya hai taaki purani classic movies bhi aayein
            url = `https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=${sort}&vote_count.gte=${voteCount}&include_null_first_air_dates=false&page=${randomPage}`;
            
            if (genre) url += `&with_genres=${genre}`;
            if (lang) url += `&with_original_language=${lang}`;
            if (lang === 'ja') url += `&with_genres=16`; 
        }

        const options = {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${BEARER_TOKEN}` }
        };

        let response = await fetch(url, options);
        let data = await response.json();
        
        // Backup Plan: Agar result zero hai, toh bina page number ke try karo (Page 1)
        if (!data.results || data.results.length === 0) {
            const fallbackUrl = url.replace(/&page=\d+/, '&page=1');
            response = await fetch(fallbackUrl, options);
            data = await response.json();
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
