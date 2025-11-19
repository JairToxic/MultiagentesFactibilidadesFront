// components/analytics/TrendAnalysis.jsx
import React from 'react';
import styles from './TrendAnalysis.module.css';

const TrendAnalysis = ({ data }) => {
  if (!data) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📈 Análisis de tendencia</h3>
        <p className={styles.noDataText}>No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  let recentCount = Number(
    data.recentCount ??
      data.reciente ??
      data.current ??
      data.actual ??
      NaN
  );

  let oldCount = Number(
    data.oldCount ??
      data.anterior ??
      data.previous ??
      NaN
  );

  let trend = Number(
    data.trend ??
      data.trendPercent ??
      data.change_percent ??
      data.variation ??
      NaN
  );

  let direction = data.direction;

  // ✅ Caso: viene como labels/values
  if (
    (isNaN(recentCount) || isNaN(oldCount)) &&
    Array.isArray(data.labels) &&
    Array.isArray(data.values)
  ) {
    const map = {};
    data.labels.forEach((label, idx) => {
      map[label] = Number(data.values[idx]) || 0;
    });

    // Intentar identificar por nombre
    recentCount =
      map['Período reciente'] ??
      map['Periodo reciente'] ??
      map['Reciente'] ??
      map['recent'] ??
      Number.isNaN(recentCount)
        ? Number(data.values[0]) || 0
        : recentCount;

    oldCount =
      map['Período anterior'] ??
      map['Periodo anterior'] ??
      map['Anterior'] ??
      map['previous'] ??
      Number.isNaN(oldCount)
        ? Number(data.values[1]) || 0
        : oldCount;
  }

  // ✅ Calcular tendencia si no viene
  if (isNaN(trend)) {
    if (!isNaN(recentCount) && !isNaN(oldCount)) {
      if (oldCount === 0 && recentCount === 0) {
        trend = 0;
      } else if (oldCount === 0) {
        // de 0 a algo -> 100% incremento “fuerte”
        trend = 100;
      } else {
        trend = ((recentCount - oldCount) / oldCount) * 100;
      }
    } else {
      trend = 0;
    }
  }

  // ✅ Determinar dirección si no viene
  if (!direction) {
    direction = trend >= 0 ? 'up' : 'down';
  } else if (direction === 'increase') {
    direction = 'up';
  } else if (direction === 'decrease') {
    direction = 'down';
  }

  const isPositive = direction === 'up';
  const trendColor = isPositive ? '#10b981' : '#ef4444';
  const trendIcon = isPositive ? '↗' : '↘';

  const trendDisplay = Math.abs(trend).toFixed(1).replace('.0', '');
  const hasData =
    !isNaN(recentCount) &&
    !isNaN(oldCount) &&
    (recentCount !== 0 || oldCount !== 0);

  if (!hasData) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>📈 Análisis de tendencia</h3>
        <p className={styles.noDataText}>No hay suficientes datos para calcular la tendencia.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📈 Análisis de tendencia</h3>

      <div className={styles.trendBox}>
        <div
          className={`${styles.trendValue} ${
            isPositive ? styles.positive : styles.negative
          }`}
          style={{ color: trendColor }}
        >
          <span className={styles.trendIcon}>{trendIcon}</span>
          <span className={styles.trendPercent}>{trendDisplay}%</span>
        </div>
        <p className={styles.trendLabel}>
          {trend === 0 ? 'Sin cambios en el volumen' : 
           isPositive ? 'Incremento en el volumen' : 'Decremento en el volumen'}
        </p>
      </div>

      <div className={styles.comparison}>
        <div className={styles.comparisonItem}>
          <div className={styles.comparisonValue}>{recentCount}</div>
          <div className={styles.comparisonLabel}>Período reciente</div>
        </div>
        <div className={styles.comparisonDivider}>vs</div>
        <div className={styles.comparisonItem}>
          <div className={styles.comparisonValue}>{oldCount}</div>
          <div className={styles.comparisonLabel}>Período anterior</div>
        </div>
      </div>

      <div className={styles.insight}>
        <p className={styles.insightIcon}>💡</p>
        <p className={styles.insightText}>
          {trend === 0
            ? 'El volumen de tickets se ha mantenido estable entre ambos períodos.'
            : isPositive
            ? 'El volumen de tickets ha aumentado. Considera revisar la carga de trabajo del equipo.'
            : 'El volumen de tickets ha disminuido. Esto puede indicar mejoras en los servicios o menor demanda.'}
        </p>
      </div>
    </div>
  );
};

export default TrendAnalysis;
