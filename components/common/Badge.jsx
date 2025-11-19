// components/common/Badge.jsx
import React from 'react';
import styles from './Badge.module.css';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'medium',
  icon = null 
}) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;