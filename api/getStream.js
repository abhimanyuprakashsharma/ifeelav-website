export default async function handler(req, res) {
    const API_KEY = 'btDHGeF3hPorU1ZDAJ1LTjI9qSYkzXNsfzMust3H';
    const { tmdb_id, type } = req.query; 

    if (!tmdb_id) return res.status(400).json({ error: "ID required" });

    try {
        // 1. TMDB ID se Watchmode ID nikalo
        const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${API_KEY}&search_field=tmdb_id&search_value=${tmdb_id}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.title_results || searchData.title_results.length === 0) {
            return res.status(200).json({ sources: [] });
        }

        const watchmodeId = searchData.title_results[0].id;

        // 2. Sources nikalo (India Region = IN)
        const sourceUrl = `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${API_KEY}&regions=IN`;
        const sourceRes = await fetch(sourceUrl);
        const sourceData = await sourceRes.json();

        // 3. Duplicates Hatao
        const uniqueSources = [];
        const seen = new Set();
        
        if (Array.isArray(sourceData)) {
            for (const item of sourceData) {
                if (!seen.has(item.name)) {
                    seen.add(item.name);
                    uniqueSources.push({ name: item.name, url: item.web_url });
                }
            }
        }

        res.status(200).json({ sources: uniqueSources });

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
