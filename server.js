import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Configuration (Recommended: Use an environment variable for the API Key)
// You would replace 'YOUR_GEMINI_API_KEY' with your actual key, or better, 
// use a .env file and process.env.GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY || "MY_GEMINI_API_KEY"; // Placeholder from original file
const ai = new GoogleGenAI({ apiKey });
const modelName = "gemini-2.5-flash-preview-05-20";

const app = express();
const port = 3000;

// Setup to use ES modules features like import
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json()); 

// Serve static files from the current directory (index.html, app.js, etc.)
app.use(express.static(__dirname));

/**
 * Defines the strict JSON schema for the project plan response.
 */
const responseSchema = {
    type: "OBJECT",
    properties: {
        "title": { "type": "STRING", "description": "A concise, professional title for the generated project plan." },
        "tasks": {
            "type": "ARRAY",
            "items": {
                type: "OBJECT",
                properties: {
                    "id": { "type": "INTEGER", "description": "A unique, sequential ID starting from 1." },
                    "description": { "type": "STRING", "description": "The detailed, actionable description of the task." },
                    "durationDays": { "type": "INTEGER", "description": "Estimated duration in whole days (minimum 1, excluding weekends)." },
                    "dependencyIds": { "type": "ARRAY", "items": { "type": "INTEGER" }, "description": "An array of task IDs that must be completed before this task can start. Use an empty array if there are no dependencies." },
                    "estimatedCompletionDate": { "type": "STRING", "description": "The calculated calendar date for the task's completion, in YYYY-MM-DD format, accounting for weekends and dependencies." }
                },
                required: ["id", "description", "durationDays", "dependencyIds", "estimatedCompletionDate"]
            }
        }
    },
    required: ["title", "tasks"]
};


// 2. API Endpoint for Plan Generation
app.post('/generate-plan', async (req, res) => {
    const { goal, timeline } = req.body;

    if (!goal || !timeline) {
        return res.status(400).json({ error: "Goal and timeline are required." });
    }

    try {
        const systemPrompt = `Act as a world-class project manager and scheduling expert. Your task is to break down the user's complex goal into a structured, actionable, and logical sequence of tasks. Use realistic estimates for duration and clearly define dependencies. All output MUST be in the specified JSON format. The total duration of all critical path tasks should logically align with the user-specified timeline ('${timeline}'). Be meticulous in calculating the 'estimatedCompletionDate' for each task, starting from today.`;
        
        const userQuery = `My goal is: "${goal}". I want this plan completed "${timeline}". Break this down into a comprehensive, step-by-step project plan.`;
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: userQuery }] }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        // The response text is the guaranteed JSON string
        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        
        res.json(plan);

    } catch (error) {
        console.error('Gemini API Error:', error);
        // Send a generic 500 error to the frontend
        res.status(500).json({ error: 'Failed to generate plan due to a server-side API error.' });
    }
});


// 3. Start the Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Open your browser to http://localhost:${port}/index.html`);

});
