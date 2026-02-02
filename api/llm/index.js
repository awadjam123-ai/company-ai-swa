import { app } from '@azure/functions';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deploy = process.env.AZURE_OPENAI_DEPLOYMENT;

const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

app.http('llm', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req) => {
        try {
            const body = await req.json();
            const prompt = body?.prompt || "";

            const response = await client.getChatCompletions(deploy, [
                { role: "system", content: "You are a helpful company AI assistant." },
                { role: "user", content: prompt }
            ]);

            const answer = response.choices[0].message?.content || "(no response)";

            return {
                status: 200,
                jsonBody: { answer }
            };
        } catch (err) {
            return {
                status: 500,
                jsonBody: { error: err.message }
            };
        }
    }
});
