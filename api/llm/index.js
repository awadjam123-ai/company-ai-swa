// /api/llm/index.js
const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    context.log("llm function triggered");

    const body = req.body || {};
    const prompt = body.prompt || "";

    if (!prompt) {
      return {
        status: 400,
        headers: { "content-type": "application/json" },
        body: { error: "Missing 'prompt' in body" }
      };
    }

    // --- Azure OpenAI Environment Variables ---
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;       // e.g. https://my-openai.openai.azure.com
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;   // e.g. gpt-4o-mini

    if (!endpoint || !apiKey || !deployment) {
      throw new Error("Missing Azure OpenAI environment variables.");
    }

    // --- Azure OpenAI Chat Completions Endpoint ---
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

    // --- Azure OpenAI Request ---
    const aoaiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!aoaiResponse.ok) {
      const errorText = await aoaiResponse.text();
      throw new Error("Azure OpenAI Error: " + errorText);
    }

    const result = await aoaiResponse.json();
    const answer =
      result?.choices?.[0]?.message?.content ||
      "No response returned by Azure OpenAI.";

    // --- Successful Response ---
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: { answer }
    };

  } catch (err) {
    context.log.error("llm function error", err);

    return {
      status: 500,
      headers: { "content-type": "application/json" },
      body: { error: "Internal server error", details: String(err) }
    };
  }
};
