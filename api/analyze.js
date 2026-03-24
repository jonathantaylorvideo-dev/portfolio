// api/analyze.js
export default async function handler(req, res) {
    // 1. Mandatory CORS Handshake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

    try {
        const { image } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!image) throw new Error("No image data received.");
        if (!API_KEY) throw new Error("API Key is missing in Vercel settings.");

        // 2. STRIP PREFIX: Gemini needs ONLY the raw base64 string
        const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

        // 3. Handshake with Gemini 1.5 Pro
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this item for a collector. Return ONLY raw JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();

        // Check if Gemini returned an error inside the JSON
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return res.status(500).json({ error: data.error.message });
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiText = data.candidates[0].content.parts[0].text;
            // Clean markdown if the AI includes it
            aiText = aiText.replace(/```json|```/g, "").trim();
            return res.status(200).json(JSON.parse(aiText));
        }

        throw new Error("Gemini returned an empty response.");

    } catch (err) {
        console.error("Vercel Crash Log:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
