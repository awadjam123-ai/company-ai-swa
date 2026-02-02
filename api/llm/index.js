// /.azure/api/llm/index.js  OR  /api/llm/index.js

import { app } from '@azure/functions';

app.http('llm', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'llm',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const prompt = (body?.prompt || '').trim();

      if (!prompt) {
        return {
          status: 400,
          jsonBody: { error: "Missing prompt" }
        };
      }

      // TODO — replace with your LLM call
      const answer = "You said: " + prompt;

      return {
        status: 200,
        jsonBody: { answer }
      };

    } catch (err) {
      context.error("SERVER ERROR:", err);

      // CRUCIAL: return valid JSON even on error
      return {
        status: 500,
        jsonBody: {
          error: "Server crashed processing request",
          detail: String(err)
        }
      };
    }
  }
});
``
