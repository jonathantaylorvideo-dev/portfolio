export default async function handler(req, res) {
    // 🚨 REQUIRED FOR MOBILE/CROSS-DOMAIN
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the browser's "pre-flight" check
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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
                        { text: "Identify this comic or hobby item. Return JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                        { inline_data: { mime_type: "image/jpeg", data: image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        // Check if Gemini actually returned a result
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
            res.status(200).json(JSON.parse(aiText));
        } else {
            res.status(500).json({ error: "Gemini failed to parse image." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
