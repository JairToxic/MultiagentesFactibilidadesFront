// app/analytics/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import Button from "../../../components/common/Button";

import Dropdown from "../../../components/common/Dropdown";
import ticketsService from "../../../services/ticketsService";
import PerformanceMetrics from "../../../components/analytics/PerformanceMetrics";
import TechnicianPerformance from "../../../components/analytics/TechnicianPerformance";
import TrendAnalysis from "../../../components/analytics/TrendAnalysis";
import ResolutionRate from "../../../components/analytics/ResolutionRate";
import ProductBreakdown from "../../../components/analytics/ProductBreakdown";
import CategoryBreakdown from "../../../components/analytics/CategoryBreakdown";
import TicketVolumeChart from "../../../components/analytics/TicketVolumeChart";
import ResponseTimeChart from "../../../components/analytics/ResponseTimeChart";
import ExportReport from "../../../components/analytics/ExportReport";
import analyticsService from "../../../services/analyticsService";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState("7"); // días
  const [selectedTechnician, setSelectedTechnician] = useState("all");


    // ===============================
  // 🔹 Exportar reporte
  // ===============================
  const handleExport = async (format) => {
    try {
      await analyticsService.exportReport(analytics, tickets, format);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  // Redirección si está no autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/tickets");
    }
  }, [status, router]);

  // Carga de tickets + analytics
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await ticketsService.getAllTickets();
        const allTickets = data.tickets || [];
        setTickets(allTickets);

        const analyticsData = analyticsService.calculateAnalytics(
          allTickets,
          parseInt(dateRange)
        );
        setAnalytics(analyticsData);

        // DEBUG
        console.log("Tickets (analytics):", allTickets);
        console.log("Analytics technicians:", analyticsData?.technicians);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session, dateRange]);

  // ===============================
  // 🔹 Reconstruir técnicos desde tickets
  // ===============================
  const techniciansFromTickets = useMemo(() => {
    const map = new Map();

    tickets.forEach((t) => {
      const tech =
        t.assignment_json?.technician ||
        t.assignment?.technician ||
        null;

      if (!tech || tech.id == null) return;

      const key = String(tech.id);

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: tech.name || "",
          email: tech.email || "",
          displayName: tech.displayName || "",
        });
      }
    });

    const result = Array.from(map.values());
    console.log("Technicians from tickets:", result);
    return result;
  }, [tickets]);

  // ===============================
  // 🔹 Normalizar técnicos de analytics + tickets
  // ===============================
  const mergedTechnicians = useMemo(() => {
    const byId = new Map();

    // 1) Técnicos que vengan del analytics (si es que hay)
    (analytics?.technicians || []).forEach((t) => {
      if (!t) return;
      const key = String(t.id);
      byId.set(key, { ...t });
    });

    // 2) Completar con los de los tickets
    techniciansFromTickets.forEach((t) => {
      const key = String(t.id);
      const existing = byId.get(key) || { id: key };

      byId.set(key, {
        ...existing,
        name:
          existing.name && existing.name.trim() !== ""
            ? existing.name
            : t.name || t.displayName || t.email || `Técnico ${key}`,
        email: existing.email || t.email,
        displayName: existing.displayName || t.displayName,
      });
    });

    const list = Array.from(byId.values());
    console.log("Merged technicians (analytics + tickets):", list);
    return list;
  }, [analytics?.technicians, techniciansFromTickets]);

  // Helpers
  const getTechnicianDisplayName = (tech) => {
    if (!tech) return "Técnico desconocido";
    if (tech.name && tech.name.trim() !== "") return tech.name;
    if (tech.displayName && tech.displayName.trim() !== "")
      return tech.displayName;
    if (tech.email && tech.email.trim() !== "") return tech.email;
    return `Técnico ${tech.id}`;
  };

  const dateRangeOptions = [
    { value: "7", label: "Últimos 7 días" },
    { value: "15", label: "Últimos 15 días" },
    { value: "30", label: "Últimos 30 días" },
    { value: "60", label: "Últimos 60 días" },
    { value: "90", label: "Últimos 90 días" },
  ];

  const technicianOptions = [
    { value: "all", label: "Todos los técnicos" },
    ...mergedTechnicians.map((t) => ({
      value: String(t.id),
      label: getTechnicianDisplayName(t),
    })),
  ];

  const isLoadingPage = status === "loading" || loading;

  // 🔴 IMPORTANTE: los returns condicionales VAN DESPUÉS de TODOS los hooks
  if (isLoadingPage) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando analytics...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Header
          title="📈 Analytics"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.controlsLeft}>
              <h2 className={styles.pageTitle}>Análisis de rendimiento</h2>
              <p className={styles.pageSubtitle}>
                Métricas detalladas y tendencias del sistema de tickets
              </p>
            </div>

            <div className={styles.controlsRight}>
              <Dropdown
                label="Período"
                value={dateRange}
                onChange={setDateRange}
                options={dateRangeOptions}
              />

              <Dropdown
                label="Técnico"
                value={selectedTechnician}
                onChange={setSelectedTechnician}
                options={technicianOptions}
              />

              <ExportReport onExport={handleExport} />
            </div>
          </div>

          {/* Performance Metrics */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📊 Métricas de rendimiento</h3>
            <PerformanceMetrics data={analytics?.performance || {}} />
          </section>

          {/* Charts Grid */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartFull}>
              <ResponseTimeChart data={analytics?.responseTimeData || []} />
            </div>

            <div className={styles.chartFull}>
              <TicketVolumeChart data={analytics?.volumeData || []} />
            </div>

            <div className={styles.chartHalf}>
              <CategoryBreakdown data={analytics?.categoryData || {}} />
            </div>

            <div className={styles.chartHalf}>
              <ProductBreakdown data={analytics?.productData || {}} />
            </div>

            <div className={styles.chartHalf}>
              <ResolutionRate data={analytics?.resolutionData || {}} />
            </div>

            <div className={styles.chartHalf}>
              <TrendAnalysis data={analytics?.trendData || {}} />
            </div>
          </div>

          {/* Technician Performance */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>👥 Rendimiento por técnico</h3>
            <TechnicianPerformance
              technicians={mergedTechnicians}
              selectedTechnician={selectedTechnician}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
