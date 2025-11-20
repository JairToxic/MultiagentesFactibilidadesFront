// components/tickets/TicketDetail.jsx
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./TicketDetail.module.css";
import ticketsService from "../../services/ticketsService";
import StatusSelector from "./StatusSelector";
import TechnicianSelector from "./TechnicianSelector";
import TimeTracking from "./TimeTracking";
import SatisfactionSurvey from "./SatisfactionSurvey";
import AssignmentsDisplay from "./AssignmentsDisplay";
import toast from "react-hot-toast";

const TicketDetail = ({ ticket, onClose, onUpdate }) => {
  const { data: session } = useSession();
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [currentTechnicians, setCurrentTechnicians] = useState([]);

  const [activeTab, setActiveTab] = useState("details");

  const getTechniciansFromAssignment = (rawAssignment) => {
    if (!rawAssignment) return [];

    let assignment = rawAssignment;
    if (typeof assignment === "string") {
      try {
        assignment = JSON.parse(rawAssignment);
      } catch (err) {
        console.error("No se pudo parsear assignment_json", err, rawAssignment);
        return [];
      }
    }

    const technicians = assignment.technicians || [];
    if (technicians.length > 0) return technicians;

    if (assignment.technician) {
      return [assignment.technician];
    }

    return [];
  };

  useEffect(() => {
    setCurrentStatus(ticket.status);
    const assignment = ticket.assignment_json || ticket.assignment || {};
    setCurrentTechnicians(getTechniciansFromAssignment(assignment));
  }, [ticket]);

  if (!ticket) return null;

  const { classification, email } = ticket;
  const isAssigned = currentTechnicians.length > 0;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);

    try {
      const userAccessToken = session?.user?.accessToken || null;
      const userEmail = session?.user?.email || null;

      await ticketsService.replyToTicket(
        ticket.ticket_id,
        replyText.trim(),
        null,
        userAccessToken,
        userEmail
      );

      setReplyText("");
      toast.success("✅ Respuesta enviada correctamente");

      if (onUpdate) {
        setTimeout(() => {
          onUpdate();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al enviar la respuesta");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const result = await ticketsService.updateTicketStatus(
        ticket.ticket_id,
        newStatus,
        session?.user?.email || "system"
      );

      setCurrentStatus(newStatus);
      
      if (result.ticket) {
        Object.assign(ticket, result.ticket);
      } else {
        ticket.status = newStatus;
      }

      toast.success("Estado actualizado correctamente");

      if (onUpdate) {
        setTimeout(() => {
          onUpdate();
        }, 500);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleTechnicianChange = async (technicianId, action = 'add') => {
    try {
      let result;

      if (action === 'unassign_all') {
        // Para desasignar todos, enviamos null explícitamente
        result = await ticketsService.assignTechnician(
          ticket.ticket_id,
          null,
          session?.user?.email || "system"
        );
      } else if (action === 'remove') {
        result = await ticketsService.unassignTechnician(
          ticket.ticket_id,
          technicianId,
          session?.user?.email || "system"
        );
      } else {
        result = await ticketsService.assignTechnician(
          ticket.ticket_id,
          technicianId,
          session?.user?.email || "system"
        );
      }

      if (result.ticket) {
        Object.assign(ticket, result.ticket);
        const assignment = result.ticket.assignment_json || result.ticket.assignment || {};
        setCurrentTechnicians(getTechniciansFromAssignment(assignment));
      } else if (result.assignment) {
        ticket.assignment_json = result.assignment;
        setCurrentTechnicians(getTechniciansFromAssignment(result.assignment));
      }

      if (onUpdate) {
        setTimeout(() => {
          onUpdate();
        }, 500);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getMessageDate = (msg) => {
    const d =
      msg.sent_at || msg.received_at || msg.date || msg.receivedDateTime;
    if (!d) return "";
    return ticketsService.formatDate(d);
  };

  const getStatusIcon = (status) => {
    const icons = {
      nuevo: "🆕",
      en_progreso: "⚙️",
      pendiente: "⏸️",
      resuelto: "✅",
      cerrado: "🔒",
    };
    return icons[status] || "📋";
  };

  const getStatusColorValue = (status) => {
    const colors = {
      nuevo: "#3b82f6",
      en_progreso: "#f59e0b",
      pendiente: "#8b5cf6",
      resuelto: "#10b981",
      cerrado: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const buildTimeline = () => {
    const events = [];

    events.push({
      type: "created",
      icon: "🎫",
      title: "Ticket creado",
      description: `Por ${ticket.email?.from || "Cliente"}`,
      timestamp: ticket.created_at,
      color: "#3b82f6",
      user: ticket.email?.from || "Cliente",
    });

    if (ticket.history && ticket.history.length > 0) {
      ticket.history.forEach((change) => {
        let icon = "📝";
        let color = "#6b7280";
        let title = change.description || "Cambio registrado";

        if (change.change_type === "status_change") {
          icon = getStatusIcon(change.new_value);
          color = getStatusColorValue(change.new_value);
          title = `Estado cambiado a "${change.new_value}"`;
        } else if (change.change_type === "assignment") {
          icon = "👤";
          color = "#8b5cf6";
          title = "Asignación modificada";
        }

        events.push({
          type: change.change_type,
          icon,
          title,
          description: change.description,
          timestamp: change.created_at,
          color,
          user: change.changed_by,
        });
      });
    }

    ticket.messages?.forEach((msg, idx) => {
      if (msg.direction === "outbound") {
        events.push({
          type: "reply",
          icon: "💬",
          title: "Respuesta enviada",
          description: `Por ${msg.from_email || "Soporte"}`,
          timestamp: msg.sent_at || msg.created_at,
          color: "#10b981",
          user: msg.from_email || "Soporte",
        });
      } else if (idx > 0) {
        events.push({
          type: "message",
          icon: "📨",
          title: "Nuevo mensaje del cliente",
          description: `De ${msg.from_email || "Cliente"}`,
          timestamp: msg.received_at || msg.created_at,
          color: "#f59e0b",
          user: msg.from_email || "Cliente",
        });
      }
    });

    return events.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  };

  const timeline = buildTimeline();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>
              {ticketsService.getProductIcon(classification.product)} Detalle
              del Ticket
            </h2>
            <div className={styles.ticketId}>{ticket.ticket_id}</div>
          </div>

          <div className={styles.headerRight}>
            <StatusSelector
              ticketId={ticket.ticket_id}
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
            />
            <TechnicianSelector
              ticketId={ticket.ticket_id}
              currentTechnicians={currentTechnicians}
              onTechnicianChange={handleTechnicianChange}
            />
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "details" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("details")}
          >
            📋 Detalles
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "history" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("history")}
          >
            💬 Conversación
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "timeline" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("timeline")}
          >
            🕐 Trazabilidad
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "time" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("time")}
          >
            ⏱️ Tiempo
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "satisfaction" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("satisfaction")}
          >
            ⭐ Satisfacción
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "assignments" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("assignments")}
          >
            👥 Técnicos ({currentTechnicians.length})
          </button>
        </div>

        <div className={styles.modalContent}>
          {activeTab === "details" && (
            <>
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
                  <div
                    className={styles.infoItem}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <span className={styles.label}>Resumen del correo:</span>
                    <span className={styles.value}>{email.bodyPreview}</span>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  🏷 Clasificación automática
                </h3>
                <div className={styles.badgesRow}>
                  <div
                    className={styles.badge}
                    style={{
                      background: ticketsService.getPriorityColor(
                        classification.priority
                      ),
                    }}
                  >
                    <strong>Prioridad:</strong> {classification.priority}
                  </div>
                  <div
                    className={styles.badge}
                    style={{ background: "#3b82f6" }}
                  >
                    <strong>Producto:</strong> {classification.product}
                  </div>
                  <div
                    className={styles.badge}
                    style={{ background: "#8b5cf6" }}
                  >
                    <strong>Categoría:</strong> {classification.category}
                  </div>
                </div>
                <div className={styles.summaryBox}>
                  <strong>Resumen:</strong>
                  <p>{classification.summary}</p>
                </div>
              </section>

              <section className={styles.section}>
                <AssignmentsDisplay technicians={currentTechnicians} />
              </section>
            </>
          )}

          {activeTab === "history" && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                💬 Historial de conversación
              </h3>
              <div className={styles.thread}>
                {ticket.messages && ticket.messages.length > 0 ? (
                  ticket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${styles.message} ${
                        msg.direction === "outbound"
                          ? styles.outbound
                          : styles.inbound
                      }`}
                    >
                      <div className={styles.messageMeta}>
                        <span className={styles.messageFrom}>
                          {msg.direction === "outbound"
                            ? msg.from_email || msg.from || "Soporte"
                            : msg.from_email || msg.from}
                        </span>
                        <span className={styles.messageDate}>
                          {getMessageDate(msg)}
                        </span>
                      </div>
                      <div className={styles.messageBody}>
                        <pre>{msg.body}</pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noMessages}>
                    No hay mensajes en el historial
                  </p>
                )}
              </div>
            </section>
          )}

          {activeTab === "timeline" && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                🕐 Trazabilidad completa
              </h3>
              <div className={styles.timeline}>
                {timeline.map((event, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div
                      className={styles.timelineIcon}
                      style={{ backgroundColor: event.color }}
                    >
                      {event.icon}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <h4 className={styles.timelineTitle}>
                          {event.title}
                        </h4>
                      </div>
                      <p className={styles.timelineDescription}>
                        {event.description}
                      </p>
                      {/* ✅ FECHA COMPLETA */}
                      <span className={styles.timelineDate}>
                        📅 {ticketsService.formatCompactDate(event.timestamp)}
                      </span>
                      {event.user && (
                        <span className={styles.timelineUser}>
                          <span className={styles.userIcon}>👤</span>
                          {event.user}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "time" && (
            <section className={styles.section}>
              <TimeTracking
                ticketId={ticket.id}
                userId={session?.user?.id || session?.user?.email}
                onUpdate={onUpdate}
              />
            </section>
          )}

          {activeTab === "satisfaction" && (
            <section className={styles.section}>
              <SatisfactionSurvey
                ticketId={ticket.id}
                customerEmail={ticket.email?.from || ticket.requester_email}
                onUpdate={onUpdate}
              />
            </section>
          )}

          {activeTab === "assignments" && (
            <section className={styles.section}>
              <div className={styles.assignmentsSection}>
                <div className={styles.assignmentsHeader}>
                  <h3 className={styles.sectionTitle}>
                    👥 Técnicos Asignados ({currentTechnicians.length})
                  </h3>
                  <TechnicianSelector
                    ticketId={ticket.ticket_id}
                    currentTechnicians={currentTechnicians}
                    onTechnicianChange={handleTechnicianChange}
                  />
                </div>
                <AssignmentsDisplay technicians={currentTechnicians} />
              </div>
            </section>
          )}

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
              <div className={styles.replyActions}>
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? "Enviando..." : "Enviar respuesta"}
                </button>
              </div>
            </form>
            <p className={styles.replyHint}>
              {session?.user?.email
                ? `La respuesta se enviará desde tu buzón (${session.user.email}). `
                : "Si inicias sesión, la respuesta se enviará desde tu buzón. "}
              Si no es posible, se enviará desde el buzón de soporte.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
