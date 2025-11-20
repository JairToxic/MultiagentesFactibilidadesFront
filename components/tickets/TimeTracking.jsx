// components/tickets/TimeTracking.jsx
"use client";

import React, { useState, useEffect } from 'react';
import styles from './TimeTracking.module.css';
import toast from 'react-hot-toast';
import timeTrackingService from '../../services/timeTrackingService';

export default function TimeTracking({ ticketId, userId, onUpdate }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    minutes_spent: '',
    description: '',
    billable: true,
  });

  useEffect(() => {
    if (ticketId) {
      loadEntries();
    }
  }, [ticketId]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await timeTrackingService.getTimeEntries({ ticket_id: ticketId });
      setEntries(response.entries || []);
    } catch (error) {
      toast.error('Error al cargar registros de tiempo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.minutes_spent || formData.minutes_spent <= 0) {
      toast.error('Ingresa un tiempo válido');
      return;
    }

    try {
      await timeTrackingService.logTime({
        ticket_id: ticketId,
        user_id: userId,
        minutes_spent: parseInt(formData.minutes_spent),
        description: formData.description,
        billable: formData.billable,
      });
      
      toast.success('Tiempo registrado correctamente');
      setFormData({ minutes_spent: '', description: '', billable: true });
      setShowForm(false);
      await loadEntries();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Error al registrar tiempo');
      console.error(error);
    }
  };

  const handleDelete = async (entryId) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success('Registro eliminado');
      await loadEntries();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Error al eliminar registro');
      console.error(error);
    }
  };

  const totalMinutes = entries.reduce((sum, e) => sum + (e.minutes_spent || 0), 0);
  const billableMinutes = entries
    .filter(e => e.billable)
    .reduce((sum, e) => sum + (e.minutes_spent || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>⏱️ Tiempo Trabajado</h3>
        <button
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Registrar Tiempo'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Tiempo (minutos)</label>
            <input
              type="number"
              min="1"
              value={formData.minutes_spent}
              onChange={(e) => setFormData({ ...formData, minutes_spent: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe el trabajo realizado..."
              rows={3}
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.billable}
                onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
              />
              Tiempo facturable
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Guardar
            </button>
          </div>
        </form>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total:</span>
          <span className={styles.summaryValue}>
            {timeTrackingService.formatMinutes(totalMinutes)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Facturable:</span>
          <span className={styles.summaryValue}>
            {timeTrackingService.formatMinutes(billableMinutes)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>No hay registros de tiempo</div>
      ) : (
        <div className={styles.entries}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTime}>
                  {timeTrackingService.formatMinutes(entry.minutes_spent)}
                </span>
                {entry.billable && (
                  <span className={styles.billableBadge}>Facturable</span>
                )}
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(entry.id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
              {entry.description && (
                <p className={styles.entryDescription}>{entry.description}</p>
              )}
              <div className={styles.entryMeta}>
                <span>{entry.user_name || 'Usuario'}</span>
                {entry.created_at && (
                  <span>
                    {new Date(entry.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

