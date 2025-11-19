"use client";

import { useState } from "react";
import styles from "./FactibilidadForm.module.css";

export default function FactibilidadForm({ onSubmit, isSubmitting = false }) {
  const [sessionId, setSessionId] = useState("sess-bookings1-005");
  const [projectName, setProjectName] = useState("Licenciamiento Bookings");
  const [clientName, setClientName] = useState("Comercial Andina");
  const [contactEmail, setContactEmail] = useState("cto@comercialandina.com");
  const [region, setRegion] = useState("EC");
  const [quantity, setQuantity] = useState(20);
  const [objective, setObjective] = useState(
    "Necesito cotizar y habilitar Teams Audio Conferencing para 20 usuarios en región EC. Producto: reservas/agenda, vendor Microsoft, licencia por usuario, facturación mensual."
  );

  const [useKb, setUseKb] = useState(true);
  const [generateQa, setGenerateQa] = useState(false);
  const [docxMode, setDocxMode] = useState("apa");

  const handleSubmit = (e) => {
    e.preventDefault();

    const slots = {
      project_name: projectName,
      client_name: clientName,
      contact_email: contactEmail,
      region,
      domain: "licensing/saas",
      quantity: Number(quantity)
    };

    onSubmit({
      sessionId,
      userInput: objective,
      slots,
      useKb,
      generateQa,
      docxMode
    });
  };

  return (
    <form id="fact-form" className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.cardGlow}></div>
      
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>
            <span className={styles.titleIcon}>📊</span>
            Nueva Factibilidad Técnica
          </h2>
          <p className={styles.cardSubtitle}>
            Configuración inteligente de análisis multiagente
          </p>
        </div>
        <span className={styles.badge}>
          <span className={styles.badgeDot}></span>
          Multiagentes
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.fieldGroup} id="field-session">
          <label className={styles.label}>
            <span className={styles.labelIcon}>🔑</span>
            Session ID
          </label>
          <input
            className={styles.input}
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            required
          />
          <p className={styles.helpText}>
            Identificador único para mantener continuidad en regeneraciones
          </p>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>📁</span>
            Nombre del Proyecto
          </label>
          <input
            className={styles.input}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            placeholder="Ej: Sistema de Gestión Empresarial"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>🏢</span>
            Cliente
          </label>
          <input
            className={styles.input}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            placeholder="Nombre de la organización"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>✉️</span>
            Contacto Principal
          </label>
          <input
            type="email"
            className={styles.input}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            placeholder="contacto@empresa.com"
          />
        </div>

        <div className={styles.fieldGroupSmall}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>🌎</span>
            Región
          </label>
          <input
            className={styles.input}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="EC, US, etc."
          />
        </div>

        <div className={styles.fieldGroupSmall}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>👥</span>
            Cantidad
          </label>
          <input
            type="number"
            min={1}
            className={styles.input}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.fieldGroup} id="field-objective">
        <label className={styles.label}>
          <span className={styles.labelIcon}>📝</span>
          Descripción del Requerimiento
        </label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          required
          placeholder="Describe el alcance, productos, servicios y necesidades específicas del cliente..."
        />
        <p className={styles.helpText}>
          El agente <strong>Normalizer</strong> procesará automáticamente esta información
        </p>
      </div>

      <div className={styles.advancedBox}>
        <p className={styles.advancedTitle}>
          <span className={styles.settingsIcon}>⚙️</span>
          Configuración Avanzada
        </p>

        <div className={styles.toggleRow}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={useKb}
              onChange={(e) => setUseKb(e.target.checked)}
            />
            <span className={styles.toggleSlider}></span>
            <span className={styles.toggleLabelText}>Catálogo de Productos</span>
          </label>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={generateQa}
              onChange={(e) => setGenerateQa(e.target.checked)}
            />
            <span className={styles.toggleSlider}></span>
            <span className={styles.toggleLabelText}>Preguntas Interactivas</span>
          </label>
        </div>

        <div className={styles.docxModeRow}>
          <span className={styles.docxLabel}>Formato de Salida:</span>
          <button
            type="button"
            className={`${styles.docxOption} ${
              docxMode === "apa" ? styles.docxOptionActive : ""
            }`}
            onClick={() => setDocxMode("apa")}
          >
            <span className={styles.docxIcon}>📄</span>
            APA Estándar
          </button>
          <button
            type="button"
            className={`${styles.docxOption} ${
              docxMode === "corp" ? styles.docxOptionActive : ""
            }`}
            onClick={() => setDocxMode("corp")}
          >
            <span className={styles.docxIcon}>🏛️</span>
            Plantilla Corporativa
          </button>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button
          type="submit"
          className={styles.primaryButton}
          id="btn-generar"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner}></span>
              <span>Generando Factibilidad...</span>
            </>
          ) : (
            <>
              <span className={styles.buttonIcon}>🚀</span>
              <span>Generar Factibilidad</span>
            </>
          )}
        </button>
        <span className={styles.actionsHint}>
          Procesamiento automático: Normalize → Products → Scope → Pricing → QA
        </span>
      </div>
    </form>
  );
}