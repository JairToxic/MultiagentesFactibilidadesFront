// components/analytics/CategoryBreakdown.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from './Chart.module.css';

const CategoryBreakdown = ({ data }) => {
  const COLORS = {
    Incidente: '#ef4444',
    Solicitud: '#3b82f6',
    Consulta: '#8b5cf6',
    Cambio: '#f59e0b',
    Otro: '#6b7280',
  };

  let chartData = [];

  if (data) {
    // ✅ Caso 1: formato { labels: [...], values: [...] }
    if (
      Array.isArray(data.labels) &&
      Array.isArray(data.values) &&
      data.labels.length === data.values.length
    ) {
      chartData = data.labels.map((label, idx) => ({
        name: label,
        value: Number(data.values[idx]) || 0,
      }));
    } else {
      // ✅ Caso 2: formato { Incidente: 10, Solicitud: 5, ... }
      chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value: Number(value) || 0,
      }));
    }
  }

  const total = chartData.reduce((acc, item) => acc + (item.value || 0), 0);

  if (!chartData.length || total === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>📋 Distribución por categoría</h3>
        <p className={styles.noDataText}>No hay datos disponibles para mostrar.</p>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>📋 Distribución por categoría</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdown;
