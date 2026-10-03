const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async (req) => {
    const json = (obj, status = 200) =>
        new Response(JSON.stringify(obj), {
            status: status,
            headers: { "Content-Type": "application/json" }
        });

    if (req.method !== "POST") {
        return json({ error: "Use POST" }, 405);
    }

    const body = await req.json();
    const list = Array.isArray(body.transactions) ? body.transactions.slice(-50) : [];

    if (list.length === 0) {
        return json({ insight: "Add some transactions first." });
    }

    const lines = list.map(function (t) {
        return `${t.type}: ${t.category || "Other"}, ${t.description}, ${t.amount} rupees`;
    }).join("\n");

    const prompt =
        "You are a friendly personal finance assistant. Here are a user's transactions:\n" +
        lines +
        "\n\nGive 3 short, practical insights about their spending and savings. " +
        "Use simple words, and keep the whole answer under 100 words.";

    let lastError = null;

    for (const model of MODELS) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer came back.";
            return json({ insight: text });
        }

        lastError = { model: model, status: response.status, details: data };

        // Busy or rate limited: try the next model. Anything else: stop.
        if (response.status !== 503 && response.status !== 429) {
            break;
        }

        await wait(1000);
    }

    return json({ error: "AI request failed", details: lastError }, 500);
};
