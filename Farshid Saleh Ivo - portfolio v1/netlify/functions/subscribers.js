/* Netlify Function: live YouTube subscriber counts.
 *
 * GET /.netlify/functions/subscribers
 * → { "counts": { "<channel id>": 1234, ... }, "updatedAt": "..." }
 *
 * The API key is read from the environment. YOUTUBE_API_KEY is the name to
 * use; a few common aliases are accepted so an existing setup keeps working
 * after a redeploy without touching the Netlify settings.
 */
const CHANNEL_IDS = {
    yoyoFSI: "UCwjhIjcKGbFv_1wh8PyUExQ",
    realfsi: "UCsgjaqe0hiWxc_VsA4uqF2Q"
};

const KEY_NAMES = [
    "YOUTUBE_API_KEY",
    "YOUTUBE_KEY",
    "YT_API_KEY",
    "YOUTUBE_DATA_API_KEY",
    "YOUTUBE_API",
    "API_KEY"
];

const readApiKey = () => {
    for (const name of KEY_NAMES) {
        if (process.env[name]) return process.env[name].trim();
    }
    return "";
};

const json = (statusCode, body, headers = {}) => ({
    statusCode,
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers
    },
    body: JSON.stringify(body)
});

exports.handler = async (event) => {
    const method = event.httpMethod || "GET";
    if (method !== "GET" && method !== "HEAD") {
        return json(405, { error: "Method not allowed" }, { Allow: "GET, HEAD" });
    }

    const apiKey = readApiKey();
    if (!apiKey) {
        console.error(`No YouTube API key found. Set one of: ${KEY_NAMES.join(", ")}`);
        return json(500, { error: "Subscriber counts are not configured" });
    }

    const endpoint = new URL("https://www.googleapis.com/youtube/v3/channels");
    endpoint.searchParams.set("part", "statistics");
    endpoint.searchParams.set("id", Object.values(CHANNEL_IDS).join(","));
    endpoint.searchParams.set("key", apiKey);

    try {
        const response = await fetch(endpoint, { headers: { Accept: "application/json" } });

        if (!response.ok) {
            const detail = await response.text();
            console.error("YouTube API error", response.status, detail.slice(0, 300));
            return json(502, { error: "YouTube API request failed" });
        }

        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const counts = {};

        for (const id of Object.values(CHANNEL_IDS)) {
            const channel = items.find((item) => item.id === id);
            const total = Number(channel && channel.statistics && channel.statistics.subscriberCount);
            if (Number.isFinite(total) && total > 0) {
                counts[id] = total;
            }
        }

        if (Object.keys(counts).length === 0) {
            return json(502, { error: "No subscriber data returned" });
        }

        return json(
            200,
            { counts, updatedAt: new Date().toISOString() },
            // Cache at the CDN for 30 minutes, so the API quota isn't spent
            // on every page view. The browser always asks for fresh data.
            { "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400" }
        );
    } catch (error) {
        console.error("Subscriber function failed", error);
        return json(502, { error: "Failed to fetch subscriber counts" });
    }
};
