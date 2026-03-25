const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// --- SECRET LOADER ---
const secretPath = '/etc/secrets/.env'; // Adjust if your filename is different
if (fs.existsSync(secretPath)) {
    require('dotenv').config({ path: secretPath });
    console.log("✅ CONFIG: Loaded from /etc/secrets/");
} else {
    require('dotenv').config();
    console.log("ℹ️ CONFIG: Loaded from local/env vars");
}

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with a fresh pull of the key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    try {
        const { history } = req.body;
        const userMessages = (history || []).filter(m => m.role === 'user');

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API Key is missing from the server environment.");
        }

        const systemPrompt = `
            You are Jonathan Taylor's Strategic AI Engine.
            Conduct a professional 5-pillar audit for a small business.
            Context: ${userMessages.map(m => m.text).join(" | ")}
            Rule: Ask one brief follow-up question OR start with "GENERATE_FINAL_REPORT" if you have enough info.
        `;

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
    res.send(`Strategic Engine: ONLINE | Key Status: ${process.env.GEMINI_API_KEY ? "READY" : "MISSING"}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine active on port ${PORT}`));
