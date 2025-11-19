// components/analytics/ResolutionRate.jsx
import React from 'react';
import styles from './ResolutionRate.module.css';

const ResolutionRate = ({ data }) => {
  if (!data) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>✅ Tasa de resolución</h3>
        <p className={styles.noDataText}>No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  let total = 0;
  let resolved = 0;
  let pending = 0;
  let closed = 0;
  let resolutionRate = null;

  // ✅ Caso 1: objeto con campos directos
  total = Number(
    data.total ??
      data.totalTickets ??
      data.total_tickets ??
      0
  );

  resolved = Number(
    data.resolved ??
      data.resueltos ??
      data.resolvedTickets ??
      data.resolved_tickets ??
      0
  );

  pending = Number(
    data.pending ??
      data.pendientes ??
      0
  );

  closed = Number(
    data.closed ??
      data.cerrados ??
      0
  );

  resolutionRate = Number(
    data.resolutionRate ??
      data.resolution_rate ??
      data.rate ??
      NaN
  );

  // ✅ Caso 2: si viene en formato labels/values
  if (
    (isNaN(total) || total === 0) &&
    Array.isArray(data.labels) &&
    Array.isArray(data.values)
  ) {
    const map = {};
    data.labels.forEach((label, idx) => {
      map[label] = Number(data.values[idx]) || 0;
    });

    total =
      map['Total'] ??
      map['total'] ??
      data.values.reduce((acc, v) => acc + (Number(v) || 0), 0);

    resolved =
      map['Resueltos'] ??
      map['Resuelto'] ??
      map['resolved'] ??
      0;

    pending =
      map['Pendientes'] ??
      map['Pendiente'] ??
      map['pending'] ??
      0;

    closed =
      map['Cerrados'] ??
      map['Cerrado'] ??
      map['closed'] ??
      0;
  }

  // ✅ Calcular tasa si no viene del backend
  if (isNaN(resolutionRate) || resolutionRate === null) {
    if (total > 0) {
      resolutionRate = (resolved / total) * 100;
    } else {
      resolutionRate = 0;
    }
  }

  // Limitar a [0, 100] y 1 decimal
  resolutionRate = Math.min(100, Math.max(0, Number(resolutionRate)));
  const resolutionRateDisplay = resolutionRate.toFixed(1).replace('.0', '');

  const hasAnyValue = total || resolved || pending || closed;

  const stats = [
    { label: 'Total',      value: total,    color: '#3b82f6' },
    { label: 'Resueltos',  value: resolved, color: '#10b981' },
    { label: 'Pendientes', value: pending,  color: '#f59e0b' },
    { label: 'Cerrados',   value: closed,   color: '#6b7280' },
  ];

  if (!hasAnyValue) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>✅ Tasa de resolución</h3>
        <p className={styles.noDataText}>No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>✅ Tasa de resolución</h3>

      <div className={styles.mainStat}>
        <div className={styles.percentage}>{resolutionRateDisplay}%</div>
        <div className={styles.label}>Tasa de resolución</div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${resolutionRate}%` }}
        />
      </div>

      <div className={styles.stats}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.stat}>
            <div
              className={styles.statDot}
              style={{ backgroundColor: stat.color }}
            />
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResolutionRate;
