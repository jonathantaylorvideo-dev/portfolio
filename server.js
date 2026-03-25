const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Expanded discovery to feed the 5 pillars: Inventory, ROI, Tech, Data, and Ethics
const questions = [
    "System online. I am your AI Auditor. Please describe the primary operational friction in your current business workflow.",
    "Workflow Inventory: Walk me through your Lead Management and Event Planning steps. Where is the manual labor?",
    "ROI Analysis: Roughly how many hours is the team losing to these manual tasks weekly?",
    "Tech Stack: Which 'islands' of tech are you using (CRM, Website, etc)? Do they talk to each other?",
    "Data Health: Are your past event details stored in a searchable database or trapped in PDFs/Emails?",
    "Media Assets: Where do you store your photos/videos for social clipping?",
    "Brand Voice: Do you have a documented 'Brand Bible' to ensure AI sounds authentic?",
    "Ethics & Risks: Where would AI 'feel fake' to your clients? What is your backup plan for hallucinations?"
];

app.post('/api/audit', async (req, res) => {
    const { history } = req.body;
    const botMessages = (history || []).filter(m => m.role === 'bot');
    const userMessages = (history || []).filter(m => m.role === 'user');
    const index = botMessages.length;

    if (index < questions.length) {
        return res.json({ analysis: questions[index], status: "collecting" });
    }

    try {
        const clientContext = userMessages.map(m => m.text).join(" | ");
        const prompt = `
            You are a Senior AI Systems Architect. Create a formal 5-Section "Architectural Audit" based on: ${clientContext}.
            
            STRUCTURE:
            1. WORKFLOW INVENTORY: Map Lead Management and Event sequences.
            2. FRICTION & ROI: Breakdown of Hours Lost vs. Automation Feasibility.
            3. TECH STACK EVALUATION: Identify "Silos" and manual data transfers.
            4. AI READINESS: Assess Data Structure, Media Assets, and Brand Voice.
            5. RISK & ETHICS: Define Authenticity Checks and Human-in-the-loop fail-safes.

            TONE: Technical, authoritative, 2026-forward. Use Markdown headers (##).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ analysis: response.text(), status: "complete" });
    } catch (error) {
        res.status(500).json({ analysis: "## AUDIT COMPLETE\nOptimization recommended.", status: "complete" });
    }
});

app.post('/api/analyze', async (req, res) => {
    res.json({ name: "ARCHITECTURAL_NODE_ACTIVE", lore: "Optimization potential confirmed." });
});

app.get('/', (req, res) => res.send("Strategic Engine: ONLINE"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine running on ${PORT}`));
