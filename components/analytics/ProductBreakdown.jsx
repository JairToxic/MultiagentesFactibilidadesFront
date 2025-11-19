// components/analytics/ProductBreakdown.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from './Chart.module.css';

const normalizeName = (rawName) => {
  if (!rawName) return '';
  return rawName
    .replace(/^Microsoft\s+/i, '')
    .replace(/\s+Online$/i, '');
};

const ProductBreakdown = ({ data }) => {
  let chartData = [];

  // 🧩 Caso 1: viene como { labels: [], values: [] }
  if (data && Array.isArray(data.labels) && Array.isArray(data.values)) {
    chartData = data.labels.map((label, index) => ({
      name: normalizeName(label),
      value: Number(data.values[index]) || 0,
    }));
  }
  // 🧩 Caso 2: viene como objeto { 'Microsoft 365 Online': 10, ... }
  else if (data && !Array.isArray(data) && typeof data === 'object') {
    chartData = Object.entries(data).map(([name, value]) => ({
      name: normalizeName(name),
      value: Number(value) || 0,
    }));
  }
  // 🧩 Caso 3: ya viene como array de objetos [{ name, value }]
  else if (Array.isArray(data)) {
    chartData = data.map((item) => ({
      name: normalizeName(item.name ?? item.label),
      value: Number(item.value ?? item.count ?? 0) || 0,
    }));
  }

  // Filtrar posibles vacíos / NaN
  chartData = chartData.filter(
    (item) => item.name && !isNaN(item.value) && item.value > 0
  );

  // Si no hay datos, mostramos mensaje amigable
  if (!chartData.length) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>📦 Tickets por producto</h3>
        <p style={{ textAlign: 'center', padding: '1rem 0' }}>
          No hay datos disponibles para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>📦 Tickets por producto</h3>
      <ResponsiveContainer width="100%" height={300}>
        {/* 👇 Importante: layout vertical para barras horizontales */}
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            width={120}
          />
          <Tooltip
            formatter={(value, name) => [value, 'Tickets']}
            labelFormatter={(label) => `Producto: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Bar dataKey="value" fill="#667eea" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductBreakdown;
