export default async function handler(req, res) {
    // Wahi same VIP Pass
    const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkN2VlMjViZDNhN2I3NWNjMDUwN2JlMDU1ZmZhMzYwNSIsIm5iZiI6MTc3MTA4MzQ0NC42OTQwMDAyLCJzdWIiOiI2OTkwOTZiNGM0ZGFjZmE5NjI4Yzk4ZjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.aJduur5UZCuA4xTFYIkVukY0j4fOmiRtu8JZxc3w-T4';

    const { id } = req.query; // Show ka ID chahiye

    if (!id) return res.status(400).json({ error: "Show ID required" });

    // Magic URL: Ye ek saath Details, Cast (credits), aur Images le aayega
    const url = `https://api.themoviedb.org/3/tv/${id}?language=en-US&append_to_response=credits,images,external_ids`;

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
        
        if (!response.ok) return res.status(response.status).json(data);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}
