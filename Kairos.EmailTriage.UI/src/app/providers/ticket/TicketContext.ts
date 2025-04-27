"use client";

import { Ticket } from "@/models";
import { createContext, useContext, Dispatch, SetStateAction } from "react";

interface TicketContextType {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  getAllTickets: () => Promise<void>;
  getTicketById: (id: string) => Promise<void>;
  createTicket: (ticket: Partial<Ticket>) => Promise<void>;
  updateTicket: (ticket: Ticket) => Promise<void>;
  setTickets: Dispatch<SetStateAction<Ticket[]>>; // Expose setTickets
}

export const TicketContext = createContext<TicketContextType>({
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
  getAllTickets: async () => {},
  getTicketById: async () => {},
  createTicket: async () => {},
  updateTicket: async () => {},
  setTickets: () => {}, // Default no-op function
});

export const useTicket = () => useContext(TicketContext);
