const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Allows your HTML file to talk to this server

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-audit', async (req, res) => {
    const { name, bottleneck, hours, stack, goal } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `System Architect Jonathan Taylor: Generate a 100-word ROI audit for ${name}. 
                        Losing ${hours}h/week to ${bottleneck} on ${stack}. Goal: save ${goal}h/month.`;
        
        const result = await model.generateContent(prompt);
        res.json({ audit: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: "Local Node Offline" });
    }
});

app.listen(3000, () => console.log('🚀 Local Architect Node active on http://localhost:3000'));
