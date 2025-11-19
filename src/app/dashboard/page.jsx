// app/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Sidebar from '../../../components/layout/Sidebar';
import Header from '../../../components/layout/Header';
import StatsCard from '../../../components/dashboard/StatsCard';
import ActivityChart from '../../../components/dashboard/ActivityChart';
import PriorityDistribution from '../../../components/dashboard/PriorityDistribution';
import RecentActivity from '../../../components/dashboard/RecentActivity';
import ticketsService from '../../../services/ticketsService';
import dashboardService from '../../../services/dashboardService';
import analyticsService from '../../../services/analyticsService'; // 👈 NUEVO

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/tickets');
    }
  }, [status, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ticketsService.getAllTickets();
        const allTickets = data.tickets || [];
        setTickets(allTickets);

        // 📌 Stats “clásicas” del dashboard
        const calculatedStats = dashboardService.calculateStats(allTickets);

        // 📌 Usar analyticsService para el tiempo promedio de resolución
        //    (usamos todos los tickets del último año, por ejemplo 365 días)
        const analytics = analyticsService.calculateAnalytics(allTickets, 365);
        const avgResolutionHours =
          analytics?.performance?.avgResolutionHours || 0;
        const avgResolutionMinutes = Math.round(avgResolutionHours * 60);

        setStats({
          ...calculatedStats,
          avgResolutionHours,
          avgResolutionMinutes,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // 🔹 Helper para formatear el tiempo promedio usando los minutos calculados
  const renderAvgResponseTime = () => {
    if (!stats || !stats.avgResolutionMinutes || stats.avgResolutionMinutes <= 0) {
      return 'N/A';
    }

    const totalMinutes = stats.avgResolutionMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.page}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.main}>
        <Header 
          title="📊 Dashboard" 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <div className={styles.content}>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <StatsCard
              title="Total Tickets"
              value={stats?.total || 0}
              icon="🎫"
              color="blue"
            />
            <StatsCard
              title="Nuevos"
              value={stats?.nuevo || 0}
              icon="🆕"
              color="green"
            />
            <StatsCard
              title="En Progreso"
              value={stats?.en_progreso || 0}
              icon="⚙️"
              color="orange"
            />
            <StatsCard
              title="Resueltos"
              value={stats?.resuelto || 0}
              icon="✅"
              color="purple"
            />
          </div>

          {/* Charts Grid */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartFull}>
              <ActivityChart data={stats?.ticketsByDay || []} />
            </div>
            <div className={styles.chartHalf}>
              <PriorityDistribution data={stats?.byPriority || {}} />
            </div>
            <div className={styles.chartHalf}>
              <RecentActivity tickets={tickets} />
            </div>
          </div>

          {/* Additional Stats */}
          <div className={styles.additionalStats}>
            <div className={styles.statBox}>
              <h4>Tiempo promedio de respuesta</h4>
              <p className={styles.statValue}>
                {renderAvgResponseTime()}
              </p>
            </div>
            <div className={styles.statBox}>
              <h4>Tickets asignados</h4>
              <p className={styles.statValue}>
                {stats?.assigned || 0} de {stats?.total || 0}
              </p>
            </div>
            <div className={styles.statBox}>
              <h4>Tasa de resolución</h4>
              <p className={styles.statValue}>
                {stats?.total > 0 
                  ? `${Math.round((stats?.resuelto / stats?.total) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
