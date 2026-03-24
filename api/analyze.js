// api/analyze.js
export default async function handler(req, res) {
    // 1. Handshake / CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { image } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!image) return res.status(400).json({ error: "No image data received" });
        if (!API_KEY) return res.status(500).json({ error: "API Key missing in Vercel" });

        // 2. Clean the Base64 string (Gemini fails if the "data:image/jpeg;base64," prefix is present)
        const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

        // 3. The Handshake with Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this hobby/collectible item. Return ONLY raw JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }. No markdown." },
                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();

        // 4. Robust Parsing
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiText = data.candidates[0].content.parts[0].text;
            // Remove any accidental markdown backticks the AI might add
            aiText = aiText.replace(/```json|```/g, "").trim();
            return res.status(200).json(JSON.parse(aiText));
        } else {
            console.error("Gemini Error Response:", JSON.stringify(data));
            return res.status(500).json({ error: "Gemini failed to generate a response." });
        }

    } catch (err) {
        console.error("Server Crash:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
