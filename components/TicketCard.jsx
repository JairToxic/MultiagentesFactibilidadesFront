// components/TicketCard.jsx
import React from 'react';
import styles from './TicketCard.module.css';
import ticketsService from '../services/ticketsService';

const TicketCard = ({ ticket, onClick }) => {
  const { classification, assignment, email, status, created_at } = ticket;
  const technician = assignment?.technician;

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.ticketInfo}>
          <span className={styles.ticketId}>{ticket.ticket_id}</span>
          <span className={styles.statusBadge}>
            {status === 'nuevo' ? '🆕 Nuevo' : status}
          </span>
        </div>
        <div
          className={styles.priority}
          style={{
            backgroundColor: ticketsService.getPriorityColor(classification.priority),
          }}
        >
          {classification.priority}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.emailInfo}>
          <h3 className={styles.subject}>
            {ticketsService.getProductIcon(classification.product)} {email.subject}
          </h3>
          <p className={styles.from}>De: {email.from}</p>
          <p className={styles.summary}>{classification.summary}</p>
        </div>

        <div className={styles.meta}>
          <div className={styles.category}>
            {ticketsService.getCategoryIcon(classification.category)} {classification.category}
          </div>
          <div className={styles.product}>{classification.product}</div>
        </div>
      </div>

      {assignment?.assigned && technician && (
        <div className={styles.footer}>
          <div className={styles.technicianInfo}>
            <div className={styles.avatar}>
              {technician.name.charAt(0)}
            </div>
            <div className={styles.techDetails}>
              <p className={styles.techName}>{technician.name}</p>
              <p className={styles.techScore}>
                Match: {(technician.reranker_score * 100 / 3).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className={styles.assignedBadge}>✓ Asignado</div>
        </div>
      )}

      <div className={styles.timestamp}>
        {ticketsService.formatDate(created_at)}
      </div>
    </div>
  );
};

export default TicketCard;
