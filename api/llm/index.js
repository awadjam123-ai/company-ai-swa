import { app } from "@azure/functions";
import OpenAI from "openai";

const {
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_DEPLOYMENT,
  AZURE_OPENAI_API_VERSION = "2024-10-21"
} = process.env;

function createClient() {
  if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT) {
    throw new Error(
      "Missing Azure OpenAI env: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT"
    );
  }

  // Configure the OpenAI client for Azure OpenAI.
  // We point baseURL to the Azure deployment and pass api-version via defaultQuery.
  return new OpenAI({
    apiKey: AZURE_OPENAI_API_KEY,
    baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { "api-version": AZURE_OPENAI_API_VERSION }
  });
}

app.http("llm", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (req, ctx) => {
    try {
      const client = createClient();

      // Support both GET (?q=) and POST ({ prompt })
      let prompt;
      if (req.method === "GET") {
        prompt = (req.query.get("q") || "").toString();
      } else {
        const body = await req.json().catch(() => ({}));
        prompt = (body?.prompt || "").toString();
      }

      if (!prompt) {
        return {
          status: 400,
          jsonBody: { ok: false, error: "Missing 'prompt'." }
        };
      }

      const completion = await client.chat.completions.create({
        // For Azure deployments, 'model' can be any string; the actual model is your Azure deployment.
        model: "unused-with-azure-deployments",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      });

      const answer = completion.choices?.[0]?.message?.content ?? "";
      return {
        status: 200,
        jsonBody: { ok: true, answer }
      };
    } catch (err) {
      ctx.error(err);
      return {
        status: 500,
        jsonBody: { ok: false, error: err?.message || "Unknown error" }
      };
    }
  }
});
