import { app } from '@azure/functions';

app.http('ping', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => ({
    status: 200,
    jsonBody: { ok: true, time: new Date().toISOString() }
  })
});
