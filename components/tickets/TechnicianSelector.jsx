// components/tickets/TechnicianSelector.jsx
import React, { useState, useEffect } from 'react';
import styles from './TechnicianSelector.module.css';
import ticketsService from '../../services/ticketsService';
import toast from 'react-hot-toast';

const TechnicianSelector = ({ 
  ticketId, 
  currentTechnicians = [],
  onTechnicianChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // ✅ Estado para selección múltiple
  const [selectedForBatch, setSelectedForBatch] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);

  useEffect(() => {
    if (isOpen && technicians.length === 0) {
      loadTechnicians();
    }
  }, [isOpen]);

  // ✅ Limpiar selección al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedForBatch(new Set());
      setBatchMode(false);
    }
  }, [isOpen]);

  const loadTechnicians = async () => {
    setSearching(true);
    try {
      const results = await ticketsService.searchTechnicians();
      setTechnicians(results || []);
    } catch (error) {
      console.error('Error loading technicians:', error);
      toast.error('Error al cargar técnicos');
    } finally {
      setSearching(false);
    }
  };

  const isAssigned = (techId) => {
    return currentTechnicians.some(t => t.id === techId);
  };

  const handleToggleTechnician = async (technicianId) => {
    if (batchMode) {
      // Modo batch: solo seleccionar/deseleccionar
      const newSelected = new Set(selectedForBatch);
      if (newSelected.has(technicianId)) {
        newSelected.delete(technicianId);
      } else {
        newSelected.add(technicianId);
      }
      setSelectedForBatch(newSelected);
      return;
    }

    // Modo normal: asignar/desasignar inmediatamente
    setLoading(true);
    try {
      const alreadyAssigned = isAssigned(technicianId);
      
      if (alreadyAssigned) {
        await onTechnicianChange(technicianId, 'remove');
        toast.success('Técnico removido correctamente');
      } else {
        await onTechnicianChange(technicianId, 'add');
        toast.success('Técnico asignado correctamente');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssign = async () => {
    if (selectedForBatch.size === 0) {
      toast.error('Selecciona al menos un técnico');
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const techId of selectedForBatch) {
        try {
          if (!isAssigned(techId)) {
            await onTechnicianChange(techId, 'add');
            successCount++;
          }
        } catch (error) {
          console.error('Error asignando técnico:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} técnico(s) asignado(s) correctamente`);
      }
      if (errorCount > 0) {
        toast.error(`Error al asignar ${errorCount} técnico(s)`);
      }

      setSelectedForBatch(new Set());
      setBatchMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignAll = async () => {
    if (currentTechnicians.length === 0) return;
    
    setLoading(true);
    try {
      await onTechnicianChange(null, 'unassign_all');
      toast.success('Todos los técnicos han sido desasignados');
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al desasignar');
    } finally {
      setLoading(false);
    }
  };

  const displayText = currentTechnicians.length === 0 
    ? 'Sin asignar' 
    : currentTechnicians.length === 1
    ? currentTechnicians[0].name
    : `${currentTechnicians.length} técnicos`;

  const availableTechnicians = technicians.filter(t => !isAssigned(t.id));

  return (
    <div className={styles.technicianSelector}>
      <button
        className={styles.technicianButton}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <span className={styles.technicianIcon}>
          {currentTechnicians.length > 0 ? '👥' : '👤'}
        </span>
        <span className={styles.technicianLabel}>{displayText}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            {searching ? (
              <div className={styles.loading}>Cargando técnicos...</div>
            ) : (
              <>
                {/* Técnicos asignados */}
                {currentTechnicians.length > 0 && (
                  <div className={styles.dropdownSection}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionTitle}>
                        ✓ Asignados ({currentTechnicians.length})
                      </span>
                      <button
                        className={styles.unassignAllBtn}
                        onClick={handleUnassignAll}
                        disabled={loading}
                      >
                        Desasignar todos
                      </button>
                    </div>
                    {currentTechnicians.map((tech) => (
                      <button
                        key={tech.id}
                        className={`${styles.dropdownItem} ${styles.assigned}`}
                        onClick={() => handleToggleTechnician(tech.id)}
                        disabled={loading}
                      >
                        <div className={styles.techAvatar}>
                          {tech.name?.charAt(0) || '?'}
                        </div>
                        <div className={styles.techInfo}>
                          <span className={styles.techName}>{tech.name}</span>
                          <span className={styles.techRole}>
                            {tech.profile_summary?.substring(0, 50) || 'Técnico'}...
                          </span>
                        </div>
                        <span className={styles.removeIcon}>✕</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* ✅ Modo de selección múltiple */}
                {availableTechnicians.length > 0 && (
                  <div className={styles.dropdownSection}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionTitle}>
                        Técnicos disponibles ({availableTechnicians.length})
                      </span>
                      {!batchMode ? (
                        <button
                          className={styles.batchModeBtn}
                          onClick={() => setBatchMode(true)}
                          disabled={loading}
                        >
                          + Selección múltiple
                        </button>
                      ) : (
                        <div className={styles.batchActions}>
                          <button
                            className={styles.cancelBatchBtn}
                            onClick={() => {
                              setBatchMode(false);
                              setSelectedForBatch(new Set());
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            className={styles.assignBatchBtn}
                            onClick={handleBatchAssign}
                            disabled={loading || selectedForBatch.size === 0}
                          >
                            Asignar ({selectedForBatch.size})
                          </button>
                        </div>
                      )}
                    </div>

                    {batchMode && (
                      <div className={styles.batchInfo}>
                        {selectedForBatch.size === 0 
                          ? '📌 Selecciona los técnicos que deseas asignar'
                          : `✓ ${selectedForBatch.size} técnico(s) seleccionado(s)`
                        }
                      </div>
                    )}

                    {availableTechnicians.map((tech) => {
                      const isSelected = selectedForBatch.has(tech.id);
                      return (
                        <button
                          key={tech.id}
                          className={`${styles.dropdownItem} ${
                            isSelected ? styles.selected : ''
                          }`}
                          onClick={() => handleToggleTechnician(tech.id)}
                          disabled={loading && !batchMode}
                        >
                          {batchMode && (
                            <div className={styles.checkbox}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                              />
                            </div>
                          )}
                          <div className={styles.techAvatar}>
                            {tech.name?.charAt(0) || '?'}
                          </div>
                          <div className={styles.techInfo}>
                            <span className={styles.techName}>{tech.name}</span>
                            <span className={styles.techRole}>
                              {tech.profile_summary?.substring(0, 50) || 'Técnico'}...
                            </span>
                          </div>
                          {!batchMode && (
                            <span className={styles.addIcon}>+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {technicians.length === 0 && (
                  <div className={styles.noResults}>
                    No hay técnicos disponibles
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TechnicianSelector;