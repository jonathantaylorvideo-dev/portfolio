// Using Gemini 2.0 Flash for speed and reliability in 2026
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{
            parts: [
                { text: "Identify this hobby/collectible item. Return ONLY raw JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                { inline_data: { mime_texport default async function handler(req, res) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        
        // This will output the exact list of model names to your browser screen
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}ype: "image/jpeg", data: cleanBase64 } }
            ]
        }]
    })
});
