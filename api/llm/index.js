module.exports = async function (context, req) {
  try {
    context.log("ask function triggered");

    const body = req.body || {};
    const prompt = body.prompt || "";

    if (!prompt) {
      return {
        status: 400,
        headers: { "content-type": "application/json" },
        body: { error: "Missing 'prompt' in body" }
      };
    }

    // TEMPORARY: mock LLM reply (replace with your real model later)
    const answer = `You said: ${prompt}`;

    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: { answer }
    };

  } catch (err) {
    context.log.error("ask function error", err);

    return {
      status: 500,
      headers: { "content-type": "application/json" },
      body: { error: "Internal server error", details: String(err) }
    };
  }
};
