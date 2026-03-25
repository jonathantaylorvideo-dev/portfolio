const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    const { history } = req.body;
    const userMessages = (history || []).filter(m => m.role === 'user');
    
    // Dynamic Architect Prompt
    const systemPrompt = `
        You are Jonathan Taylor's Strategic AI Engine. Conduct a business audit.
        Goal: Bridge the gap between manual labor and AI automation for small businesses.
        Pillars: 1. Workflow 2. ROI 3. Tech Stack 4. AI Readiness 5. Risk.
        
        CONTEXT: ${userMessages.map(m => m.text).join(" | ")}
        
        RULE: If you have enough info (approx 6 interactions), start with "GENERATE_FINAL_REPORT" 
        and provide a 5-pillar Markdown report. Otherwise, ask ONE targeted follow-up question.
    `;

    try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text.includes("GENERATE_FINAL_REPORT")) {
            const cleanReport = text.replace("GENERATE_FINAL_REPORT", "").trim();
            res.json({ analysis: cleanReport, status: "complete" });
        } else {
            res.json({ analysis: text, status: "collecting" });
        }
    } catch (error) {
        console.error("DETAILED_DEBUG_LOG:", error);
        res.status(500).json({ 
            analysis: "Uplink interrupted. Check Render logs for DETAILED_DEBUG_LOG.", 
            status: "error" 
        });
    }
});

app.get('/', (req, res) => res.send("Strategic Engine: ONLINE"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`System Live on ${PORT}`));
