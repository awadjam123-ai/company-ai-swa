module.exports = async function (context, req) {
  context.log("[llm] function hit");
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    jsonBody: { ok: true, echo: req.body ?? null }
  };
};
