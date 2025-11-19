// hooks/useFilters.js
import { useState, useMemo } from "react";

const INITIAL_FILTERS = {
  status: "all",
  priority: "all",
  product: "all",
  category: "all",
  technician: "all",
  search: "",
  sortBy: "date_desc",
};

// 🔧 Helper para obtener la asignación unificada (assignment o assignment_json)
const getAssignment = (ticket) => {
  let assignment = ticket.assignment ?? ticket.assignment_json ?? null;

  if (assignment && typeof assignment === "string") {
    try {
      assignment = JSON.parse(assignment);
    } catch {
      assignment = null;
    }
  }

  return assignment;
};

export function useFilters(tickets = []) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filteredTickets = useMemo(() => {
    // Asegurarse de trabajar siempre con un array
    let filtered = Array.isArray(tickets) ? [...tickets] : [];

    // Filtro por estado
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Filtro por prioridad
    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter(
        (t) => t.classification?.priority === filters.priority
      );
    }

    // Filtro por producto
    if (filters.product && filters.product !== "all") {
      filtered = filtered.filter(
        (t) => t.classification?.product === filters.product
      );
    }

    // Filtro por categoría
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (t) => t.classification?.category === filters.category
      );
    }

    // ✅ Filtro por técnico asignado (unificado: assignment / assignment_json)
    if (filters.technician && filters.technician !== "all") {
      if (filters.technician === "unassigned") {
        // Tickets sin asignar
        filtered = filtered.filter((t) => {
          const assignment = getAssignment(t);
          // sin assignment, o no marcado como assigned, o sin technician → "sin asignar"
          return !assignment || !assignment.assigned || !assignment.technician;
        });
      } else {
        // Tickets asignados a un técnico específico
        filtered = filtered.filter((t) => {
          const assignment = getAssignment(t);
          const tech = assignment?.technician;

          if (!tech) return false;

          const techId =
            tech.id ??
            tech.technician_id ??
            tech.user_id ??
            tech.object_id;

          return (
            techId != null &&
            String(techId) === String(filters.technician)
          );
        });
      }
    }

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();

      filtered = filtered.filter((t) => {
        const idText =
          t.ticket_id != null ? String(t.ticket_id).toLowerCase() : "";

        const subject = t.email?.subject?.toLowerCase() || "";
        const from = t.email?.from?.toLowerCase() || "";
        const summary = t.classification?.summary?.toLowerCase() || "";

        const assignment = getAssignment(t);
        const techName =
          assignment?.technician?.name?.toLowerCase() || "";

        return (
          idText.includes(searchLower) ||
          subject.includes(searchLower) ||
          from.includes(searchLower) ||
          summary.includes(searchLower) ||
          techName.includes(searchLower)
        );
      });
    }

    // Ordenamiento
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date_desc":
            return new Date(b.created_at) - new Date(a.created_at);
          case "date_asc":
            return new Date(a.created_at) - new Date(b.created_at);
          case "priority": {
            const priorityOrder = { Critica: 4, Alta: 3, Media: 2, Baja: 1 };
            const pa = priorityOrder[a.classification?.priority] || 0;
            const pb = priorityOrder[b.classification?.priority] || 0;
            return pb - pa;
          }
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [tickets, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return {
    filters,
    filteredTickets,
    updateFilter,
    resetFilters,
  };
}
