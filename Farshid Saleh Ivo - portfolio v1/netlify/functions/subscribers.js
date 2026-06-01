exports.handler = async () => {
    const APIkey = process.env.YOUTUBE_API_KEY;
    const channel1 = "UCwjhIjcKGbFv_1wh8PyUExQ";
    const channel2 = "UCsgjaqe0hiWxc_VsA4uqF2Q";

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channel1},${channel2}&key=${APIkey}`
        );

        const data = await response.json();

        const channels = {};
        data.items.forEach(item => {
            channels[item.id] = item.statistics.subscriberCount;
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscriberCount: channels[channel1],
                subscriberCount2: channels[channel2]
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Failed to fetch subscriber count" })
        };
    }
};
