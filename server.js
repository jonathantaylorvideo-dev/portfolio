const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    try {
        const { history } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                analysis: "Backend Error: GEMINI_API_KEY not found in environment.", 
                status: "error" 
            });
        }

        const userMessages = (history || []).filter(m => m.role === 'user');
        const systemPrompt = `Analyze this business: ${userMessages.map(m => m.text).join(" | ")}. Ask one follow-up or provide a 5-pillar report starting with GENERATE_FINAL_REPORT.`;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text.includes("GENERATE_FINAL_REPORT")) {
            res.json({ 
                analysis: text.replace("GENERATE_FINAL_REPORT", "").trim(), 
                status: "complete" 
            });
        } else {
            res.json({ analysis: text, status: "collecting" });
        }
    } catch (error) {
        console.error("EXECUTION_ERROR:", error.message);
        res.status(500).json({ 
            analysis: `Uplink Error: ${error.message}`, 
            status: "error" 
        });
    }
});

app.get('/', (req, res) => {
    res.send(`Strategic Engine: ONLINE | Status: ${process.env.GEMINI_API_KEY ? "CONNECTED" : "KEY_MISSING"}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server active on port ${PORT}`));
