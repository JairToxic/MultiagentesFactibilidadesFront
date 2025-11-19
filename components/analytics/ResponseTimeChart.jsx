// components/analytics/ResponseTimeChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './Chart.module.css';

const normalizeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getNiceLabel = (key) => {
  const k = key.toLowerCase();
  if (k.includes('avg') || k.includes('promedio')) return 'Tiempo promedio (min)';
  if (k.includes('target') || k.includes('objetivo')) return 'Objetivo (min)';
  if (k.includes('median')) return 'Mediana (min)';
  return key;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const ResponseTimeChart = ({ data }) => {
  let rows = [];

  // Caso A: array de objetos
  if (Array.isArray(data)) {
    rows = data
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const { date, label, day, dia, ...rest } = item;
        const baseDate = date || label || day || dia || '';

        let flat = {};
        Object.entries(rest).forEach(([k, v]) => {
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.entries(v).forEach(([subK, subV]) => {
              flat[`${subK}`] = normalizeNumber(subV);
            });
          } else {
            flat[k] = normalizeNumber(v);
          }
        });

        return { date: baseDate, ...flat };
      })
      .filter(Boolean);
  }
  // Caso B: { labels: [], serie1: [], serie2: [] }
  else if (data && typeof data === 'object' && Array.isArray(data.labels)) {
    const labels = data.labels;
    const seriesKeys = Object.keys(data).filter(
      (k) => k !== 'labels' && Array.isArray(data[k])
    );

    rows = labels.map((label, index) => {
      const row = { date: label };
      seriesKeys.forEach((k) => {
        row[k] = normalizeNumber(data[k][index]);
      });
      return row;
    });
  }
  // Caso C: { '2025-11-18': { avgMinutes, target }, ... }
  else if (data && typeof data === 'object') {
    rows = Object.entries(data).map(([dateKey, v]) => {
      if (v && typeof v === 'object') {
        const flat = {};
        Object.entries(v).forEach(([k, value]) => {
          flat[k] = normalizeNumber(value);
        });
        return { date: dateKey, ...flat };
      }
      return { date: dateKey, value: normalizeNumber(v) };
    });
  }

  rows = rows.filter((r) => r && r.date);

  if (!rows.length) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>⚡ Tiempo de respuesta promedio</h3>
        <p style={{ textAlign: 'center', padding: '1rem 0' }}>
          No hay datos disponibles para mostrar.
        </p>
      </div>
    );
  }

  const sample = rows[0] || {};
  const seriesKeys = Object.keys(sample).filter(
    (k) => k !== 'date' && sample[k] !== undefined
  );

  if (!seriesKeys.length) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>⚡ Tiempo de respuesta promedio</h3>
        <p style={{ textAlign: 'center', padding: '1rem 0' }}>
          No se encontraron series numéricas para graficar.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>⚡ Tiempo de respuesta promedio</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip
            labelFormatter={(label) => `Fecha: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            formatter={(value, name) => [value, getNiceLabel(name)]}
          />
          <Legend formatter={(value) => getNiceLabel(value)} />

          {seriesKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={getNiceLabel(key)}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={index === 0 ? 3 : 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTimeChart;
