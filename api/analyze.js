// api/analyze.js

export default async function handler(req, res) {
    // 1. Mandatory CORS Handshake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Pre-flight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { image } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!image) return res.status(400).json({ error: "Missing image data" });
        if (!API_KEY) return res.status(500).json({ error: "API Key not configured in Vercel" });

        // Clean the Base64 string to ensure Gemini accepts it
        const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

        // 2. The Handshake with Gemini 2.0 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this item. Return JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();

        // Check for API-side errors
        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        // 3. Parse and return the JSON to your Bento Box
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiText = data.candidates[0].content.parts[0].text;
            // Remove markdown if the model accidentally includes it
            aiText = aiText.replace(/```json|```/g, "").trim();
            return res.status(200).json(JSON.parse(aiText));
        }

        throw new Error("Gemini returned an empty result.");

    } catch (err) {
        console.error("Function Crash:", err.message);
        return res.status(500).json({ error: `Server Crash: ${err.message}` });
    }
}
