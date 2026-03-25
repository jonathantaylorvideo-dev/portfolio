const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- THE SECRET RECOVERY AGENT ---
const secretPath = '/etc/secrets/.env'; // <--- DOUBLE CHECK THIS FILENAME ON RENDER

if (fs.existsSync(secretPath)) {
    // Manually parse the file because dotenv sometimes struggles with absolute paths on Linux
    const secretContent = fs.readFileSync(secretPath, 'utf8');
    secretContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
    console.log("✅ SYSTEM: Secret file parsed manually from /etc/secrets/");
} else {
    require('dotenv').config();
    console.log("ℹ️ SYSTEM: No secret file found at /etc/secrets/. Using standard Env Vars.");
}

// Check key status immediately
const API_KEY = process.env.GEMINI_API_KEY;
console.log("--- SECURITY CHECK ---");
console.log("KEY_PRESENT:", !!API_KEY);
if (API_KEY) console.log("KEY_PREFIX:", API_KEY.substring(0, 4));

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/audit', async (req, res) => {
    try {
        const { history } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ analysis: "CRITICAL: API Key missing from server memory.", status: "error" });
        }

        const userMessages = (history || []).filter(m => m.role === 'user');
        const systemPrompt = `Conduct a 5-pillar business audit. Context: ${userMessages.map(m => m.text).join(" | ")}. Rule: Ask one follow-up or provide report starting with GENERATE_FINAL_REPORT.`;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        if (text.includes("GENERATE_FINAL_REPORT")) {
            res.json({ analysis: text.replace("GENERATE_FINAL_REPORT", "").trim(), status: "complete" });
        } else {
            res.json({ analysis: text, status: "collecting" });
        }
    } catch (error) {
        console.error("EXECUTION_ERROR:", error.message);
        res.status(500).json({ analysis: `Uplink Error: ${error.message}`, status: "error" });
    }
});

app.get('/', (req, res) => {
    res.send(`Strategic Engine: ONLINE | Key: ${process.env.GEMINI_API_KEY ? "LOADED" : "MISSING"}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine checking in on port ${PORT}`));
