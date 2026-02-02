module.exports = async function (context, req) {
  context.log('[lim] test handler hit');

  return {
    // Functions v4 supports returning an object directly
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: { ok: true, echo: req.body ?? null }
  };
};
