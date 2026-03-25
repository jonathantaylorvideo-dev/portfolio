const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Check key at startup
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in Environment Variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Try switching to 1.5-pro if flash fails
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    try {
        const { history } = req.body;
        const userMessages = (history || []).filter(m => m.role === 'user');
        
        const systemPrompt = `Conduct a 5-pillar business audit. Context: ${userMessages.map(m => m.text).join(" | ")}. Rule: Ask one targeted follow-up or start with GENERATE_FINAL_REPORT if done.`;

        // Attempt generation
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text.includes("GENERATE_FINAL_REPORT")) {
            res.json({ analysis: text.replace("GENERATE_FINAL_REPORT", "").trim(), status: "complete" });
        } else {
            res.json({ analysis: text, status: "collecting" });
        }

    } catch (error) {
        // THIS LOG IS THE KEY: Look for this in Render Logs
        console.error("--- DETAILED_SERVER_CRASH_REPORT ---");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        
        res.status(500).json({ 
            analysis: `Uplink Error: ${error.message || "Unknown Server Error"}`, 
            status: "error" 
        });
    }
});

app.get('/', (req, res) => res.send("Strategic Engine: ONLINE | V1.26"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine checking in on port ${PORT}`));
