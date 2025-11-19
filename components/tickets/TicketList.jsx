// components/TicketList.jsx
import React from 'react';
import styles from './TicketList.module.css';
import TicketCard from './TicketCard';

const TicketList = ({ tickets, loading, error, onTicketClick }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Error al cargar tickets</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📭</div>
          <h3>No hay tickets disponibles</h3>
          <p>Los nuevos tickets aparecerán aquí automáticamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{tickets.length}</span>
          <span className={styles.statLabel}>Total Tickets</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {tickets.filter(t => t.assignment?.assigned).length}
          </span>
          <span className={styles.statLabel}>Asignados</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {tickets.filter(t => t.status === 'nuevo').length}
          </span>
          <span className={styles.statLabel}>Nuevos</span>
        </div>
      </div>

      <div className={styles.grid}>
            {tickets.map((ticket, index) => (
        <div 
            key={`${ticket.ticket_id}-${index}`} 
            className={styles.cardWrapper}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <TicketCard 
            ticket={ticket} 
            onClick={() => onTicketClick(ticket)} 
            />
        </div>
        ))}

      </div>
    </div>
  );
};

export default TicketList;