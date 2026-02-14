export default async function handler(req, res) {
    const API_KEY = 'btDHGeF3hPorU1ZDAJ1LTjI9qSYkzXNsfzMust3H';
    const { tmdb_id, type } = req.query; // type = 'movie' or 'tv'

    if (!tmdb_id) return res.status(400).json({ error: "ID required" });

    try {
        // Step 1: TMDB ID se Watchmode ID dhundo
        // Hum 'search_field' use kar rahe hain taaki accurate match mile
        const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${API_KEY}&search_field=tmdb_id&search_value=${tmdb_id}`;
        
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        // Agar result nahi mila
        if (!searchData.title_results || searchData.title_results.length === 0) {
            return res.status(200).json({ sources: [] });
        }

        const watchmodeId = searchData.title_results[0].id;

        // Step 2: Us ID se Streaming Sources nikalo (Region: India)
        const sourceUrl = `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${API_KEY}&regions=IN`;
        
        const sourceRes = await fetch(sourceUrl);
        const sourceData = await sourceRes.json();

        // Duplicate sources hatao (Jaise 2 baar Netflix na dikhe)
        const uniqueSources = [];
        const map = new Map();
        for (const item of sourceData) {
            if(!map.has(item.name)){
                map.set(item.name, true);    // set any value to Map
                uniqueSources.push({
                    name: item.name,
                    url: item.web_url,
                    type: item.type // 'sub' (Subscription) or 'rent'
                });
            }
        }

        res.status(200).json({ sources: uniqueSources });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Watchmode Server Error" });
    }
}
