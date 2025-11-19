// components/tickets/TicketFilters.jsx
import React, { useMemo } from "react";
import styles from "./TicketFilters.module.css";
import SearchBar from "../common/SearchBar";
import Dropdown from "../common/Dropdown";
import Button from "../common/Button";

const TicketFilters = ({
  filters,
  onFilterChange,
  onReset,
  ticketCounts,
  tickets = [],
}) => {
  // ✅ Extraer TODOS los técnicos únicos (soportando múltiples asignaciones)
  const technicianOptions = useMemo(() => {
    const techniciansMap = new Map();

    tickets.forEach((ticket) => {
      let assignment = ticket.assignment ?? ticket.assignment_json;

      if (assignment && typeof assignment === "string") {
        try {
          assignment = JSON.parse(assignment);
        } catch (e) {
          assignment = null;
        }
      }

      if (!assignment) return;

      // ✅ Ahora buscamos en el array de técnicos
      const technicians = assignment.technicians || [];
      
      // Si hay array de técnicos, procesar todos
      if (technicians.length > 0) {
        technicians.forEach((tech) => {
          const techId = tech.id ?? tech.technician_id ?? tech.user_id ?? tech.object_id;
          const techName = tech.name ?? tech.full_name ?? tech.displayName ?? tech.email;

          if (techId && techName) {
            techniciansMap.set(String(techId), techName);
          }
        });
      } else {
        // Backward compatibility: técnico único
        const tech = assignment.technician;
        if (tech) {
          const techId = tech.id ?? tech.technician_id ?? tech.user_id ?? tech.object_id;
          const techName = tech.name ?? tech.full_name ?? tech.displayName ?? tech.email;

          if (techId && techName) {
            techniciansMap.set(String(techId), techName);
          }
        }
      }
    });

    const options = [
      { value: "all", label: "Todos los técnicos" },
      { value: "unassigned", label: "🚫 Sin asignar" },
    ];

    Array.from(techniciansMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([id, name]) => {
        options.push({
          value: String(id),
          label: `👤 ${name}`,
        });
      });

    return options;
  }, [tickets]); // ✅ Solo se recalcula cuando cambian los tickets

  const statusOptions = [
    { value: "all", label: `Todos (${ticketCounts.total || 0})` },
    { value: "nuevo", label: `🆕 Nuevos (${ticketCounts.nuevo || 0})` },
    {
      value: "en_progreso",
      label: `⚙️ En progreso (${ticketCounts.en_progreso || 0})`,
    },
    { value: "resuelto", label: `✅ Resueltos (${ticketCounts.resuelto || 0})` },
    { value: "cerrado", label: `🔒 Cerrados (${ticketCounts.cerrado || 0})` },
  ];

  const priorityOptions = [
    { value: "all", label: "Todas las prioridades" },
    { value: "Critica", label: "🔴 Crítica" },
    { value: "Alta", label: "🟠 Alta" },
    { value: "Media", label: "🟡 Media" },
    { value: "Baja", label: "🟢 Baja" },
  ];

  const productOptions = [
    { value: "all", label: "Todos los productos" },
    { value: "Microsoft Teams", label: "👥 Teams" },
    { value: "Exchange Online", label: "📧 Exchange" },
    { value: "SharePoint Online", label: "📁 SharePoint" },
    { value: "Azure", label: "☁️ Azure" },
    { value: "Microsoft 365", label: "📦 M365" },
    { value: "Otro", label: "🔧 Otro" },
  ];

  const categoryOptions = [
    { value: "all", label: "Todas las categorías" },
    { value: "Incidente", label: "🔥 Incidente" },
    { value: "Solicitud", label: "📝 Solicitud" },
    { value: "Consulta", label: "❓ Consulta" },
    { value: "Cambio", label: "🔄 Cambio" },
    { value: "Otro", label: "📌 Otro" },
  ];

  const sortOptions = [
    { value: "date_desc", label: "📅 Más recientes" },
    { value: "date_asc", label: "📅 Más antiguos" },
    { value: "priority", label: "⚡ Por prioridad" },
  ];

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.product !== "all" ||
    filters.category !== "all" ||
    (filters.technician && filters.technician !== "all") ||
    filters.search !== "";

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <h3 className={styles.title}>🔍 Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="small"
            onClick={onReset}
            icon="↺"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.searchSection}>
          <SearchBar
            value={filters.search || ""}
            onChange={(value) => onFilterChange("search", value)}
            placeholder="Buscar por ID, asunto, cliente, técnico..."
          />
        </div>

        <Dropdown
          label="Estado"
          value={filters.status || "all"}
          onChange={(value) => onFilterChange("status", value)}
          options={statusOptions}
        />

        <Dropdown
          label="Prioridad"
          value={filters.priority || "all"}
          onChange={(value) => onFilterChange("priority", value)}
          options={priorityOptions}
        />

        <Dropdown
          label="Producto"
          value={filters.product || "all"}
          onChange={(value) => onFilterChange("product", value)}
          options={productOptions}
        />

        <Dropdown
          label="Categoría"
          value={filters.category || "all"}
          onChange={(value) => onFilterChange("category", value)}
          options={categoryOptions}
        />

        <Dropdown
          label="Técnico asignado"
          value={filters.technician || "all"}
          onChange={(value) => onFilterChange("technician", value)}
          options={technicianOptions}
        />

        <Dropdown
          label="Ordenar por"
          value={filters.sortBy || "date_desc"}
          onChange={(value) => onFilterChange("sortBy", value)}
          options={sortOptions}
        />
      </div>
    </div>
  );
};

export default TicketFilters;