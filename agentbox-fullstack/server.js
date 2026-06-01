import express from 'express';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load Providers from ENV
const PROVIDER = process.env.LLM_PROVIDER || 'gemini'; // 'gemini', 'openai', 'anthropic', 'deepseek'

const geminiAi = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const openaiAi = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropicAi = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const deepseekAi = process.env.DEEPSEEK_API_KEY ? new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: process.env.DEEPSEEK_API_KEY }) : null;

// System Instruction
const ORCHESTRATOR_SYSTEM_PROMPT = `You are the 'Orchestrator' of an AI Agent system.
Your job is to evaluate incoming data (sensor input) against a provided set of rules (the user's System Prompt) and context (Memory).
You must output a JSON object evaluating whether the input is safe to process automatically, or if it violates rules/safety and needs Human-in-the-Loop (HITL).

Output strictly in this JSON Format:
{
  "score": number, // 0 to 100. 100 means completely safe and compliant. 0 means critical violation.
  "decision": string, // Must be exactly "ROUTER" (if score >= 80) or "HITL" (if score < 80).
  "rationale": string, // A short, 1-2 sentence explanation of your reasoning.
  "criteria": [ // A list of exactly 3-5 criteria checked against the prompt
     { "label": "Short name of rule", "ok": true/false, "pts": 20 }
  ]
}`;

app.post('/api/evaluate', async (req, res) => {
    try {
        const { systemPrompt, sensorVal, memoryItems, provider, apiKey } = req.body;

        const reqProvider = provider || PROVIDER;
        const reqApiKey = apiKey || null;

        let gAi = geminiAi, oAi = openaiAi, aAi = anthropicAi, dAi = deepseekAi;

        if (reqApiKey) {
            if (reqProvider === 'gemini') {
                process.env.GEMINI_API_KEY = reqApiKey;
                gAi = new GoogleGenAI({ apiKey: reqApiKey });
            }
            if (reqProvider === 'openai') oAi = new OpenAI({ apiKey: reqApiKey });
            if (reqProvider === 'anthropic') aAi = new Anthropic({ apiKey: reqApiKey });
            if (reqProvider === 'deepseek') dAi = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: reqApiKey });
        }

        let contextBlock = "No past memory provided.";
        if (memoryItems && memoryItems.length > 0) {
            contextBlock = memoryItems.map((m, i) => `[Memory ${i+1}] ${m}`).join('\n');
        }

        const userPrompt = `
EVALUATE THE FOLLOWING INPUT:
---
[USER'S SYSTEM PROMPT (RULES)]
${systemPrompt || "No rules provided."}

[PAST MEMORY CONTEXT]
${contextBlock}

[INCOMING SENSOR DATA]
${sensorVal}
---
Evaluate the incoming data against the rules and context. Return the JSON response.`;

        let result;

        if (reqProvider === 'openai' && oAi) {
            console.log("➡️ Routing an OpenAI (gpt-4o-mini)...");
            const response = await oAi.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            });
            result = JSON.parse(response.choices[0].message.content);
            
        } else if (reqProvider === 'deepseek' && dAi) {
            console.log("➡️ Routing an DeepSeek (deepseek-chat)...");
            const response = await dAi.chat.completions.create({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            });
            result = JSON.parse(response.choices[0].message.content);

        } else if (reqProvider === 'anthropic' && aAi) {
            console.log("➡️ Routing an Anthropic (claude-3-5-sonnet-20241022)...");
            // Anthropic uses a slightly different API call
            const response = await aAi.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
                system: ORCHESTRATOR_SYSTEM_PROMPT,
                messages: [
                    { role: "user", content: userPrompt + "\n\nPlease output ONLY valid JSON without any markdown formatting." }
                ]
            });
            // Parse text output directly (we instruct it to return raw JSON)
            result = JSON.parse(response.content[0].text.trim());

        } else if (reqProvider === 'gemini' && gAi) {
            console.log("➡️ Routing an Google Gemini (gemini-2.5-flash)...");
            console.log("Gemini Prompt:", userPrompt.substring(0, 50) + "...");
            const response = await gAi.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            score: { type: "INTEGER" },
                            decision: { type: "STRING" },
                            rationale: { type: "STRING" },
                            criteria: { 
                                type: "ARRAY", 
                                items: { 
                                    type: "OBJECT",
                                    properties: {
                                        label: { type: "STRING" },
                                        ok: { type: "BOOLEAN" },
                                        pts: { type: "INTEGER" }
                                    },
                                    required: ["label", "ok", "pts"]
                                } 
                            }
                        },
                        required: ["score", "decision", "rationale", "criteria"]
                    }
                }
            });
            console.log("Gemini raw text response:", response.text);
            result = JSON.parse(response.text);
        
        } else {
            return res.status(500).json({ error: `Kein aktiver API-Key für Provider '${reqProvider}' gefunden.` });
        }
        
        res.json(result);

    } catch (error) {
        console.error("Error calling LLM API:", error);
        res.status(500).json({ error: "Failed to evaluate via LLM.", details: error.message });
    }
});

app.post('/api/execute', async (req, res) => {
    try {
        const { systemPrompt, sensorVal, memoryItems, provider, apiKey } = req.body;
        const reqProvider = provider || PROVIDER;
        const reqApiKey = apiKey || null;

        let oAi = openaiAi, dAi = deepseekAi;
        if (reqApiKey) {
            if (reqProvider === 'openai') oAi = new OpenAI({ apiKey: reqApiKey });
            if (reqProvider === 'deepseek') dAi = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: reqApiKey });
        }

        const activeAi = (reqProvider === 'deepseek') ? dAi : oAi;
        const modelName = (reqProvider === 'deepseek') ? 'deepseek-chat' : 'gpt-4o-mini';

        let gAi = geminiAi;
        if (reqApiKey && reqProvider === 'gemini') {
            process.env.GEMINI_API_KEY = reqApiKey; // Hack for the SDK sometimes complaining if it's not in ENV
            gAi = new GoogleGenAI({ apiKey: reqApiKey });
        }

        if (!activeAi && !gAi) {
            return res.json({ output: `[System] Kein aktiver API-Key für ${reqProvider} gefunden.` });
        }
        if (reqProvider === 'anthropic') {
            return res.json({ output: `[System] Ausführung übersprungen. Function Calling ist in diesem Lab für Anthropic noch nicht angebunden. Bitte wechsle auf OpenAI, DeepSeek oder Gemini.` });
        }

        const EXECUTE_SYSTEM_PROMPT = `You are a helpful executing AI Agent.
You MUST fulfill the user's request.
If the user asks for customer data, you MUST use the 'search_customer_db' tool.
If the user asks about suppliers, procurement, ordering materials, or comparing offers, you MUST use the 'search_supplier_db' tool.
IMPORTANT: You must adhere strictly to the rules provided in [USER'S SYSTEM PROMPT (RULES)].
If the rules forbid you from revealing certain information (e.g. credit cards, secret notes) or set budget limits, you must refuse to violate them.
Always answer in German.

[USER'S SYSTEM PROMPT (RULES)]
${systemPrompt || "No rules provided."}
`;

        const tools = [{
            type: "function",
            function: {
                name: "search_customer_db",
                description: "Sucht in der Kundendatenbank nach einem Kunden.",
                parameters: {
                    type: "object",
                    properties: { name: { type: "string", description: "Der Name des Kunden (z.B. 'Müller')" } },
                    required: ["name"],
                    additionalProperties: false
                },
                strict: true
            }
        }, {
            type: "function",
            function: {
                name: "search_supplier_db",
                description: "Sucht in der Lieferantendatenbank nach Angeboten für ein Material. Gibt alle verfügbaren Lieferanten mit Preisen, Lieferzeiten und Bewertungen zurück.",
                parameters: {
                    type: "object",
                    properties: { material: { type: "string", description: "Das gesuchte Material (z.B. 'Aluminium')" } },
                    required: ["material"],
                    additionalProperties: false
                },
                strict: true
            }
        }];

        function searchCustomerDb(nameArgs) {
            try {
                const name = JSON.parse(nameArgs).name;
                console.log(`[TOOL CALL] search_customer_db("${name}")`);
                const data = JSON.parse(fs.readFileSync('./mock_data/customers.json', 'utf8'));
                const customer = data.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
                return customer ? JSON.stringify(customer) : JSON.stringify({ error: "Kunde nicht gefunden" });
            } catch(e) {
                return JSON.stringify({ error: "Datenbankfehler" });
            }
        }

        function searchSupplierDb(materialArgs) {
            try {
                const material = JSON.parse(materialArgs).material;
                console.log(`[TOOL CALL] search_supplier_db("${material}")`);
                const data = JSON.parse(fs.readFileSync('./mock_data/suppliers.json', 'utf8'));
                const matches = data.filter(s => s.material.toLowerCase().includes(material.toLowerCase()));
                return matches.length > 0 ? JSON.stringify(matches) : JSON.stringify({ error: "Keine Lieferanten für dieses Material gefunden" });
            } catch(e) {
                return JSON.stringify({ error: "Datenbankfehler" });
            }
        }

        let messages = [
            { role: "system", content: EXECUTE_SYSTEM_PROMPT },
            { role: "user", content: sensorVal }
        ];

        if (reqProvider === 'gemini') {
            console.log(`➡️ [EXECUTE] Starte Agent Loop mit Gemini...`);
            const geminiTools = [{
                functionDeclarations: [{
                    name: "search_customer_db",
                    description: "Sucht in der Kundendatenbank nach einem Kunden.",
                    parameters: {
                        type: "OBJECT",
                        properties: { name: { type: "STRING", description: "Der Name des Kunden (z.B. 'Müller')" } },
                        required: ["name"]
                    }
                }, {
                    name: "search_supplier_db",
                    description: "Sucht in der Lieferantendatenbank nach Angeboten für ein Material. Gibt alle verfügbaren Lieferanten mit Preisen, Lieferzeiten und Bewertungen zurück.",
                    parameters: {
                        type: "OBJECT",
                        properties: { material: { type: "STRING", description: "Das gesuchte Material (z.B. 'Aluminium')" } },
                        required: ["material"]
                    }
                }]
            }];

            let geminiMessages = [{ role: 'user', parts: [{ text: sensorVal }] }];
            
            let response = await gAi.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: geminiMessages,
                config: { systemInstruction: EXECUTE_SYSTEM_PROMPT, tools: geminiTools }
            });

            let toolLogs = "";
            if (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                toolLogs += `[TOOL CALL] Werkzeug aufgerufen: ${call.name}(${JSON.stringify(call.args)})\n`;
                let functionResponse;
                if (call.name === "search_customer_db") {
                    functionResponse = searchCustomerDb(JSON.stringify(call.args));
                } else if (call.name === "search_supplier_db") {
                    functionResponse = searchSupplierDb(JSON.stringify(call.args));
                }
                if (functionResponse) {
                    toolLogs += `[TOOL RESP] Daten erhalten: ${functionResponse.substring(0, 120)}...\n\n`;
                    geminiMessages.push({ role: 'model', parts: [{ functionCall: call }] });
                    geminiMessages.push({
                        role: 'user',
                        parts: [{
                            functionResponse: {
                                name: call.name,
                                response: JSON.parse(functionResponse)
                            }
                        }]
                    });

                    console.log(`➡️ [EXECUTE] Gemini hat Daten erhalten. Generiere finale Antwort...`);
                    response = await gAi.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: geminiMessages,
                        config: { systemInstruction: EXECUTE_SYSTEM_PROMPT, tools: geminiTools }
                    });
                }
            }
            return res.json({ output: toolLogs + response.text });
        }

        // OPENAI & DEEPSEEK
        console.log(`➡️ [EXECUTE] Starte Agent Loop mit ${modelName}...`);
        let response = await activeAi.chat.completions.create({
            model: modelName,
            messages: messages,
            tools: tools
        });
        
        let toolLogs = "";
        let responseMessage = response.choices[0].message;
        if (responseMessage.tool_calls) {
            messages.push(responseMessage);
            for (const toolCall of responseMessage.tool_calls) {
                toolLogs += `[TOOL CALL] Werkzeug aufgerufen: ${toolCall.function.name}(${toolCall.function.arguments})\n`;
                let functionResponse;
                if (toolCall.function.name === "search_customer_db") {
                    functionResponse = searchCustomerDb(toolCall.function.arguments);
                } else if (toolCall.function.name === "search_supplier_db") {
                    functionResponse = searchSupplierDb(toolCall.function.arguments);
                }
                if (functionResponse) {
                    toolLogs += `[TOOL RESP] Daten erhalten: ${functionResponse.substring(0, 120)}...\n\n`;
                    messages.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: toolCall.function.name,
                        content: functionResponse,
                    });
                }
            }
            console.log(`➡️ [EXECUTE] LLM hat Daten erhalten. Generiere finale Antwort...`);
            response = await activeAi.chat.completions.create({
                model: modelName,
                messages: messages
            });
            responseMessage = response.choices[0].message;
        }

        res.json({ output: toolLogs + responseMessage.content });

    } catch (error) {
        console.error("Error during execution:", error);
        res.status(500).json({ error: "Execution failed", details: error.message });
    }
});


app.get('/api/config', (req, res) => {
    try {
        const defaultProvider = process.env.LLM_PROVIDER || 'gemini';
        const keysConfigured = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY);
        res.json({
            provider: defaultProvider,
            anyKeyConfigured: keysConfigured
        });
    } catch (e) {
        res.status(500).json({ error: "Fehler beim Laden der Konfiguration" });
    }
});


app.get('/api/database/:name', (req, res) => {
    try {
        const name = req.params.name;
        if (name === 'customers' || name === 'suppliers') {
            const data = fs.readFileSync(`./mock_data/${name}.json`, 'utf8');
            return res.json(JSON.parse(data));
        }
        res.status(400).json({ error: "Ungültige Datenbank" });
    } catch (e) {
        console.error("Fehler beim Lesen der Mock-Datenbank:", e);
        res.status(500).json({ error: "Fehler beim Lesen der Mock-Datenbank" });
    }
});


app.post('/api/test', async (req, res) => {
    try {
        const { provider, apiKey } = req.body;
        if (!apiKey) return res.status(400).json({ error: "Kein API Key angegeben" });
        
        let result = "Test erfolgreich!";
        if (provider === 'openai') {
            const oAi = new OpenAI({ apiKey });
            await oAi.chat.completions.create({ model: "gpt-4o-mini", messages: [{role: "user", content: "Hi"}] });
        } else if (provider === 'gemini') {
            const gAi = new GoogleGenAI({ apiKey });
            await gAi.models.generateContent({ model: "gemini-2.5-flash", contents: [{role: "user", parts: [{text: "Hi"}]}] });
        } else if (provider === 'deepseek') {
            const dAi = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });
            await dAi.chat.completions.create({ model: "deepseek-chat", messages: [{role: "user", content: "Hi"}] });
        }
        res.json({ success: true, message: `Verbindung zu ${provider} erfolgreich hergestellt!` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 AgentBox Backend is running on http://localhost:${PORT}`);
});
