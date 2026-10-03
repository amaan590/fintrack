export default async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Use POST" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    const body = await req.json();
    const list = Array.isArray(body.transactions) ? body.transactions.slice(-50) : [];

    if (list.length === 0) {
        return new Response(JSON.stringify({ insight: "Add some transactions first." }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    const lines = list.map(function (t) {
        return `${t.type}: ${t.category || "Other"}, ${t.description}, ${t.amount} rupees`;
    }).join("\n");

    const prompt =
        "You are a friendly personal finance assistant. Here are a user's transactions:\n" +
        lines +
        "\n\nGive 3 short, practical insights about their spending and savings. " +
        "Use simple words, and keep the whole answer under 100 words.";

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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

    if (!response.ok) {
        return new Response(JSON.stringify({ error: "AI request failed", details: data }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer came back.";

    return new Response(JSON.stringify({ insight: text }), {
        headers: { "Content-Type": "application/json" }
    });
};
