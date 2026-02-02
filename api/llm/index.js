// File: api/llm/index.js
import { app } from '@azure/functions';

/**
 * Azure Functions v4 (ESM). Always returns JSON.
 * Works on Azure Static Web Apps (Node 18+).
 */
app.http('llm', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'llm',
  handler: async (request, context) => {
    const requestId = uuid();

    try {
      // Parse JSON safely
      const text = await request.text().catch(() => '');
      let body = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch (e) {
        return json(400, { error: 'Invalid JSON body', id: requestId, detail: String(e) });
      }

      const prompt = String(body?.prompt ?? '').trim();
      if (!prompt) {
        return json(400, { error: 'Missing prompt', id: requestId });
      }

      // TODO: Replace this with your real LLM call.
      // For now, a safe echo ensures end-to-end works.
      const answer = `You said: ${prompt}`;

      return json(200, { answer, id: requestId });
    } catch (err) {
      context.error('LLM handler error', err);
      return json(500, {
        error: 'Internal error while processing request',
        id: requestId,
        detail: String(err?.message || err)
      });
    }
  }
});

function json(status, obj) {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Optional: uncomment if you need explicit CORS for non-SWA hosting
      // 'access-control-allow-origin': '*'
    },
    body: JSON.stringify(obj)
  };
}

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // Fallback UUIDv4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
