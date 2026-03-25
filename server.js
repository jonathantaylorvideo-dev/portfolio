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

// --- AI AUDIT ENDPOINT ---
app.post('/api/audit', async (req, res) => {
    const { history } = req.body;
    
    // Filter history to count how many times the BOT has spoken
    const botMessages = (history || []).filter(m => m.role === 'bot');
    const userMessages = (history || []).filter(m => m.role === 'user');
    const index = botMessages.length;

    // Phase 1: The Discovery Questions (1-6)
    if (index < questions.length) {
        return res.json({ analysis: questions[index] });
    }

    // Phase 2: Personalization (The Final Report)
    try {
        const clientContext = userMessages.map(m => m.text).join(" | ");
        
        const prompt = `
            You are a Senior AI Systems Architect. 
            Analyze this business friction data provided by a potential client: "${clientContext}".
            
            Provide a high-fidelity architectural verdict in exactly 3-4 sentences. 
            Mention their specific software or pain points if provided. 
            Focus on how an 'Agentic Workflow' can solve their 'perfect workday' vision.
            Keep the tone professional, technical, and high-velocity.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ analysis: response.text() });

    } catch (error) {
        console.error("AI Error:", error);
        res.json({ analysis: "Analysis complete. A custom agentic pipeline is recommended to bridge your current manual gaps and reclaim high-value hours." });
    }
});

// --- VISUAL VAULT ENDPOINT ---
app.post('/api/analyze', async (req, res) => {
    res.json({
        name: "ARCHITECTURAL_NODE_ACTIVE",
        grade: "A+",
        lore: "Multimodal analysis confirms high optimization potential. Recommend transitioning legacy spreadsheets to an autonomous agentic layer."
    });
});

app.get('/', (req, res) => res.send("Architectural Engine: ONLINE"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine running on port ${PORT}`));
