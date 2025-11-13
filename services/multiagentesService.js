const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function runFullOrchestration({
  sessionId,
  userInput,
  slots,
  useKb = true,
  askMode = "none",      // así no te manda QA si no quieres
  debugFull = true       // para ver todos los slots en la respuesta
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

export function getPreviewUrl(sessionId) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `${base}/preview?session_id=${encodeURIComponent(sessionId)}`;
}

export async function downloadFactibilidadDocx(sessionId, { apa = true } = {}) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const url = `${base}/preview/docx?session_id=${encodeURIComponent(
    sessionId
  )}${apa ? "&apa=1" : ""}`;

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
