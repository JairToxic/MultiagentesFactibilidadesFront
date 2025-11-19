// components/analytics/TechnicianPerformance.jsx
import React from 'react';
import styles from './TechnicianPerformance.module.css';

const TechnicianPerformance = ({ technicians, selectedTechnician }) => {
  const filteredTechnicians =
    selectedTechnician === 'all'
      ? technicians
      : technicians.filter((t) => String(t.id) === String(selectedTechnician));

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {filteredTechnicians.map((tech, index) => {
          const assigned = tech.assigned ?? 0;
          const resolved = tech.resolved ?? 0;
          const completionRate =
            assigned > 0 ? (resolved / assigned) * 100 : 0;

          const avgTimeLabel =
            tech.avgTime ||
            (tech.avgResolutionHours != null
              ? `${tech.avgResolutionHours.toFixed(1)}h`
              : '0h');

          const satisfaction =
            tech.satisfaction != null ? tech.satisfaction : 0;

          const score = tech.score != null ? tech.score : Math.round(completionRate);

          return (
            <div key={index} className={styles.card}>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.avatar}>
                  {(tech.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className={styles.info}>
                  <h4 className={styles.name}>{tech.name}</h4>
                  <p className={styles.role}>{tech.role || 'Técnico'}</p>
                </div>
                <div className={styles.score}>
                  <div className={styles.scoreValue}>{score}</div>
                  <div className={styles.scoreLabel}>Score</div>
                </div>
              </div>

              {/* Stats */}
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Tickets asignados</span>
                  <span className={styles.statValue}>{assigned}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Resueltos</span>
                  <span className={styles.statValue}>{resolved}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Tiempo promedio</span>
                  <span className={styles.statValue}>{avgTimeLabel}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Satisfacción</span>
                  <span className={styles.statValue}>{satisfaction}%</span>
                </div>
              </div>

              {/* Progress */}
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${completionRate.toFixed(0)}%` }}
                  />
                </div>
                <span className={styles.progressLabel}>
                  {completionRate.toFixed(0)}% completado
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className={styles.empty}>
          <p>No hay datos de técnicos para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default TechnicianPerformance;
