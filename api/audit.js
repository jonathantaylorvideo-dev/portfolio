const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // 1. CORS Security Handshake
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 2. Initialize Gemini 3 Flash
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const { history } = req.body;
        const userMessages = (history || []).filter(m => m.role === 'user');
        
        const prompt = `
            You are Jonathan Taylor's Strategic AI Engine.
            Conduct a professional 5-pillar audit (Operations, Marketing, AI Integration, Scalability, Tech Stack).
            Context: ${userMessages.map(m => m.text).join(" | ")}
            Rule: Ask one brief follow-up question OR start with "GENERATE_FINAL_REPORT" if you have enough info.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.status(200).json({ 
            analysis: text.replace("GENERATE_FINAL_REPORT", "").trim(), 
            status: text.includes("GENERATE_FINAL_REPORT") ? "complete" : "collecting" 
        });

    } catch (error) {
        res.status(500).json({ error: "Uplink Error: " + error.message });
    }
};
