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
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Nueva factibilidad técnica</h2>
          <p className={styles.cardSubtitle}>
            Define los datos mínimos y genera el documento con un clic.
          </p>
        </div>
        <span className={styles.badge}>Multiagentes</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.fieldGroup} id="field-session">
          <label className={styles.label}>Session ID</label>
          <input
            className={styles.input}
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            required
          />
          <p className={styles.helpText}>
            Usa el mismo ID si quieres regenerar la factibilidad para el mismo
            caso.
          </p>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Nombre del proyecto</label>
          <input
            className={styles.input}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            placeholder="Ej: Sistema de gestión empresarial"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Cliente</label>
          <input
            className={styles.input}
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            placeholder="Nombre de la empresa"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Correo de contacto</label>
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
          <label className={styles.label}>Región</label>
          <input
            className={styles.input}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="EC, US, etc."
          />
        </div>

        <div className={styles.fieldGroupSmall}>
          <label className={styles.label}>Cantidad (ej. usuarios)</label>
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
          Descripción / Requerimiento del cliente
        </label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          required
          placeholder="Describe aquí el requerimiento completo del cliente, incluyendo productos, servicios, alcance, región, cantidad de usuarios, etc."
        />
        <p className={styles.helpText}>
          Aquí puedes pegar el texto que el cliente te envió (correo,
          WhatsApp, etc.). El agente Normalizer lo procesará automáticamente.
        </p>
      </div>

      <div className={styles.advancedBox}>
        <p className={styles.advancedTitle}>Opciones avanzadas</p>

        <div className={styles.toggleRow}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={useKb}
              onChange={(e) => setUseKb(e.target.checked)}
            />
            <span className={styles.toggleLabelText}>
              Usar catálogo de productos
            </span>
          </label>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={generateQa}
              onChange={(e) => setGenerateQa(e.target.checked)}
            />
            <span className={styles.toggleLabelText}>
              Habilitar preguntas de QA
            </span>
          </label>
        </div>

        <div className={styles.docxModeRow}>
          <span className={styles.toggleLabelText}>Formato DOCX:</span>
          <button
            type="button"
            className={`${styles.docxOption} ${
              docxMode === "apa" ? styles.docxOptionActive : ""
            }`}
            onClick={() => setDocxMode("apa")}
          >
            APA (sin plantilla)
          </button>
          <button
            type="button"
            className={`${styles.docxOption} ${
              docxMode === "corp" ? styles.docxOptionActive : ""
            }`}
            onClick={() => setDocxMode("corp")}
          >
            Plantilla corporativa
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
              <span className={styles.loader}></span>
              <span>Generando factibilidad...</span>
            </>
          ) : (
            "Generar factibilidad"
          )}
        </button>
        <span className={styles.actionsHint}>
          Se ejecutarán los agentes de Normalize, Products, Scope, Pricing y QA
          según las opciones seleccionadas.
        </span>
      </div>
    </form>
  );
}