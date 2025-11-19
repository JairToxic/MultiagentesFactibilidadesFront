// app/tickets/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import styles from "./page.module.css";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import TicketList from "../../../components/tickets/TicketList";
import TicketDetail from "../../../components/tickets/TicketDetail";
import ticketsService from "../../../services/ticketsService";
import TicketFilters from "../../../components/tickets/TicketFilters";
import { useTickets } from "../../../hooks/useTickets";
import { useFilters } from "../../../hooks/useFilters";

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { tickets, loading, error, refreshTickets } = useTickets();
  const { filters, filteredTickets, updateFilter, resetFilters } =
    useFilters(tickets);

  // Polling automático
  useEffect(() => {
    if (!session || !autoRefresh) return;

    const stopPolling = ticketsService.startPolling(() => {
      // El polling real se maneja en el hook useTickets si lo deseas
      refreshTickets();
    }, 5000);

    return stopPolling;
  }, [autoRefresh, session, refreshTickets]);

  const handleTicketClick = async (ticket) => {
    try {
      const fullTicket = await ticketsService.getTicketById(ticket.ticket_id);
      setSelectedTicket(fullTicket);
    } catch (err) {
      console.error("Error loading ticket details:", err);
      setSelectedTicket(ticket);
    }
  };

  const handleCloseDetail = async () => {
    setSelectedTicket(null);
    await refreshTickets();
  };

  const handleTicketUpdate = async () => {
    if (selectedTicket) {
      try {
        const updatedTicket = await ticketsService.getTicketById(
          selectedTicket.ticket_id
        );
        setSelectedTicket(updatedTicket);
      } catch (error) {
        console.error("Error updating ticket:", error);
      }
    }
    await refreshTickets();
  };

  // Calcular counts para filtros
  const ticketCounts = {
    total: tickets.length,
    nuevo: tickets.filter((t) => t.status === "nuevo").length,
    en_progreso: tickets.filter((t) => t.status === "en_progreso").length,
    resuelto: tickets.filter((t) => t.status === "resuelto").length,
    cerrado: tickets.filter((t) => t.status === "cerrado").length,
  };

  // Loading auth
  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // No autenticado
  if (!session) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <span className={styles.loginIcon}>🎫</span>
            <h1 className={styles.loginTitle}>Sistema de Tickets</h1>
            <p className={styles.loginSubtitle}>
              Gestión inteligente de tickets con asignación automática
            </p>
          </div>
          <button
            className={styles.loginButton}
            onClick={() => signIn("azure-ad")}
          >
            <span className={styles.msIcon}>🔐</span>
            Iniciar sesión con Microsoft
          </button>
          <p className={styles.loginFooter}>
            Inicia sesión con tu cuenta corporativa de Inova Solutions
          </p>
        </div>
      </div>
    );
  }

  // Usuario autenticado
  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Header
          title="🎫 Tickets"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.controls}>
            <div className={styles.controlsLeft}>
              <button
                className={styles.refreshBtn}
                onClick={refreshTickets}
                disabled={loading}
              >
                <span className={loading ? styles.spinning : ""}>🔄</span>
                Refrescar
              </button>

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>
                  Auto-refresh {autoRefresh ? "ON" : "OFF"}
                </span>
              </label>
            </div>

            <div className={styles.resultsInfo}>
              Mostrando {filteredTickets.length} de {tickets.length} tickets
            </div>
          </div>

          <TicketFilters
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            ticketCounts={ticketCounts}
            tickets={tickets}
          />

          <TicketList
            tickets={filteredTickets}
            loading={loading}
            error={error}
            onTicketClick={handleTicketClick}
          />
        </div>
      </div>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={handleCloseDetail}
          onUpdate={handleTicketUpdate}
        />
      )}
    </div>
  );
}
