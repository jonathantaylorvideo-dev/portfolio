const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    const { history } = req.body;
    const userMessages = (history || []).filter(m => m.role === 'user');
    
    // THE DYNAMIC PROMPT
    const prompt = `
        You are a Senior AI Systems Architect conducting a Discovery Audit for a small business.
        
        GOAL: Collect enough data to satisfy these 5 pillars:
        1. Workflow Inventory (Lead-to-fulfillment process)
        2. Friction & ROI (Hours lost to manual tasks)
        3. Tech Stack (Software silos and manual data entry)
        4. AI Readiness (Data structure and brand voice)
        5. Risk & Ethics (Human-in-the-loop and authenticity)

        CONTEXT SO FAR: ${userMessages.map(m => m.text).join(" | ")}

        INSTRUCTION:
        - If you have fewer than 6 user responses, ask ONE targeted, professional follow-up question to bridge a data gap in the 5 pillars.
        - If you have 6 or more responses AND enough data, respond with the string "GENERATE_FINAL_REPORT" followed by the full 5-pillar audit report.
        - Keep questions concise, technical, and high-velocity.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (text.includes("GENERATE_FINAL_REPORT")) {
            // Clean the flag out of the final report
            const cleanReport = text.replace("GENERATE_FINAL_REPORT", "").trim();
            res.json({ analysis: cleanReport, status: "complete" });
        } else {
            res.json({ analysis: text, status: "collecting" });
        }
    } catch (error) {
        res.status(500).json({ analysis: "Uplink interrupted. Please restart diagnostic.", status: "error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Strategic Engine Live on ${PORT}`));
