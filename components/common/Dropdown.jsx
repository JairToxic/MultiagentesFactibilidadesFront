// components/common/Dropdown.jsx
import React from 'react';
import styles from './Dropdown.module.css';

const Dropdown = ({ label, value, onChange, options, ...props }) => {
  return (
    <div className={styles.dropdownContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;