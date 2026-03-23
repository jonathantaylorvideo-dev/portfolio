import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, bottleneck, hours, stack, goal } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are Jonathan Taylor, AI Systems Architect. 
        Write a brief automation strategy for ${name}. 
        Bottleneck: ${bottleneck}. 
        Time lost: ${hours}h/week. 
        Stack: ${stack}. 
        Goal: ${goal}h/month.
        Provide: 1. Annual ROI calculation. 2. One specific 'Agentic Workflow' recommendation.
        Tone: Professional, cinematic, 'Modern Druid' vibes. Max 120 words.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return res.status(200).json({ audit: text });
    } catch (error) {
        return res.status(500).json({ error: "AI Node Failure" });
    }
}