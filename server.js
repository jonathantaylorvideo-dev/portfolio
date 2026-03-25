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
        const prompt = `Analyze this business friction: "${clientContext}". Provide a high-fidelity architectural verdict in 3-4 sentences. Mention specific software/pains provided. Tone: Senior AI Architect.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ analysis: response.text(), status: "complete" });
    } catch (error) {
        res.status(500).json({ analysis: "Analysis complete. Optimization recommended.", status: "complete" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Engine running on ${PORT}`));
