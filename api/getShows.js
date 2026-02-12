export default async function handler(req, res) {
    const API_KEY = 'E4c152ec5e6b03175865d3ce2f0febea';
    const { genre, query } = req.query;

    if (!API_KEY) return res.status(500).json({ error: "API Key Missing" });

    let url;
    if (query) {
        // Search Mode
        url = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=en-US&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
    } else {
        // Discovery Mode
        url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date.gte=2023-01-01&with_genres=${genre}&vote_count.gte=50&include_null_first_air_dates=false`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
