// api/analyze.js
export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!image) return res.status(400).json({ error: "PAYLOAD_EMPTY" });
    if (!API_KEY) return res.status(500).json({ error: "KEY_MISSING" });

    // 2. Updated to Gemini 3 Flash Preview (The March 2026 Standard)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Identify this collectible. Return ONLY a JSON object: { \"name\": \"...\", \"grade\": \"...\", \"value\": \"...\", \"lore\": \"...\" }" },
              { inline_data: { mime_type: "image/jpeg", data: image } }
            ]
          }]
        })
      }
    );

    const result = await response.json();

    // 3. Error Handling for Model Not Found or Auth Issues
    if (result.error) {
      console.error("Gemini API Error:", result.error.message);
      throw new Error(result.error.message);
    }

    if (!result.candidates || !result.candidates[0].content) {
      throw new Error("EMPTY_AI_RESPONSE");
    }

    const rawText = result.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    
    res.status(200).json(JSON.parse(cleanText));

  } catch (err) {
    console.error("ARCHITECT_LOG:", err.message);
    res.status(500).json({ error: "SCAN_FAILED", details: err.message });
  }
}
