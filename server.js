require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// --- 1. THE SECURITY BRIDGE (CORS) ---
// This allows your GitHub Pages site to talk to this Render server
app.use(cors());
app.use(express.json());

// --- 2. INITIALIZE GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 3. THE "GREEN LIGHT" STATUS ROUTE ---
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Architect Engine is awake and ready.',
        timestamp: new Date().toISOString()
    });
});

// --- 4. THE AI AUDIT ENGINE ---
app.post('/api/generate-audit', async (req, res) => {
    try {
        const { businessName, industry, bottleneck } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a world-class AI Systems Architect. 
            Generate a professional, high-impact AI Strategy Audit for a business called "${businessName}" in the ${industry} industry.
            
            The client's main challenge is: "${bottleneck}"
            
            Format the response in clean HTML-style sections:
            - <h3>🎯 Immediate ROI Opportunities</h3>
            - <h3>🛠️ Suggested AI Stack</h3>
            - <h3>🚀 90-Day Roadmap</h3>
            
            Tone: Professional, insightful, and slightly futuristic.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ audit: text });

    } catch (error) {
        console.error('AI Audit Error:', error);
        res.status(500).json({ error: 'The AI engine encountered an error. Check logs.' });
    }
});

// --- 5. THE CLOUD IGNITION ---
// We use process.env.PORT because Render assigns a random port (like 10000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Architect Engine Live on Port ${PORT}`);
    console.log(`🔗 Listening for requests from your GitHub Portfolio...`);
});
