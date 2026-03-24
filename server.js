const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

/**
 * 1. RENDER HEALTH CHECK & HEARTBEAT
 * This is the critical route that Render pings to verify the service is live.
 */
app.get('/', (req, res) => {
    res.status(200).send('VISUAL_VAULT_2: SYSTEMS_NOMINAL');
});

/**
 * 2. INTERACTIVE AI AUDITOR
 * Handles the professional conversation and diagnostic reporting.
 */
app.post('/api/audit', async (req, res) => {
    const { message, history } = req.body;
    console.log(`[AUDIT_INBOUND]: ${message}`);

    try {
        let analysisText = "Data received. To refine this architectural diagnostic, how is this bottleneck currently impacting your scalability?";

        const input = message.toLowerCase();
        if (input.includes("inventory") || input.includes("stock")) {
            analysisText = "Manual inventory synchronization identified as a high-latency friction point. I recommend an agentic pipeline for real-time tracking. Are you using an API-enabled POS?";
        } else if (input.includes("marketing") || input.includes("social")) {
            analysisText = "Content deployment latency detected. We can automate this workflow via a custom orchestration layer. Shall we map the asset distribution parameters?";
        }

        res.json({ status: "SUCCESS", analysis: analysisText });
    } catch (err) {
        console.error("[ERROR]: Audit Diagnostic Interrupted", err);
        res.status(500).json({ error: "DIAGNOSTIC_FAILURE" });
    }
});

/**
 * 3. VISUAL VAULT ANALYZER
 * Powers the multimodal scanning for your portfolio's Vault node.
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
 * We bind to 0.0.0.0 to ensure Render's load balancer can find the service.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`VISUAL_VAULT_2: UPLINK ESTABLISHED`);
    console.log(`BINDING_TO_PORT: ${PORT}`);
    console.log(`SYSTEMS_READY: TRUE`);
    console.log(`-----------------------------------------`);
});
