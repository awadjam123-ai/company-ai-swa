import { app } from "@azure/functions";

app.http("llm", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (req) => {
    const prompt =
      req.method === "GET"
        ? (req.query.get("q") || "").toString()
        : ((await req.json().catch(() => ({}))).prompt || "");

    return {
      status: 200,
      jsonBody: { ok: true, message: "LLM function is alive.", echo: prompt }
    };
  }
});
