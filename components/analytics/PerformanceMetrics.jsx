// components/analytics/PerformanceMetrics.jsx
import React from 'react';
import styles from './PerformanceMetrics.module.css';

const PerformanceMetrics = ({ data = {} }) => {
  // Valores base con fallback
  const avgResolutionHours = data.avgResolutionHours ?? 0;
  const resolutionRate = data.resolutionRate ?? 0;
  const totalTickets = data.totalTickets ?? 0;
  const resolvedTickets = data.resolvedTickets ?? 0;

  // Convertimos horas a minutos para “tiempo de respuesta” simple
  const avgResponseMinutes = avgResolutionHours * 60;

  const metrics = [
    {
      label: 'Tiempo promedio de respuesta',
      // ej: "35m"
      value: `${avgResponseMinutes > 0 ? avgResponseMinutes.toFixed(0) : 0}m`,
      icon: '⚡',
      color: '#3b82f6',
      // Por ahora no tenemos trend calculado
      trend: undefined,
    },
    {
      label: 'Tasa de resolución',
      value: `${resolutionRate.toFixed(1)}%`,
      icon: '✅',
      color: '#10b981',
      trend: undefined,
    },
    {
      label: 'Tickets resueltos',
      value: `${resolvedTickets} / ${totalTickets}`,
      icon: '🎯',
      color: '#f59e0b',
      trend: undefined,
    },
    {
      label: 'Tiempo promedio de resolución',
      // ej: "1.5h"
      value: `${avgResolutionHours.toFixed(1)}h`,
      icon: '🕐',
      color: '#8b5cf6',
      trend: undefined,
    },
  ];

  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <div key={index} className={styles.metricCard}>
          <div
            className={styles.iconContainer}
            style={{ backgroundColor: metric.color }}
          >
            <span className={styles.icon}>{metric.icon}</span>
          </div>
          <div className={styles.metricContent}>
            <p className={styles.label}>{metric.label}</p>
            <p className={styles.value}>{metric.value}</p>

            {metric.trend !== undefined && (
              <div
                className={`${styles.trend} ${
                  metric.trend > 0 ? styles.positive : styles.negative
                }`}
              >
                <span className={styles.trendIcon}>
                  {metric.trend > 0 ? '↗' : '↘'}
                </span>
                <span className={styles.trendValue}>
                  {Math.abs(metric.trend)}%
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;
