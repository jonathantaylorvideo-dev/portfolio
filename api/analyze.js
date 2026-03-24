// api/analyze.js
export default async function handler(req, res) {
  // 1. Set CORS and Pre-flight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    
    // Check for the key using the EXACT name from your Vercel Screenshot
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!image) return res.status(400).json({ error: "HANDSHAKE_FAIL: No image data." });
    if (!API_KEY) return res.status(500).json({ error: "CONFIG_FAIL: API Key is missing in Vercel." });

    // 2. Execute Gemini Request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Identify this hobby collectible. Return ONLY a raw JSON object with these keys: name, grade, value, lore. No markdown formatting." },
              { inline_data: { mime_type: "image/jpeg", data: image } }
            ]
          }]
        })
      }
    );

    const result = await response.json();

    // 3. Structural Validation
    if (!result.candidates || !result.candidates[0].content) {
      console.error("Gemini Error Payload:", JSON.stringify(result));
      throw new Error(result.error?.message || "AI_ENGINE_REJECTION");
    }

    const rawText = result.candidates[0].content.parts[0].text;
    
    // 4. The Sanitizer: Strip out any ```json or ``` marks if the AI includes them
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    
    // 5. Final Output
    res.status(200).json(JSON.parse(cleanText));

  } catch (err) {
    console.error("SERVER_CRASH_LOG:", err.message);
    res.status(500).json({ 
        error: "ANALYSIS_NODE_CRASH", 
        details: err.message 
    });
  }
}
