// Using Gemini 2.0 Flash for speed and reliability in 2026
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{
            parts: [
                { text: "Identify this hobby/collectible item. Return ONLY raw JSON: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
                { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
            ]
        }]
    })
});
