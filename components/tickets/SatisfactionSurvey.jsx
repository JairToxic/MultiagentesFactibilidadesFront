// components/tickets/SatisfactionSurvey.jsx
"use client";

import React, { useState, useEffect } from 'react';
import styles from './SatisfactionSurvey.module.css';
import toast from 'react-hot-toast';
import satisfactionService from '../../services/satisfactionService';

export default function SatisfactionSurvey({ ticketId, customerEmail, onUpdate }) {
  const [satisfaction, setSatisfaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    nps_score: null,
  });

  useEffect(() => {
    if (ticketId) {
      loadSatisfaction();
    }
  }, [ticketId]);

  const loadSatisfaction = async () => {
    try {
      setLoading(true);
      const response = await satisfactionService.getTicketSatisfaction(ticketId);
      if (response.satisfaction) {
        setSatisfaction(response.satisfaction);
        setFormData({
          rating: response.satisfaction.rating || 0,
          comment: response.satisfaction.comment || '',
          nps_score: response.satisfaction.nps_score || null,
        });
      }
    } catch (error) {
      // No hay satisfacción aún, está bien
      setSatisfaction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Selecciona una calificación');
      return;
    }

    try {
      setSubmitting(true);
      await satisfactionService.submitSatisfaction({
        ticket_id: ticketId,
        rating: formData.rating,
        comment: formData.comment,
        nps_score: formData.nps_score,
        customer_email: customerEmail,
        response_channel: 'web',
      });
      
      toast.success('¡Gracias por tu feedback!');
      await loadSatisfaction();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Error al enviar la encuesta');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (satisfaction) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>⭐ Satisfacción del Cliente</h3>
        <div className={styles.response}>
          <div className={styles.ratingDisplay}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={styles.star}
                  style={{
                    color: star <= satisfaction.rating
                      ? satisfactionService.getRatingColor(satisfaction.rating)
                      : '#e5e7eb',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <span className={styles.ratingLabel}>
              {satisfaction.rating}/5 - {satisfactionService.getRatingLabel(satisfaction.rating)}
            </span>
          </div>
          
          {satisfaction.comment && (
            <div className={styles.comment}>
              <strong>Comentario:</strong>
              <p>{satisfaction.comment}</p>
            </div>
          )}
          
          {satisfaction.nps_score !== null && (
            <div className={styles.nps}>
              <strong>NPS Score:</strong>
              <span
                className={styles.npsValue}
                style={{ color: satisfactionService.getNPSColor(satisfaction.nps_score) }}
              >
                {satisfaction.nps_score}/10 - {satisfactionService.getNPSLabel(satisfaction.nps_score)}
              </span>
            </div>
          )}
          
          <div className={styles.meta}>
            Respondido el:{' '}
            {new Date(satisfaction.survey_responded_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>⭐ Encuesta de Satisfacción</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.ratingSection}>
          <label className={styles.label}>Calificación (1-5 estrellas)</label>
          <div className={styles.starsInput}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={styles.starButton}
                onClick={() => setFormData({ ...formData, rating: star })}
                style={{
                  color: star <= formData.rating
                    ? satisfactionService.getRatingColor(formData.rating)
                    : '#e5e7eb',
                }}
              >
                ★
              </button>
            ))}
          </div>
          {formData.rating > 0 && (
            <span className={styles.ratingText}>
              {satisfactionService.getRatingLabel(formData.rating)}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>NPS Score (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={formData.nps_score || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                nps_score: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="Opcional"
            className={styles.input}
          />
          <small className={styles.helpText}>
            ¿Qué tan probable es que recomiendes nuestro servicio?
          </small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Comentario (opcional)</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Comparte tus comentarios..."
            rows={4}
            className={styles.textarea}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting || formData.rating < 1}
        >
          {submitting ? 'Enviando...' : 'Enviar Encuesta'}
        </button>
      </form>
    </div>
  );
}

