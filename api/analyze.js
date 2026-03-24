// api/analyze.js

// 1. We use a standard function export that Vercel recognizes
module.exports = async (req, res) => {
    // 2. Set CORS headers immediately
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { image } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!image) throw new Error("No image data received.");
        
        // Strip prefix (data:image/jpeg;base64,)
        const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

        // 3. The Handshake (Wrapped in this async handler)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this item. Return ONLY JSON: {\"name\":\"\",\"grade\":\"\",\"value\":\"\",\"lore\":\"\"}" },
                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const aiText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        res.status(200).json(JSON.parse(aiText));

    } catch (err) {
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
};
