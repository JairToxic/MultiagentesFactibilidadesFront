// components/TicketCard.jsx
import React from 'react';
import styles from './TicketCard.module.css';
import ticketsService from '../../services/ticketsService';
import AssignmentsDisplay from './AssignmentsDisplay';

// Helper para normalizar assignment_json
const getAssignmentFromTicket = (ticket) => {
  if (!ticket) return null;

  let assignment = ticket.assignment_json || ticket.assignment;

  if (assignment && typeof assignment === 'string') {
    try {
      assignment = JSON.parse(assignment);
    } catch (e) {
      console.warn('assignment_json no es JSON válido en TicketCard', assignment);
      assignment = null;
    }
  }

  return assignment;
};

const TicketCard = ({ ticket, onClick }) => {
  const { classification, email, status, created_at } = ticket;

  const assignment = getAssignmentFromTicket(ticket);
  
  // Obtener técnicos asignados (puede ser array ahora)
  const technicians = assignment?.technicians || [];
  const singleTechnician = assignment?.technician; // backward compatibility
  
  const assignedTechnicians = technicians.length > 0 
    ? technicians 
    : (singleTechnician ? [singleTechnician] : []);
  
  const isAssigned = assignment?.assigned && assignedTechnicians.length > 0;

  const statusLabelMap = {
    nuevo: '🆕 Nuevo',
    en_progreso: '⚙️ En progreso',
    resuelto: '✅ Resuelto',
    cerrado: '🔒 Cerrado',
    pendiente: '⏸️ Pendiente',
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.ticketInfo}>
          <span className={styles.ticketId}>{ticket.ticket_id}</span>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: ticketsService.getStatusColor(status) }}
          >
            {statusLabelMap[status] || status || 'Sin estado'}
          </span>
        </div>
        <div
          className={styles.priority}
          style={{
            backgroundColor: ticketsService.getPriorityColor(
              classification.priority
            ),
          }}
        >
          {classification.priority}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.emailInfo}>
          <h3 className={styles.subject}>
            {ticketsService.getProductIcon(classification.product)}{' '}
            {email.subject}
          </h3>
          <p className={styles.from}>De: {email.from}</p>
          <p className={styles.summary}>{classification.summary}</p>
        </div>

        <div className={styles.meta}>
          <div className={styles.category}>
            {ticketsService.getCategoryIcon(classification.category)}{' '}
            {classification.category}
          </div>
          <div className={styles.product}>{classification.product}</div>
        </div>
      </div>

      {isAssigned ? (
        <div className={styles.footer}>
          <div className={styles.technicianInfo}>
            {assignedTechnicians.length === 1 ? (
              <>
                <div className={styles.avatar}>
                  {assignedTechnicians[0].name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className={styles.techDetails}>
                  <p className={styles.techName}>{assignedTechnicians[0].name}</p>
                  <p className={styles.techScore}>
                    Match:{' '}
                    {assignedTechnicians[0].reranker_score
                      ? `${(
                          (assignedTechnicians[0].reranker_score * 100) /
                          3
                        ).toFixed(0)}%`
                      : '—'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.avatarGroup}>
                  {assignedTechnicians.slice(0, 3).map((tech, idx) => (
                    <div 
                      key={tech.id || idx} 
                      className={styles.avatarSmall}
                      style={{ zIndex: 3 - idx }}
                      title={tech.name}
                    >
                      {tech.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  ))}
                  {assignedTechnicians.length > 3 && (
                    <div className={styles.avatarSmall} style={{ zIndex: 0 }}>
                      +{assignedTechnicians.length - 3}
                    </div>
                  )}
                </div>
                <div className={styles.techDetails}>
                  <p className={styles.techName}>
                    {assignedTechnicians.length} técnicos asignados
                  </p>
                  <p className={styles.techScore}>
                    {assignedTechnicians.map(t => t.name).join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className={styles.assignedBadge}>✓ Asignado</div>
        </div>
      ) : (
        <div className={styles.footer}>
          <div className={styles.technicianInfo}>
            <div className={styles.avatar}>?</div>
            <div className={styles.techDetails}>
              <p className={styles.techName}>Sin asignar</p>
              <p className={styles.techScore}>Match: —</p>
            </div>
          </div>
          <div className={`${styles.assignedBadge} ${styles.unassigned}`}>
            Sin asignar
          </div>
        </div>
      )}

      <div className={styles.timestamp}>
        {ticketsService.formatDate(created_at)}
      </div>
    </div>
  );
};

export default TicketCard;