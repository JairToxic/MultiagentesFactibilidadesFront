"use client";

import { useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import FuturisticIntro from "../../../components/FuturisticIntro";
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
  // Estado para controlar la intro
  const [showIntro, setShowIntro] = useState(true);
  
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
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "✓ Finalizar",
      allowClose: true,
      overlayOpacity: 0.85,
      steps: [
        {
          element: "#fact-form",
          popover: {
            title: "🎯 Formulario de Factibilidad",
            description:
              "Configure todos los parámetros del proyecto para generar un análisis técnico completo y profesional.",
            side: "left",
            align: "start"
          }
        },
        {
          element: "#field-session",
          popover: {
            title: "🔑 Session ID",
            description:
              "Identificador único que permite regenerar y mantener continuidad en sus análisis.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#field-objective",
          popover: {
            title: "📝 Requerimiento del Cliente",
            description:
              "Nuestro agente Normalizer procesará automáticamente esta información para estructurar el análisis.",
            side: "top",
            align: "start"
          }
        },
        {
          element: "#btn-generar",
          popover: {
            title: "🚀 Generar Factibilidad",
            description:
              "Inicie el proceso de análisis multiagente según la configuración seleccionada.",
            side: "top",
            align: "center"
          }
        },
        {
          element: "#result-actions",
          popover: {
            title: "📊 Resultados y Exportación",
            description:
              "Acceda a la vista previa HTML y descargue el documento en formato DOCX.",
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
    const cat = lastConfig.useKb ? "✓ Catálogo" : "✗ Catálogo";
    const qa = lastConfig.generateQa ? "✓ QA Interactivo" : "✗ QA Interactivo";
    const docx =
      lastConfig.docxMode === "apa"
        ? "📄 APA"
        : "🏛️ Corporativo";
    return `${cat}  |  ${qa}  |  ${docx}`;
  };

  const totalQuestions =
    qaMode && currentQuestion
      ? qaAnswered + qaPending + 1
      : qaAnswered + qaPending;

  return (
    <>
      {/* ===== INTRO FUTURÍSTICA ===== */}
      {showIntro && (
        <FuturisticIntro onComplete={() => setShowIntro(false)} />
      )}
      
      {/* ===== APLICACIÓN PRINCIPAL ===== */}
      <main className={styles.main}>
        <div className={styles.backgroundPattern}></div>
        
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.logoArea}>
                <span className={styles.logo}>⚡</span>
                <h1 className={styles.title}>
                  Sistema de Factibilidad Técnica
                </h1>
              </div>
              <p className={styles.subtitle}>
                Análisis multiagente inteligente para evaluación exhaustiva de proyectos empresariales
              </p>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.tourButton}
                onClick={handleTour}
              >
                <span className={styles.tourIcon}>🎯</span>
                Tour Interactivo
              </button>
            </div>
          </header>

          <section className={styles.layout}>
            <div className={styles.leftColumn}>
              <FactibilidadForm onSubmit={handleRun} isSubmitting={running} />
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.statusCard}>
                <div className={styles.statusHeader}>
                  <h2 className={styles.statusTitle}>
                    <span className={styles.statusIcon}>📡</span>
                    Estado de Orquestación
                  </h2>
                  {running && (
                    <span className={styles.statusIndicator}>
                      <span className={styles.indicatorDot}></span>
                      Procesando
                    </span>
                  )}
                </div>

                {running && (
                  <div className={styles.processingBox}>
                    <div className={styles.processingAnimation}>
                      <div className={styles.processingCircle}></div>
                      <div className={styles.processingCircle}></div>
                      <div className={styles.processingCircle}></div>
                    </div>
                    <p className={styles.processingText}>
                      Ejecutando pipeline de agentes especializados...
                    </p>
                    <div className={styles.agentFlow}>
                      <span className={styles.agentStep}>Normalizer</span>
                      <span className={styles.flowArrow}>→</span>
                      <span className={styles.agentStep}>Products</span>
                      <span className={styles.flowArrow}>→</span>
                      <span className={styles.agentStep}>Scope</span>
                      <span className={styles.flowArrow}>→</span>
                      <span className={styles.agentStep}>Pricing</span>
                      <span className={styles.flowArrow}>→</span>
                      <span className={styles.agentStep}>QA</span>
                    </div>
                  </div>
                )}

                {qaMode && currentQuestion && (
                  <div className={styles.qaBox}>
                    <div className={styles.qaHeader}>
                      <span className={styles.qaLabel}>
                        Pregunta {qaAnswered + 1} de {totalQuestions || "?"}
                      </span>
                      <span className={styles.qaProgress}>
                        <span className={styles.qaProgressBar} 
                          style={{width: `${(qaAnswered / totalQuestions) * 100}%`}}></span>
                      </span>
                    </div>
                    <p className={styles.qaQuestion}>
                      {currentQuestion.text || "Pregunta sin texto"}
                    </p>
                    <textarea
                      className={styles.qaTextarea}
                      value={qaAnswer}
                      onChange={(e) => setQaAnswer(e.target.value)}
                      placeholder="Proporcione información detallada para continuar con el análisis..."
                    />
                    <div className={styles.qaFooter}>
                      <span className={styles.qaStats}>
                        ✓ {qaAnswered} respondidas  •  ⏳ {qaPending} pendientes
                      </span>
                      <button
                        type="button"
                        className={styles.qaButton}
                        onClick={handleAnswerQuestion}
                        disabled={qaSending}
                      >
                        {qaSending ? (
                          <>
                            <span className={styles.spinner}></span>
                            Procesando respuesta...
                          </>
                        ) : (
                          <>
                            <span>Continuar</span>
                            <span className={styles.qaArrow}>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {!running && !result && !qaMode && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <p className={styles.emptyText}>
                      Configure los parámetros en el formulario y pulse{" "}
                      <strong>"Generar Factibilidad"</strong> para iniciar el análisis multiagente.
                    </p>
                  </div>
                )}

                {error && (
                  <div className={styles.errorBox}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <div>
                      <strong>Error en el proceso</strong>
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                {result && (
                  <>
                    <div className={styles.resultCard}>
                      <div className={styles.resultHeader}>
                        <div className={styles.resultBadge}>
                          <span className={styles.badgeIcon}>✓</span>
                          Análisis Completado
                        </div>
                      </div>

                      <div className={styles.resultGrid}>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Session ID</span>
                          <code className={styles.resultCode}>{result.session_id}</code>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Proyecto</span>
                          <span className={styles.resultValue}>
                            {result.slots?.project_name || "—"}
                          </span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Cliente</span>
                          <span className={styles.resultValue}>
                            {result.slots?.client_name || "—"}
                          </span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Contacto</span>
                          <span className={styles.resultValue}>
                            {result.slots?.contact_email || "—"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.objectiveBox}>
                        <span className={styles.objectiveLabel}>Objetivo del Proyecto</span>
                        <p className={styles.objectiveText}>
                          {result.slots?.objective || "—"}
                        </p>
                      </div>

                      <div className={styles.agentsUsed}>
                        <span className={styles.agentsLabel}>Agentes Ejecutados</span>
                        <div className={styles.agentsList}>
                          {(result.agents_used ||
                            result.steps?.map((s) => s.name) ||
                            []
                          ).map((name, idx) => (
                            <span key={idx} className={styles.agentChip}>
                              <span className={styles.agentDot}></span>
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {lastConfig && (
                        <div className={styles.configSummary}>
                          <span className={styles.configLabel}>Configuración</span>
                          <span className={styles.configValue}>{describeConfig()}</span>
                        </div>
                      )}

                      <div className={styles.resultActions} id="result-actions">
                        {previewUrl && (
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.previewButton}
                          >
                            <span className={styles.buttonIcon}>👁️</span>
                            Vista Previa HTML
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={handleDownloadDocx}
                          className={styles.downloadButton}
                          disabled={!sessionId || !lastConfig || downloading}
                        >
                          {downloading ? (
                            <>
                              <span className={styles.spinner}></span>
                              Descargando...
                            </>
                          ) : (
                            <>
                              <span className={styles.buttonIcon}>⬇️</span>
                              Descargar DOCX
                            </>
                          )}
                        </button>
                      </div>

                      <details className={styles.details}>
                        <summary className={styles.detailsSummary}>
                          <span className={styles.summaryIcon}>▶</span>
                          Detalle de Ejecución por Agente
                        </summary>
                        <div className={styles.stepsList}>
                          {(result.steps || []).map((step, idx) => (
                            <div key={idx} className={styles.stepCard}>
                              <div className={styles.stepHeader}>
                                <span className={styles.stepNumber}>{idx + 1}</span>
                                <span className={styles.stepName}>{step.name}</span>
                              </div>
                              {step.answer_long && (
                                <p className={styles.stepContent}>
                                  {step.answer_long}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}