import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MaintenanceTicket, TicketStatus } from '../types/ticket';
import { fetchTickets, INITIAL_TICKETS, createTicketApi, updateTicketStatusApi } from '../services/api';

interface TicketsContextType {
  tickets: MaintenanceTicket[];
  isLoading: boolean;
  createTicket: (
    ticketData: Omit<MaintenanceTicket, 'id' | 'officialDocNumber' | 'createdAt' | 'status'>
  ) => MaintenanceTicket;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    approverName?: string,
    technicianName?: string
  ) => void;
  getTicketById: (id: string) => MaintenanceTicket | undefined;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchTickets().then((data) => {
      if (mounted && data.length > 0) {
        setTickets(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const createTicket = (
    ticketData: Omit<MaintenanceTicket, 'id' | 'officialDocNumber' | 'createdAt' | 'status'>
  ): MaintenanceTicket => {
    const nextNum = tickets.length + 43;
    const year = new Date().getFullYear();
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `PBH-${year}-${String(nextNum).padStart(3, '0')}`,
      officialDocNumber: `${nextNum}/TTr-HCQT`,
      createdAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Persist to SQLite backend & generate Decree 30 .docx document
    createTicketApi(ticketData).then((persisted) => {
      if (persisted) {
        setTickets((prev) => prev.map((t) => (t.id === newTicket.id ? { ...t, id: persisted.id, officialDocNumber: persisted.officialDocNumber } : t)));
      }
    });

    return newTicket;
  };

  const updateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    approverName?: string,
    technicianName?: string
  ) => {
    // Persist to SQLite backend
    updateTicketStatusApi(ticketId, status, approverName);

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status,
          ...(approverName ? { approvedBy: approverName, approvalDate: new Date().toISOString() } : {}),
          ...(technicianName ? { assignedTechnician: technicianName } : {}),
        };
      })
    );
  };

  const getTicketById = (id: string) => tickets.find((t) => t.id === id);

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        isLoading,
        createTicket,
        updateTicketStatus,
        getTicketById,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets(): TicketsContextType {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
}
