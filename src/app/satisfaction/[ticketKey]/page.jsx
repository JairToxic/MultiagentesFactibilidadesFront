// app/satisfaction/[ticketKey]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import toast from "react-hot-toast";
import satisfactionService from "../../../../services/satisfactionService";

export default function SatisfactionPublicPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // 🔹 ticketKey crudo (viene con %3D en la URL)
  const rawTicketKey = params.ticketKey;
  // 🔹 ticketKey decodificado (con '=' como está en la BD)
  const ticketKey = decodeURIComponent(rawTicketKey || "");

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [satisfaction, setSatisfaction] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    nps_score: null,
  });

  useEffect(() => {
    if (!ticketKey) return;
    loadTicketInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketKey]);

  const loadTicketInfo = async () => {
    try {
      setLoading(true);

      // 👉 SIEMPRE usar el ticketKey decodificado
      const response = await satisfactionService.getSatisfactionByTicketKey(
        ticketKey
      );

      setTicket(response.ticket);
      setSatisfaction(response.satisfaction);

      // Solo considerar "ya respondida" si hay survey_responded_at
      if (response.satisfaction && response.satisfaction.survey_responded_at) {
        setFormData({
          rating: response.satisfaction.rating || 0,
          comment: response.satisfaction.comment || "",
          nps_score:
            response.satisfaction.nps_score === null ||
            response.satisfaction.nps_score === undefined
              ? null
              : response.satisfaction.nps_score,
        });
        setSubmitted(true);
      } else {
        // No hay respuesta aún → formulario limpio
        setFormData({
          rating: 0,
          comment: "",
          nps_score: null,
        });
        setSubmitted(false);
      }
    } catch (error) {
      console.error("Error loading ticket:", error);
      toast.error("No se pudo cargar la información del ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    try {
      await satisfactionService.submitSatisfaction({
        // 👉 ticket_key decodificado (con '=')
        ticket_key: ticketKey,
        rating: formData.rating,
        comment: formData.comment,
        nps_score: formData.nps_score,
        response_channel: "email_survey",
        // token,  // si luego quieres validar el token, lo puedes enviar aquí
      });

      setSubmitted(true);
      toast.success(
        "¡Gracias por tu feedback! Tu opinión es muy importante para nosotros."
      );
      await loadTicketInfo();
    } catch (error) {
      console.error("Error submitting satisfaction:", error);
      toast.error("Error al enviar la encuesta");
    }
  };

  // ================= RENDER =================

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando encuesta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <h2>Ticket no encontrado</h2>
            <p>El link de la encuesta no es válido o ha expirado.</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.success}>
            <span className={styles.successIcon}>✅</span>
            <h2>¡Gracias por tu feedback!</h2>
            <p>Tu opinión nos ayuda a mejorar cada día.</p>

            <div className={styles.responseDisplay}>
              <div className={styles.ratingDisplay}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={styles.star}
                      style={{
                        color:
                          star <= formData.rating
                            ? satisfactionService.getRatingColor(
                                formData.rating
                              )
                            : "#e5e7eb",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className={styles.ratingLabel}>
                  {formData.rating}/5 -{" "}
                  {satisfactionService.getRatingLabel(formData.rating)}
                </p>
              </div>

              {formData.comment && (
                <div className={styles.commentDisplay}>
                  <strong>Tu comentario:</strong>
                  <p>{formData.comment}</p>
                </div>
              )}
            </div>

            <p className={styles.footer}>
              Ticket: <strong>{ticketKey}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.logo}>🎫</span>
          <h1 className={styles.title}>Encuesta de Satisfacción</h1>
          <p className={styles.subtitle}>
            Tu opinión es muy importante para nosotros
          </p>
        </div>

        <div className={styles.ticketInfo}>
          <p>
            <strong>Ticket:</strong> {ticketKey}
          </p>
          <p>
            <strong>Asunto:</strong> {ticket.subject}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              ¿Cómo calificarías tu experiencia? *
            </label>
            <div className={styles.starsInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.starButton}
                  onClick={() =>
                    setFormData({ ...formData, rating: star })
                  }
                  style={{
                    color:
                      star <= formData.rating
                        ? satisfactionService.getRatingColor(
                            formData.rating
                          )
                        : "#e5e7eb",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className={styles.ratingText}>
                {satisfactionService.getRatingLabel(formData.rating)}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              ¿Qué tan probable es que recomiendes nuestro servicio? (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.nps_score ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nps_score: e.target.value
                    ? parseInt(e.target.value, 10)
                    : null,
                })
              }
              placeholder="Opcional"
              className={styles.input}
            />
            <small className={styles.helpText}>
              0 = Nunca lo recomendaría, 10 = Definitivamente lo
              recomendaría
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Cuéntanos más sobre tu experiencia (opcional)
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              placeholder="Tus comentarios nos ayudan a mejorar..."
              rows={4}
              className={styles.textarea}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={formData.rating < 1}
          >
            Enviar Encuesta
          </button>
        </form>

        <p className={styles.footer}>Gracias por confiar en Inova Solutions</p>
      </div>
    </div>
  );
}
