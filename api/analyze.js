// api/analyze.js
export default async function handler(req, res) {
    // 1. Set CORS headers to allow the phone to talk to the server
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Handle the browser's "pre-flight" check
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Ensure we only process POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    const { image } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this item. Return JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                        { inline_data: { mime_type: "image/jpeg", data: image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
            return res.status(200).json(JSON.parse(aiText));
        }
        
        throw new Error("Gemini response was empty.");
    } catch (err) {
        console.error("Server Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
