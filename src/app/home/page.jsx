"use client";

import { useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import FactibilidadForm from "../../../components/FactibilidadForm";
import {
  runFullOrchestration,
  getPreviewUrl,
  downloadFactibilidadDocx,
  startInteractiveOrchestration,
  answerInteractiveQuestion
} from "../../../services/multiagentesService";

import styles from "../page.module.css";

export default function HomePage() {
  const [running, setRunning] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [lastConfig, setLastConfig] = useState(null);

  // Estado para modo interactivo
  const [qaMode, setQaMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [qaPending, setQaPending] = useState(0);
  const [qaAnswered, setQaAnswered] = useState(0);
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaSending, setQaSending] = useState(false);
  const [knownSlots, setKnownSlots] = useState(null);
  const [objectiveCache, setObjectiveCache] = useState("");

  const handleRun = async ({
    sessionId,
    userInput,
    slots,
    useKb,
    generateQa,
    docxMode
  }) => {
    setError(null);
    setResult(null);
    setKnownSlots(null);
    setSessionId(null);

    setLastConfig({ useKb, generateQa, docxMode });

    if (!generateQa) {
      try {
        setRunning(true);
        const resp = await runFullOrchestration({
          sessionId,
          userInput,
          slots,
          useKb,
          askMode: "none",
          debugFull: true
        });

        setSessionId(resp.session_id);
        setResult(resp);
        setQaMode(false);
        setCurrentQuestion(null);
        setQaPending(0);
        setQaAnswered(0);
        setObjectiveCache(userInput);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error inesperado");
      } finally {
        setRunning(false);
      }
      return;
    }

    try {
      setRunning(true);
      const resp = await startInteractiveOrchestration({
        sessionId,
        userInput,
        slots,
        useKb,
        debugFull: true
      });

      setSessionId(resp.session_id);
      setKnownSlots(resp.known_slots || slots);
      setQaMode(true);
      setCurrentQuestion(resp.next_question || null);
      setQaPending(resp.pending_count ?? 0);
      setQaAnswered(0);
      setObjectiveCache(userInput);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error iniciando preguntas interactivas");
      setQaMode(false);
    } finally {
      setRunning(false);
    }
  };

  const handleAnswerQuestion = async () => {
    if (!sessionId || !currentQuestion) return;
    if (!qaAnswer.trim()) {
      alert("Escribe una respuesta para continuar.");
      return;
    }

    setQaSending(true);
    setError(null);

    try {
      const resp = await answerInteractiveQuestion({
        sessionId,
        answerId: currentQuestion.id,
        answerText: qaAnswer.trim(),
        slotPatch: {}
      });

      setQaAnswer("");
      setKnownSlots(resp.known_slots || knownSlots);
      setCurrentQuestion(resp.next_question || null);
      setQaPending(resp.pending_count ?? 0);
      setQaAnswered((prev) => prev + 1);

      if (!resp.next_question && (resp.pending_count ?? 0) === 0) {
        setRunning(true);
        const full = await runFullOrchestration({
          sessionId,
          userInput: objectiveCache,
          slots: resp.known_slots || knownSlots,
          useKb: lastConfig?.useKb ?? true,
          askMode: "none",
          debugFull: true
        });
        setResult(full);
        setQaMode(false);
        setRunning(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al responder la pregunta");
    } finally {
      setQaSending(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!sessionId || !lastConfig) return;
    try {
      setDownloading(true);
      const blob = await downloadFactibilidadDocx(sessionId, {
        apa: lastConfig.docxMode === "apa"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factibilidad_${sessionId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo descargar el DOCX");
    } finally {
      setDownloading(false);
    }
  };

  const handleTour = () => {
    const d = driver({
      showProgress: true,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Listo",
      allowClose: true,
      overlayOpacity: 0.75,
      steps: [
        {
          element: "#fact-form",
          popover: {
            title: "Formulario de factibilidad",
            description:
              "Aquí completas los datos clave del proyecto para que los agentes construyan todo el documento.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#field-session",
          popover: {
            title: "Session ID",
            description:
              "Este ID te permite reutilizar y volver a generar la misma factibilidad cuantas veces quieras.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#field-objective",
          popover: {
            title: "Requerimiento del cliente",
            description:
              "Pega aquí el texto que recibiste del cliente. El agente de Normalize lo convierte en algo limpio y estructurado.",
            side: "top",
            align: "start"
          }
        },
        {
          element: "#btn-generar",
          popover: {
            title: "Generar factibilidad",
            description:
              "Según las opciones avanzadas, se ejecutará full automático o modo interactivo con preguntas.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#result-actions",
          popover: {
            title: "Preview y descarga",
            description:
              "Cuando termine, podrás abrir la vista HTML y descargar el DOCX (APA o plantilla corporativa).",
            side: "top",
            align: "center"
          }
        }
      ]
    });

    d.drive();
  };

  const previewUrl = sessionId ? getPreviewUrl(sessionId) : null;

  const describeConfig = () => {
    if (!lastConfig) return "";
    const cat = lastConfig.useKb ? "Catálogo ON" : "Catálogo OFF";
    const qa = lastConfig.generateQa ? "Preguntas QA ON" : "Preguntas QA OFF";
    const docx =
      lastConfig.docxMode === "apa"
        ? "DOCX APA"
        : "DOCX plantilla corporativa";
    return `${cat} · ${qa} · ${docx}`;
  };

  const totalQuestions =
    qaMode && currentQuestion
      ? qaAnswered + qaPending + 1
      : qaAnswered + qaPending;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Factibilidades técnicas con multiagentes
            </h1>
            <p className={styles.subtitle}>
              Orquesta Normalizer, Products, Scope, Pricing y QA desde una
              interfaz simple y lista para producción.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleTour}
            >
              Guíame por la pantalla
            </button>
          </div>
        </header>

        <section className={styles.layout}>
          <div className={styles.leftColumn}>
            <FactibilidadForm onSubmit={handleRun} isSubmitting={running} />
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.statusCard}>
              <h2 className={styles.statusTitle}>Estado de la orquestación</h2>

              {running && (
                <div className={styles.statusBadgePulse}>
                  Ejecutando agentes… Normalizer → Products → Scope → Pricing →
                  QA
                </div>
              )}

              {qaMode && currentQuestion && (
                <div className={styles.qaBox}>
                  <p className={styles.labelSm}>
                    Pregunta {qaAnswered + 1} de {totalQuestions || "?"}
                  </p>
                  <p className={styles.qaQuestion}>
                    {currentQuestion.text || "Pregunta sin texto"}
                  </p>
                  <textarea
                    className={styles.qaTextarea}
                    value={qaAnswer}
                    onChange={(e) => setQaAnswer(e.target.value)}
                    placeholder="Escribe tu respuesta para avanzar…"
                  />
                  <div className={styles.qaFooter}>
                    <span className={styles.qaProgress}>
                      Respondidas: {qaAnswered} · Pendientes: {qaPending}
                    </span>
                    <button
                      type="button"
                      className={styles.qaButton}
                      onClick={handleAnswerQuestion}
                      disabled={qaSending}
                    >
                      {qaSending ? (
                        <>
                          <span className={styles.loader}></span>
                          <span>Enviando respuesta...</span>
                        </>
                      ) : (
                        "Responder y continuar"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!running && !result && !qaMode && (
                <div className={styles.statusEmpty}>
                  <p>
                    Completa el formulario de la izquierda y pulsa{" "}
                    <strong>"Generar factibilidad"</strong> para ver el resumen
                    aquí.
                  </p>
                </div>
              )}

              {error && <div className={styles.errorBox}>{error}</div>}

              {result && (
                <>
                  <div className={styles.resultTop}>
                    <div>
                      <p className={styles.labelSm}>Session ID</p>
                      <p className={styles.code}>{result.session_id}</p>
                    </div>
                    <div>
                      <p className={styles.labelSm}>Proyecto</p>
                      <p className={styles.resultText}>
                        {result.slots?.project_name || "—"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.resultGrid}>
                    <div>
                      <p className={styles.labelSm}>Cliente / contacto</p>
                      <p className={styles.resultText}>
                        {result.slots?.client_name || "—"} ·{" "}
                        {result.slots?.contact_email || "—"}
                      </p>
                    </div>
                    <div>
                      <p className={styles.labelSm}>Objetivo</p>
                      <p className={styles.resultText}>
                        {result.slots?.objective || "—"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.chipsRow}>
                    {(result.agents_used ||
                      result.steps?.map((s) => s.name) ||
                      []
                    ).map((name, idx) => (
                      <span key={idx} className={styles.chip}>
                        {name}
                      </span>
                    ))}
                  </div>

                  {lastConfig && (
                    <div className={styles.configRow}>
                      <strong>Configuración usada:</strong> {describeConfig()}
                    </div>
                  )}

                  <div
                    className={styles.resultActions}
                    id="result-actions"
                  >
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.primaryLink}
                      >
                        Ver preview HTML
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      className={styles.outlineButton}
                      disabled={!sessionId || !lastConfig || downloading}
                    >
                      {downloading ? (
                        <>
                          <span className={styles.loader}></span>
                          <span>Descargando DOCX...</span>
                        </>
                      ) : (
                        "Descargar DOCX"
                      )}
                    </button>
                  </div>

                  <details className={styles.details}>
                    <summary>Ver detalle de pasos (steps)</summary>
                    <div className={styles.stepsList}>
                      {(result.steps || []).map((step, idx) => (
                        <div key={idx} className={styles.stepItem}>
                          <p className={styles.stepTitle}>{step.name}</p>
                          {step.answer_long && (
                            <p className={styles.stepText}>
                              {step.answer_long}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}