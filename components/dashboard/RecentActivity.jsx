// components/dashboard/RecentActivity.jsx
import React from 'react';
import styles from './RecentActivity.module.css';
import ticketsService from '../../services/ticketsService';

const RecentActivity = ({ tickets }) => {
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>⚡ Actividad Reciente</h3>
      <div className={styles.list}>
        {recentTickets.map((ticket) => (
          <div key={ticket.ticket_id} className={styles.item}>
            <div className={styles.itemIcon}>
              {ticketsService.getProductIcon(ticket.classification?.product)}
            </div>
            <div className={styles.itemContent}>
              <p className={styles.itemTitle}>{ticket.email?.subject || 'Sin asunto'}</p>
              <p className={styles.itemSubtitle}>
                {ticket.email?.from} · {ticketsService.formatDate(ticket.created_at)}
              </p>
            </div>
            <div 
              className={styles.itemBadge}
              style={{ 
                backgroundColor: ticketsService.getPriorityColor(ticket.classification?.priority) 
              }}
            >
              {ticket.classification?.priority}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;