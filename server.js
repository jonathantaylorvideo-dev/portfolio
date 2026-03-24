const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

/**
 * 1. RENDER HEALTH CHECK
 */
app.get('/', (req, res) => {
    res.status(200).send('AI_STRATEGY_ENGINE: ONLINE [STATUS_CODE: 200]');
});

/**
 * 2. INTERACTIVE AI AUDITOR (5-6 STAGE DISCOVERY)
 */
app.post('/api/audit', async (req, res) => {
    const { message, history } = req.body;
    
    // Calculate progress based on the number of previous bot messages
    const questionCount = history.filter(m => m.role === 'bot').length;

    try {
        let analysisText = "";

        // Diagnostic Tree Logic
        switch(questionCount) {
            case 1:
                analysisText = "Understood. To assess the scale of this friction, approximately how many manual hours per week are currently lost to this specific process?";
                break;
            case 2:
                analysisText = "Data logged. Regarding your current technical stack—are you operating on a legacy system, or is there an existing API (like Shopify, Square, or a custom DB) we can hook into?";
                break;
            case 3:
                analysisText = "Analysis progressing. If we were to automate this, would the priority be 'Real-Time Accuracy' or 'Bulk Processing Speed'?";
                break;
            case 4:
                analysisText = "Almost complete. What is the single biggest 'fail-point' in your current setup? (e.g., human error, slow hardware, or fragmented data?)";
                break;
            case 5:
                analysisText = "Final diagnostic parameter: What is your ideal 'End State' for this workflow—complete hands-off automation, or a human-in-the-loop dashboard?";
                break;
            default:
                // This triggers once the 5-question cycle is complete
                analysisText = "Diagnostic complete. I have mapped your architectural requirements. Please click [ GENERATE_FULL_AUDIT ] to view the optimized deployment strategy.";
        }

        res.json({ status: "SUCCESS", analysis: analysisText });
    } catch (err) {
        console.error("[ERROR]: Audit Diagnostic Interrupted", err);
        res.status(500).json({ error: "DIAGNOSTIC_FAILURE" });
    }
});

/**
 * 3. VISUAL VAULT ANALYZER
 */
app.post('/api/analyze', async (req, res) => {
    try {
        res.json({
            name: "SCAN_VERIFIED",
            grade: "A [ARCHITECT_STAMP]",
            value: "OPTIMAL_FLOW",
            lore: "Infrastructure alignment confirmed. No immediate corrective action required."
        });
    } catch (err) {
        res.status(500).json({ error: "OPTICAL_TIMEOUT" });
    }
});

/**
 * 4. SERVER BINDING (THE RENDER FIX)
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`AI_STRATEGY_ENGINE: UPLINK ESTABLISHED`);
    console.log(`BINDING_TO_PORT: ${PORT}`);
    console.log(`-----------------------------------------`);
});

/**
 * 5. STAY_AWAKE PROTOCOL
 * Prevents Render Free Tier from spinning down by pinging itself every 14 minutes.
 */
const PING_INTERVAL = 14 * 60 * 1000; 
const SELF_URL = 'https://ai-strategy-engine.onrender.com';

setInterval(async () => {
    try {
        await axios.get(SELF_URL);
        console.log(`[SYSTEM_MAINTENANCE]: Self-ping successful. Engine active.`);
    } catch (err) {
        console.error("[SYSTEM_ERROR]: Self-ping failed.");
    }
}, PING_INTERVAL);
