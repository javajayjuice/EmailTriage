"use client";

import { Ticket } from "@/models";
import { TicketContext } from "./TicketContext";
import { useState, useEffect, ReactNode } from "react";
import * as signalR from "@microsoft/signalr";

// SignalR connection instance
let connection: signalR.HubConnection | null = null;

const API_URL = "https://localhost:44311/api/services/app/Ticket";

interface Props {
  children: ReactNode;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export function TicketContextProvider({ children }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/GetAllTickets`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data: { result: Ticket[] } = await response.json();
      setTickets(data.result || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Looks like you've found the doorway to the great nothing");
    } finally {
      setLoading(false);
    }
  };

  const getTicketById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/GetTicketById?Id=${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ticket");
      }

      const data: { result: Ticket } = await response.json();
      setSelectedTicket(data.result || null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Looks like you've found the doorway to the great nothing");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Partial<Ticket>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/CreateTicket`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(ticket),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data: { result: Ticket } = await response.json();
      setTickets((prev) => [...prev, data.result]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Looks like you've found the doorway to the great nothing");
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticket: Ticket) => {
    if (!ticket.id) throw new Error("Ticket id is required for update");

    setLoading(true);
    setError(null);
    // Ensure ticket has the required properties
    if (!ticket.labelId) throw new Error("Ticket labelId is required for update");
    const payload: { id: string; labelId: string } = { id: ticket.id, labelId: ticket.labelId };
    try {
      const response = await fetch(`${API_URL}/UpdateTicket`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      const data = await response.json();

      // Update local state
      setTickets((prev) =>
        prev.map((t) => (t.id === data.result.id ? data.result : t))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Looks like you've found the doorway to the great nothing");
    } finally {
      setLoading(false);
    }
  };



  return (
    <TicketContext.Provider
      value={{
        tickets,
        selectedTicket,
        loading,
        error,
        getAllTickets,
        getTicketById,
        createTicket,
        updateTicket,
        setTickets, 
        setSelectedTicket
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}
