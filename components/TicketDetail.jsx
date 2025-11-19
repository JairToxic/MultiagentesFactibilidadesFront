// components/TicketDetail.jsx
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './TicketDetail.module.css';
import ticketsService from '../services/ticketsService';

const TicketDetail = ({ ticket, onClose }) => {
  const { data: session } = useSession(); // sesión NextAuth

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);

  if (!ticket) return null;

  const { classification, assignment, email } = ticket;
  const technician = assignment?.technician;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const userAccessToken = session?.user?.accessToken || null;
      const userEmail = session?.user?.email || null;

      await ticketsService.replyToTicket(
        ticket.ticket_id,
        replyText.trim(),
        null,              // messageId (por ahora null → backend responde al último inbound si usa soporte)
        userAccessToken,   // token del usuario
        userEmail          // email del usuario
      );

      setReplyText('');
      setSendSuccess('✅ Respuesta enviada al cliente correctamente.');
    } catch (err) {
      console.error(err);
      setSendError('❌ No se pudo enviar la respuesta. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  const getMessageDate = (msg) => {
    const d = msg.sent_at || msg.received_at || msg.date || msg.receivedDateTime;
    if (!d) return '';
    return ticketsService.formatDate(d);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {ticketsService.getProductIcon(classification.product)} Detalle del Ticket
          </h2>
          <div className={styles.ticketId}>{ticket.ticket_id}</div>
        </div>

        <div className={styles.modalContent}>
          {/* Email Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📧 Información del Email</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Asunto:</span>
                <span className={styles.value}>{email.subject}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>De:</span>
                <span className={styles.value}>{email.from}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Recibido:</span>
                <span className={styles.value}>
                  {ticketsService.formatDate(email.receivedDateTime)}
                </span>
              </div>
              <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.label}>Resumen del correo:</span>
                <span className={styles.value}>{email.bodyPreview}</span>
              </div>
            </div>
          </section>

          {/* Classification Section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>🏷 Clasificación automática</h3>
            <div className={styles.badgesRow}>
              <div
                className={styles.badge}
                style={{ background: ticketsService.getPriorityColor(classification.priority) }}
              >
                <strong>Prioridad:</strong> {classification.priority}
              </div>
              <div className={styles.badge} style={{ background: '#3b82f6' }}>
                <strong>Producto:</strong> {classification.product}
              </div>
              <div className={styles.badge} style={{ background: '#8b5cf6' }}>
                <strong>Categoría:</strong> {classification.category}
              </div>
            </div>
            <div className={styles.summaryBox}>
              <strong>Resumen:</strong>
              <p>{classification.summary}</p>
            </div>
          </section>

          {/* Assignment Section */}
          {assignment?.assigned && technician && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>👤 Técnico Asignado</h3>
              <div className={styles.technicianCard}>
                <div className={styles.technicianHeader}>
                  <div className={styles.techAvatar}>
                    {technician.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className={styles.techInfo}>
                    <h4>{technician.name}</h4>
                    <p className={styles.techId}>{technician.id}</p>
                  </div>
                  <div className={styles.scoreBox}>
                    <div className={styles.scoreLabel}>Match Score</div>
                    <div className={styles.scoreValue}>
                      {technician.reranker_score
                        ? `${((technician.reranker_score * 100) / 3).toFixed(0)}%`
                        : '—'}
                    </div>
                  </div>
                </div>

                {technician.profile_summary && (
                  <div className={styles.profileSummary}>
                    <strong>Perfil:</strong>
                    <p>{technician.profile_summary}</p>
                  </div>
                )}

                {technician.skills && technician.skills.length > 0 && (
                  <div className={styles.skillsSection}>
                    <strong>Habilidades:</strong>
                    <ul className={styles.skillsList}>
                      {technician.skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {technician.certifications && technician.certifications.length > 0 && (
                  <div className={styles.certificationsSection}>
                    <strong>Certificaciones:</strong>
                    <div className={styles.certBadges}>
                      {technician.certifications.map((cert, idx) => (
                        <span key={idx} className={styles.certBadge}>
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {technician.tags && technician.tags.length > 0 && (
                  <div className={styles.tagsSection}>
                    <strong>Tags:</strong>
                    <div className={styles.tags}>
                      {technician.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Técnicos alternativos */}
              {assignment.alternatives && assignment.alternatives.length > 0 && (
                <div className={styles.alternatives}>
                  <h4 className={styles.altTitle}>Técnicos alternativos</h4>
                  {assignment.alternatives.slice(0, 3).map((alt, idx) => (
                    <div key={idx} className={styles.altCard}>
                      <div className={styles.altHeader}>
                        <div className={styles.altAvatar}>
                          {alt.name.charAt(0)}
                        </div>
                        <div>
                          <p className={styles.altName}>{alt.name}</p>
                          <p className={styles.altScore}>
                            {alt.reranker_score
                              ? `Match: ${((alt.reranker_score * 100) / 3).toFixed(0)}%`
                              : 'Match: —'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Historial de conversación */}
          {ticket.messages && ticket.messages.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>💬 Historial de conversación</h3>
              <div className={styles.thread}>
                {ticket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${styles.message} ${
                      msg.direction === 'outbound' ? styles.outbound : styles.inbound
                    }`}
                  >
                    <div className={styles.messageMeta}>
                      <span className={styles.messageFrom}>
                        {msg.direction === 'outbound'
                          ? (msg.from_email || msg.from || 'Soporte')
                          : (msg.from_email || msg.from)}
                      </span>
                      <span className={styles.messageDate}>
                        {getMessageDate(msg)}
                      </span>
                    </div>
                    <div className={styles.messageBody}>
                      <pre>{msg.body}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Responder */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>✉️ Responder al cliente</h3>
            <form onSubmit={handleReplySubmit} className={styles.replyForm}>
              <textarea
                className={styles.textarea}
                placeholder="Escribe tu respuesta para el cliente..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={sending}
              />
              {sendError && <p className={styles.error}>{sendError}</p>}
              {sendSuccess && <p className={styles.success}>{sendSuccess}</p>}
              <div className={styles.replyActions}>
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? 'Enviando...' : 'Enviar respuesta'}
                </button>
              </div>
            </form>
            <p className={styles.replyHint}>
              {session?.user?.email
                ? `La respuesta se intentará enviar desde tu buzón (${session.user.email}). `
                : 'Si inicias sesión con tu cuenta corporativa, la respuesta se enviará desde tu buzón. '}
              Si no es posible, se enviará desde el buzón de soporte y quedará asociada a este ticket.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
