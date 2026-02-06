// ----- Config: update these IDs if your HTML uses different ones -----
const inputEl = document.getElementById('question');
const buttonEl = document.getElementById('askBtn');
const resultEl = document.getElementById('result');

// Optional: tweak request timeout (ms)
const REQUEST_TIMEOUT_MS = 30000;

// Utility to show messages
function show(text, isError = false) {
  if (!resultEl) return;
  resultEl.textContent = text ?? '';
  resultEl.style.color = isError ? '#ff6b6b' : '#e5e5e5';
}

// Fetch with timeout helper
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = REQUEST_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Main ask function (called on button click or Enter key)
async function ask() {
  const question = (inputEl?.value || '').trim();
  if (!question) {
    show('Please enter a question.', true);
    return;
  }

  show('Thinking…');

  try {
    const res = await fetchWithTimeout('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any custom headers your Function expects here
      },
      body: JSON.stringify({ question })
    });

    // Handle non-OK HTTP codes early
    if (!res.ok) {
      // Try to read error body as text for more context
      const errText = await res.text().catch(() => '');
      const msg = `Error: ${res.status} ${res.statusText}${errText ? ` — ${errText}` : ''}`;
      show(msg, true);
      return;
    }

    // Try JSON first; if it fails, fall back to text
    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON — show raw response
      show(text);
      return;
    }

    // Expecting { answer: "..." } but handle other shapes gracefully
    const answer =
      (data && (data.answer || data.message || data.result || data.output)) ??
      JSON.stringify(data, null, 2);

    show(answer);
  } catch (err) {
    if (err?.name === 'AbortError') {
      show('Request timed out. Please try again.', true);
    } else {
      show(`Request failed: ${err?.message || err}`, true);
    }
  }
}

// Wire up UI events
if (buttonEl) {
  buttonEl.addEventListener('click', ask);
}

if (inputEl) {
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      ask();
    }
  });
}

// Optional: focus the input on load
window.addEventListener('DOMContentLoaded', () => {
  inputEl?.focus();
});
