export default async function handler(req, res) {
    // Ye rahi tumhari powerful VIP Key (Bearer Token)
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';

    const { genre, query } = req.query;

    let url;
    // URL ab saaf hai, kyunki key headers me jayegi
    if (query) {
        // Search Mode
        url = `https://api.themoviedb.org/3/search/tv?language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
    } else {
        // Discovery Mode (Swipe)
        url = `https://api.themoviedb.org/3/discover/tv?language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&with_genres=${genre}&vote_count.gte=50&include_null_first_air_dates=false`;
    }

    // Ye "headers" ka tarika sabse secure aur pakka hai
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
        
        // Agar koi error aaya to dikha dega
        if (!response.ok) {
            return res.status(response.status).json({ error: "TMDB API Error", details: data });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error: Fetch Failed" });
    }
}
