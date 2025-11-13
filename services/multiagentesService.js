const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function runFullOrchestration({
  sessionId,
  userInput,
  slots,
  useKb = true,
  askMode = "none",
  debugFull = true
}) {
  const res = await fetch(`${API_BASE_URL}/orchestrate/full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      user_input: userInput,
      slots,
      use_kb: useKb,
      ask_mode: askMode,
      debug_full: debugFull
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Error ${res.status} al orquestar: ${res.statusText} ${text}`
    );
  }

  return res.json();
}

/**
 * Primer llamado al modo interactivo: arranca la sesión de QA
 */
export async function startInteractiveOrchestration({
  sessionId,
  userInput,
  slots,
  useKb = true,
  debugFull = true
}) {
  const res = await fetch(`${API_BASE_URL}/orchestrate/interactive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      user_input: userInput,
      slots,
      use_kb: useKb,
      ask_mode: "interactive",
      debug_full: debugFull
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Error ${res.status} al iniciar modo interactivo: ${res.statusText} ${text}`
    );
  }

  return res.json();
}

/**
 * Responder una pregunta del modo interactivo
 */
export async function answerInteractiveQuestion({
  sessionId,
  answerId,
  answerText,
  slotPatch = {}
}) {
  const res = await fetch(`${API_BASE_URL}/orchestrate/interactive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      answer: { id: answerId, text: answerText },
      slot_patch: slotPatch
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Error ${res.status} al responder pregunta: ${res.statusText} ${text}`
    );
  }

  return res.json();
}

export function getPreviewUrl(sessionId) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `${base}/preview?session_id=${encodeURIComponent(sessionId)}`;
}

/**
 * apa:
 *  - true  => formato APA (&apa=1)
 *  - false => plantilla corporativa (sin &apa)
 */
export async function downloadFactibilidadDocx(
  sessionId,
  { apa = true } = {}
) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  let url = `${base}/preview/docx?session_id=${encodeURIComponent(sessionId)}`;

  if (apa) {
    url += "&apa=1";
  }

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Error ${res.status} al descargar DOCX: ${res.statusText} ${text}`
    );
  }

  const blob = await res.blob();
  return blob;
}
