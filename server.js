const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const questions = [
    "System online. I am your AI Auditor. Please describe the primary operational friction in your current business workflow.",
    "Roughly how many hours a week is your team currently spending on these manual tasks?",
    "Are you currently using any specific software or APIs for these areas, or is most of this handled via spreadsheets?",
    "Would you prioritize real-time data accuracy across all platforms, or simply reducing the time spent on repetitive entry?",
    "What is the biggest 'headache' or fail-point that currently causes the most friction?",
    "What does a 'perfect' workday look like for you once these bottlenecks are automated?"
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
        
        // UPGRADED PROMPT FOR PROFESSIONAL DEPTH
        const prompt = `
            You are a Senior AI Systems Architect analyzing a high-value business.
            DATA: ${clientContext}
            
            TASK: Provide a formal 3-paragraph Architectural Verdict.
            - Paragraph 1: Analyze their specific friction points and the technical cost of their current manual debt.
            - Paragraph 2: Propose a custom Agentic Workflow solution involving their specific tools or pain points.
            - Paragraph 3: Project the ROI and the "Perfect Workday" impact.
            
            Tone: High-velocity, technical, and authoritative. Do not use generic filler.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ analysis: response.text(), status: "complete" });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            analysis: "Audit complete. Your current workflow shows high potential for agentic automation to reclaim 15+ hours per week.", 
            status: "complete" 
        });
    }
});

// VAULT ENDPOINT (Standard Logic)
app.post('/api/analyze', async (req, res) => {
    res.json({
        name: "ARCHITECTURAL_NODE_ACTIVE",
        lore: "Analysis confirms high optimization potential. Recommend transitioning legacy data to an autonomous agentic layer."
    });
});

app.get('/', (req, res) => res.send("Engine: ONLINE"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine running on ${PORT}`));
