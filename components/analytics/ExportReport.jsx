// components/analytics/ExportReport.jsx
import React, { useState } from 'react';
import styles from './ExportReport.module.css';
import Button from '../common/Button';

const ExportReport = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await onExport(format);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Button
        variant="primary"
        icon="📥"
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
      >
        Exportar
      </Button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              <span className={styles.menuIcon}>📄</span>
              <span>Exportar como PDF</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('excel')}
              disabled={exporting}
            >
              <span className={styles.menuIcon}>📊</span>
              <span>Exportar como Excel</span>
            </button>
            <button
              className={styles.menuItem}
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              <span className={styles.menuIcon}>📋</span>
              <span>Exportar como CSV</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportReport;