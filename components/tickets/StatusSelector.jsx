// components/tickets/StatusSelector.jsx
import React, { useState } from 'react';
import styles from './StatusSelector.module.css';
import ticketsService from '../../services/ticketsService';
import toast from 'react-hot-toast';

const StatusSelector = ({ ticketId, currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statuses = [
    { code: 'nuevo', label: 'Nuevo', icon: '🆕', color: '#3b82f6' },
    { code: 'en_progreso', label: 'En Progreso', icon: '⚙️', color: '#f59e0b' },
    { code: 'pendiente', label: 'Pendiente', icon: '⏸️', color: '#8b5cf6' },
    { code: 'resuelto', label: 'Resuelto', icon: '✅', color: '#10b981' },
    { code: 'cerrado', label: 'Cerrado', icon: '🔒', color: '#6b7280' },
  ];

  const currentStatusObj = statuses.find(s => s.code === currentStatus) || statuses[0];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setUpdating(true);
    try {
      await ticketsService.updateTicketStatus(ticketId, newStatus);
      toast.success('Estado actualizado correctamente');
      onStatusChange?.(newStatus);
      setIsOpen(false);
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.statusSelector}>
      <button
        className={styles.statusButton}
        style={{ backgroundColor: currentStatusObj.color }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
      >
        <span className={styles.statusIcon}>{currentStatusObj.icon}</span>
        <span className={styles.statusLabel}>{currentStatusObj.label}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            {statuses.map((status) => (
              <button
                key={status.code}
                className={`${styles.dropdownItem} ${
                  status.code === currentStatus ? styles.active : ''
                }`}
                onClick={() => handleStatusChange(status.code)}
                disabled={updating}
              >
                <span className={styles.itemIcon}>{status.icon}</span>
                <span className={styles.itemLabel}>{status.label}</span>
                {status.code === currentStatus && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusSelector;