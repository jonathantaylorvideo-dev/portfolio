const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

/**
 * 1. HEALTH CHECK & UPLINK VERIFICATION
 */
app.get('/', (req, res) => {
    res.status(200).send('AI_STRATEGY_ENGINE: ONLINE [STATUS_CODE: 200]');
});

/**
 * 2. PROFESSIONAL DISCOVERY AUDITOR
 * Cycles through 5 stages of business inquiry.
 */
app.post('/api/audit', async (req, res) => {
    const { history } = req.body;
    
    // Count how many times the BOT has spoken to determine the next question
    const botMessages = (history || []).filter(m => m.role === 'bot');
    const index = botMessages.length;

    const questions = [
        "That's a solid starting point. To help me understand the impact, roughly how many hours a week is your team currently spending on these manual tasks?",
        "Got it. Regarding your tech stack—are you currently using any specific software or APIs for these areas, or is most of this handled via spreadsheets?",
        "That makes sense. If we were to design a custom solution, would you prioritize real-time data accuracy or simply reducing manual entry time?",
        "Almost there! In your current workflow, what is the single biggest 'headache' or fail-point that causes the most friction?",
        "Final question: What does a 'perfect' workday look like for you once these bottlenecks are automated?",
        "Thank you for those insights. I've finished mapping your business architecture. You can now click [ GENERATE_FULL_AUDIT ] for your report."
    ];

    // Select the question based on conversation progress
    const responseText = questions[index] || questions[questions.length - 1];

    res.json({ status: "SUCCESS", analysis: responseText });
});

/**
 * 3. VISUAL VAULT ENDPOINT (NON-DESTRUCTIVE)
 */
app.post('/api/analyze', async (req, res) => {
    res.json({
        name: "SCAN_VERIFIED",
        grade: "A [ARCHITECT_STAMP]",
        value: "OPTIMAL_FLOW",
        lore: "Infrastructure alignment confirmed."
    });
});

/**
 * 4. RENDER BINDING
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI_STRATEGY_ENGINE: UPLINK ESTABLISHED ON PORT ${PORT}`);
});

/**
 * 5. STAY_AWAKE PROTOCOL
 */
const PING_INTERVAL = 14 * 60 * 1000; 
const SELF_URL = 'https://ai-strategy-engine.onrender.com';

setInterval(async () => {
    try {
        await axios.get(SELF_URL);
        console.log(`[SYSTEM_MAINTENANCE]: Self-ping successful.`);
    } catch (err) {
        console.error("[SYSTEM_ERROR]: Self-ping failed.");
    }
}, PING_INTERVAL);
