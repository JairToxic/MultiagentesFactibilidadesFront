// hooks/useTickets.js
import { useState, useEffect, useCallback } from 'react';
import ticketsService from '../services/ticketsService';
import toast from 'react-hot-toast';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketsService.getAllTickets();
      setTickets(data.tickets || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const refreshTickets = useCallback(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    tickets,
    loading,
    error,
    refreshTickets,
  };
}