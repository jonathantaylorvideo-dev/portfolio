const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// SECURITY: Allow your GitHub Pages origin explicitly
const corsOptions = {
    origin: ['https://jonathandtaylor.github.io', 'http://localhost:5500'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Gemini 3 Flash (The 2026 standard)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

app.post('/api/audit', async (req, res) => {
    try {
        const { history } = req.body;
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ analysis: "System Error: API Key not detected.", status: "error" });
        }

        const userMessages = (history || []).filter(m => m.role === 'user');
        const prompt = `Conduct a 5-pillar business audit. Context: ${userMessages.map(m => m.text).join(" | ")}. Rule: Ask one follow-up or provide report starting with GENERATE_FINAL_REPORT.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ 
            analysis: text.replace("GENERATE_FINAL_REPORT", "").trim(), 
            status: text.includes("GENERATE_FINAL_REPORT") ? "complete" : "collecting" 
        });
    } catch (error) {
        console.error("LOG:", error.message);
        res.status(500).json({ analysis: `Uplink Error: ${error.message}`, status: "error" });
    }
});

// STATUS UPLINK (For your index.html to check)
app.get('/', (req, res) => {
    res.send(process.env.GEMINI_API_KEY ? "CONNECTED" : "KEY_MISSING");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Uplink Active on ${PORT}`));
