// components/dashboard/StatsCard.jsx
import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  color = 'blue',
  subtitle = null 
}) => {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {trend && (
          <div className={`${styles.trend} ${trend > 0 ? styles.up : styles.down}`}>
            <span className={styles.trendIcon}>{trend > 0 ? '↗' : '↘'}</span>
            <span className={styles.trendValue}>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;