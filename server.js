const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Debug Check: Ensure Key exists on startup
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL_ERROR: GEMINI_API_KEY is missing from Environment Variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "DUMMY_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    const { history } = req.body;
    const userMessages = (history || []).filter(m => m.role === 'user');
    
    const systemPrompt = `
        Conduct a 5-pillar business audit for a small business.
        Context: ${userMessages.map(m => m.text).join(" | ")}
        Rule: If you have ~6 responses, start with "GENERATE_FINAL_REPORT" and provide a Markdown report. 
        Otherwise, ask one targeted, professional follow-up question.
    `;

    try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text.includes("GENERATE_FINAL_REPORT")) {
            res.json({ analysis: text.replace("GENERATE_FINAL_REPORT", "").trim(), status: "complete" });
        } else {
            res.json({ analysis: text, status: "collecting" });
        }
    } catch (error) {
        // This is where we catch the "Uplink Interrupted" cause
        console.error("DETAILED_DEBUG_LOG:", error.message || error);
        res.status(500).json({ 
            analysis: "Uplink interrupted. Ensure your GEMINI_API_KEY is valid in Render's Env settings.", 
            status: "error" 
        });
    }
});

app.get('/', (req, res) => res.send("Strategic Engine: ONLINE"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine Live on ${PORT}`));
