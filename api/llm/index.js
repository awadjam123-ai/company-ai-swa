// /api/llm/index.js
// Node 18+ on Azure Functions has global fetch. No need for require('node-fetch').

module.exports = async function (context, req) {
  try {
    context.log("llm function triggered", { method: req.method });

    // Allow quick browser health check
    if (req.method === 'GET') {
      return {
        status: 200,
        headers: { "content-type": "application/json" },
        body: { ok: true, route: "/api/llm", message: "LLM function is up" }
      };
    }

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
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;       // e.g. https://<resource>.openai.azure.com
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;   // e.g. gpt-4o-mini

    if (!endpoint || !apiKey || !deployment) {
      context.log.error("Missing AOAI env vars", { endpoint: !!endpoint, apiKey: !!apiKey, deployment: !!deployment });
      return {
        status: 500,
        headers: { "content-type": "application/json" },
        body: { error: "Server not configured. Missing Azure OpenAI environment variables." }
      };
    }

    // Chat Completions API (works with GPT‑4o‑mini, GPT‑3.5 etc. on AoAI)
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

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
      const errorText = await aoaiResponse.text().catch(() => "");
      context.log.error("Azure OpenAI error response", { status: aoaiResponse.status, errorText });
      return {
        status: aoaiResponse.status,
        headers: { "content-type": "application/json" },
        body: { error: "Azure OpenAI request failed", details: errorText }
      };
    }

    const result = await aoaiResponse.json();
    const answer = result?.choices?.[0]?.message?.content ?? "No response returned by Azure OpenAI.";

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
