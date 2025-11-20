// components/analytics/EnhancedStatistics.jsx
"use client";

import React, { useState, useEffect } from 'react';
import statisticsService from '../../../services/statisticsService';
import timeTrackingService from '../../../services/timeTrackingService';
import satisfactionService from '../../../services/satisfactionService';
import styles from './EnhancedStatistics.module.css';

export default function EnhancedStatistics({ dateRange = 7 }) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [byUser, setByUser] = useState([]);
  const [timeStats, setTimeStats] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      
      const [overviewData, byUserData, timeData] = await Promise.all([
        statisticsService.getOverview({
          start_date: startDate.toISOString(),
        }),
        statisticsService.getStatisticsByUser({
          start_date: startDate.toISOString(),
        }),
        statisticsService.getTimeTrackingStats({
          start_date: startDate.toISOString(),
        }),
      ]);

      setOverview(overviewData);
      setByUser(byUserData.statistics || []);
      setTimeStats(timeData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando estadísticas...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Overview Cards */}
      {overview && (
        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎫</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{overview.total_tickets || 0}</div>
              <div className={styles.statLabel}>Total Tickets</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {overview.average_resolution_time_minutes
                  ? `${Math.round(overview.average_resolution_time_minutes / 60)}h`
                  : '—'}
              </div>
              <div className={styles.statLabel}>Tiempo Promedio Resolución</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {overview.average_satisfaction
                  ? `${overview.average_satisfaction.toFixed(1)}/5`
                  : '—'}
              </div>
              <div className={styles.statLabel}>Satisfacción Promedio</div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas por Usuario */}
      {byUser.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📊 Rendimiento por Técnico</h3>
          <div className={styles.userGrid}>
            {byUser.map((user) => (
              <div key={user.user_id} className={styles.userCard}>
                <div className={styles.userHeader}>
                  <div className={styles.userAvatar}>
                    {user.name?.charAt(0) || '?'}
                  </div>
                  <div className={styles.userInfo}>
                    <h4>{user.name}</h4>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                </div>
                
                <div className={styles.userStats}>
                  <div className={styles.userStatItem}>
                    <span className={styles.userStatLabel}>Tickets Asignados</span>
                    <span className={styles.userStatValue}>
                      {user.tickets_assigned || 0}
                    </span>
                  </div>
                  <div className={styles.userStatItem}>
                    <span className={styles.userStatLabel}>Resueltos</span>
                    <span className={styles.userStatValue}>
                      {user.tickets_resolved || 0}
                    </span>
                  </div>
                  <div className={styles.userStatItem}>
                    <span className={styles.userStatLabel}>Tiempo Trabajado</span>
                    <span className={styles.userStatValue}>
                      {timeTrackingService.formatMinutes(user.total_worked_minutes || 0)}
                    </span>
                  </div>
                  {user.average_satisfaction && (
                    <div className={styles.userStatItem}>
                      <span className={styles.userStatLabel}>Satisfacción</span>
                      <span
                        className={styles.userStatValue}
                        style={{
                          color: satisfactionService.getRatingColor(
                            Math.round(user.average_satisfaction)
                          ),
                        }}
                      >
                        {user.average_satisfaction.toFixed(1)}/5
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas de Tiempo */}
      {timeStats && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>⏱️ Tiempo Trabajado</h3>
          <div className={styles.timeSummary}>
            <div className={styles.timeCard}>
              <div className={styles.timeLabel}>Total Registrado</div>
              <div className={styles.timeValue}>
                {timeTrackingService.formatMinutes(timeStats.total_minutes || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

