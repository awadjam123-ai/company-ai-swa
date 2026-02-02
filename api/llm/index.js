// File: api/llm/index.js  (classic Functions model with function.json)
module.exports = async function (context, req) {
  const requestId = Math.random().toString(16).slice(2);

  try {
    const body = getBody(req);
    const prompt = String(body?.prompt ?? '').trim();

    if (!prompt) {
      return respond(context, 400, { error: 'Missing prompt', id: requestId });
    }

    // TODO: Replace with a real LLM call later.
    const answer = `You said: ${prompt}`;

    return respond(context, 200, { answer, id: requestId });
  } catch (err) {
    context.log.error('LLM handler error', err);
    return respond(context, 500, {
      error: 'Internal error while processing request',
      id: requestId,
      detail: String(err?.message || err)
    });
  }
};

function getBody(req) {
  // Functions runtime usually parses JSON into req.body if content-type is application/json.
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    if (typeof req.rawBody === 'string' && req.rawBody.length) {
      return JSON.parse(req.rawBody);
    }
  } catch (_e) {}
  return {};
}

function respond(context, status, obj) {
  context.res = {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(obj)
  };
}
