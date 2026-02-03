module.exports = async function (context, req) {
  try {
    context.log('llm: start');

    // Safely read and validate the JSON body
    const body = req.body || {};
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { error: "Missing 'prompt' in request body." }
      };
    }

    // TODO: call your model / service here and produce an answer
    const answer = `Echo: ${prompt}`;

    context.log('llm: success');
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { answer }
    };
  } catch (err) {
    context.log.error('llm: exception', err);
    return {
      status: 500,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Internal error', details: String(err && err.message || err) }
    };
  }
};
