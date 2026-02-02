import { app } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Read env vars
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY; // you used this name; keep it consistent in SWA settings
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-07-18";

// Validate configuration early
function createClient() {
  if (!endpoint || !apiKey || !deployment) {
    throw new Error(
      "Missing Azure OpenAI configuration. Ensure AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT are set in SWA Backend settings."
    );
  }
  // Pass apiVersion so the service honors your 2024-07-18
  return new OpenAIClient(endpoint, new AzureKeyCredential(apiKey), { apiVersion });
}

app.http("llm", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (req, ctx) => {
    try {
      const client = createClient();

      // Accept GET ?q= for quick tests, and POST { prompt }
      let prompt = "";
      if (req.method === "GET") {
        prompt = (req.query.get("q") || "").toString();
      } else {
        const body = await req.json().catch(() => ({}));
        prompt = (body?.prompt || "").toString();
      }

      if (!prompt) {
        return { status: 400, jsonBody: { ok: false, error: "Missing 'prompt'." } };
      }

      const response = await client.getChatCompletions(deployment, [
        { role: "system", content: "You are a helpful company AI assistant." },
        { role: "user", content: prompt }
      ]);

      const answer = response?.choices?.[0]?.message?.content ?? "(no response)";

      return { status: 200, jsonBody: { ok: true, answer } };
    } catch (err) {
      ctx.error(err);
      return { status: 500, jsonBody: { ok: false, error: err?.message || "Unknown error" } };
    }
  }
});
