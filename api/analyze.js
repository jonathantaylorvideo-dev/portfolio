// api/analyze.js
export default async function handler(req, res) {
    // 1. Set CORS and Pre-flight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (!process.env.GOOGLE_API_KEY) {
  console.error("CRITICAL: GOOGLE_API_KEY is missing from environment variables.");
  return res.status(500).json({ error: "Server configuration error: Missing API Key" });
}
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { image } = req.body;
        // In Node 20+, process.env is the standard way to grab your Vercel secret
        const API_KEY = process.env.GOOGLE_API_KEY;

        if (!image) return res.status(400).json({ error: "HANDSHAKE_FAIL: No image data." });
        if (!API_KEY) return res.status(500).json({ error: "CONFIG_FAIL: API Key is missing in Vercel." });

        // Strip Base64 prefix
        const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

        // 2. Using Native Node 20 fetch (no imports needed)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Identify this item. Return JSON: {\"name\":\"\",\"grade\":\"\",\"value\":\"\",\"lore\":\"\"}" },
                        { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
                    ]
                }]
            })
        });

        const data = await response.json();

        // 3. Transparent Error Reporting
        if (data.error) {
            return res.status(500).json({ error: `GEMINI_API: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiText = data.candidates[0].content.parts[0].text;
            aiText = aiText.replace(/```json|```/g, "").trim();
            return res.status(200).json(JSON.parse(aiText));
        }

        throw new Error("EMPTY_RESPONSE");

    } catch (err) {
        // This will print the exact reason (e.g., "fetch is not defined") to your UI
        return res.status(500).json({ error: `RUNTIME_ERROR: ${err.message}` });
    }
}
