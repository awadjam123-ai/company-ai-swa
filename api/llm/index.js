import { app } from "@azure/functions";

app.http("llm", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async () => {
    return {
      status: 200,
      jsonBody: { ok: true, message: "LLM function is alive." }
    };
  }
});
