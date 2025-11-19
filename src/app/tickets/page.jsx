// app/tickets/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./page.module.css";
import TicketList from "../../../components/TicketList";
import ticketsService from "../../../services/ticketsService";
import TicketDetail from "../../../components/TicketDetail";

export default function TicketsPage() {
  // 🔐 Sesión de NextAuth
  const { data: session, status } = useSession();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  // ============================
  //  Cargar tickets
  // ============================
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketsService.getAllTickets();

      // Ordenar por fecha más reciente
      const sortedTickets = data.tickets.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setTickets(sortedTickets);
      setError(null);
      setLastUpdate(new Date().toLocaleTimeString("es-EC"));
    } catch (err) {
      setError(err.message);
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar tickets al montar (solo cuando ya hay sesión)
  useEffect(() => {
    if (!session) return; // no intentes cargar si no hay usuario
    loadTickets();
  }, [loadTickets, session]);

  // Polling automático (solo si hay sesión y autoRefresh está ON)
  useEffect(() => {
    if (!session) return;
    if (!autoRefresh) return;

    const stopPolling = ticketsService.startPolling((data) => {
      const sortedTickets = data.tickets.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTickets(sortedTickets);
      setLastUpdate(new Date().toLocaleTimeString("es-EC"));
    }, 5000);

    return stopPolling;
  }, [autoRefresh, session]);

  // Abrir modal de detalle
  const handleTicketClick = async (ticket) => {
    try {
      const fullTicket = await ticketsService.getTicketById(ticket.ticket_id);
      setSelectedTicket(fullTicket);
    } catch (err) {
      console.error("Error loading ticket details:", err);
      setSelectedTicket(ticket);
    }
  };

  // Cerrar modal
  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  // Refrescar manualmente
  const handleRefresh = () => {
    loadTickets();
  };

  // ============================
  //  RENDER CONDICIONAL (después de TODOS los hooks)
  // ============================

  // Mientras NextAuth está resolviendo si hay sesión o no
  if (status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.center}>
          <p>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // Si NO está autenticado → mostramos pantalla de login
  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>🎫 Sistema de Tickets</h1>
          <p className={styles.subtitle}>
            Inicia sesión con tu cuenta corporativa para gestionar tickets.
          </p>

          <button
            className={styles.loginButton}
            onClick={() => signIn("azure-ad")}
          >
            Iniciar sesión con Microsoft
          </button>
        </div>
      </div>
    );
  }

  // Usuario autenticado → UI normal de tickets
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>🎫 Sistema de Tickets</h1>
            <p className={styles.subtitle}>
              Gestión automática de tickets con asignación inteligente
            </p>
          </div>

          <div className={styles.headerRight}>
            {/* Info de usuario logueado */}
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {session.user?.name || "Usuario"}
              </span>
              <span className={styles.userEmail}>{session.user?.email}</span>
            </div>

            {/* Botones de control */}
            <div className={styles.controls}>
              <button
                className={styles.refreshBtn}
                onClick={handleRefresh}
                disabled={loading}
              >
                <span className={loading ? styles.spinning : ""}>🔄</span>
                Refrescar
              </button>

              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className={styles.slider}></span>
                <span className={styles.toggleLabel}>
                  Auto-refresh {autoRefresh ? "ON" : "OFF"}
                </span>
              </label>

              <button
                className={styles.logoutButton}
                onClick={() => signOut()}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <TicketList
          tickets={tickets}
          loading={loading}
          error={error}
          onTicketClick={handleTicketClick}
        />
      </main>

      {/* Modal de detalles */}
      {selectedTicket && (
        <TicketDetail ticket={selectedTicket} onClose={handleCloseDetail} />
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Tickets en tiempo real
          {lastUpdate && ` • Última actualización: ${lastUpdate}`}
        </p>
      </footer>
    </div>
  );
}
