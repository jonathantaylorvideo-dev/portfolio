res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { image } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this comic or collectible. Perform a visual grade (1-10). Give current market value and a 1-sentence lore snippet. Return ONLY a JSON object: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                        { inline_data: { mime_type: "image/jpeg", data: image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        // Extract the text from Gemini's response and send it back
        const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
        res.status(200).json(aiResponse);
    } catch (err) {
        res.status(500).json({ error: "Vault Offline", details: err.message });
    }
}
