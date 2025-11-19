// components/common/SearchBar.jsx
import React from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ value, onChange, placeholder = 'Buscar...', ...props }) => {
  return (
    <div className={styles.searchContainer}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {value && (
        <button
          className={styles.clearButton}
          onClick={() => onChange('')}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;