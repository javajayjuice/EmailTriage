"use client";
import { useEffect, useRef, useState } from "react";
import { Ticket } from "@/models";
import Navbar from "@/components/layout/Navbar";
import TicketCard from "@/components/timeline/TicketCard";
import Toolbox from "@/components/toolbox/Toolbox";
import TimelineDot from "@/components/timeline/TimelineDot";
import ToolboxButton from "@/components/toolbox/ToolboxButton";
import { useTicket } from "../providers/ticket/TicketContext";
import { useSignalR } from "../providers/signalr/SignalrContext";
import formatDate from "../utils/date-format";
import TimelineContainer from "@/components/timeline/TimelineContainer";
import MainLayout from "@/components/layout/MainLayout";
import Spinner from "@/components/spinner/Spinner";
import UnknownPageError from "@/components/error/UnknownError";

const Timeline: React.FC = () => {
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const lastTicketRef = useRef<HTMLDivElement | null>(null);
  const { tickets, setTickets, getAllTickets, loading, error } = useTicket();
  const { registerOnServerEvents, stopConnection } = useSignalR();

  // Add state for filtered tickets
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  // Filter tickets whenever selectedLabelId or tickets change
  useEffect(() => {
    if (!selectedLabelId) {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket =>
        ticket.labelId === selectedLabelId || ticket.label?.id === selectedLabelId
      );
      setFilteredTickets(filtered);
    }
  }, [selectedLabelId, tickets]);

  useEffect(() => {
    // Fetch tickets if none are loaded yet
    if (tickets.length === 0) {
      getAllTickets();
    }

    // Register for live ticket updates
    const messageType = "Tickets";
    registerOnServerEvents(messageType, (incomingTickets: Ticket) => {
      console.log("SignalR ticket payload:", incomingTickets);

      // Update tickets state smartly
      setTickets((prevTickets) => {
        const ticketMap = new Map(prevTickets.map((t) => [t.id, t]));
        ticketMap.set(incomingTickets.id!, incomingTickets); // Overwrite if exists or add new
        return Array.from(ticketMap.values());
      });
    });

    // Cleanup when unmounting
    return () => {
      stopConnection(messageType);
    };
    // Remove 'tickets' from the dependency array to prevent reconnection after ticket creation
  }, [getAllTickets, registerOnServerEvents, stopConnection, setTickets]);

  useEffect(() => {
    if (filteredTickets.length > 0) {
      lastTicketRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredTickets]);

  const toggleToolbox = () => {
    setIsToolboxOpen(!isToolboxOpen);
  };

  const handleFilterChange = (labelId: string) => {
    setSelectedLabelId(labelId);
  };

  if (loading) return <MainLayout><Spinner /></MainLayout>;
  if (error) return <MainLayout><UnknownPageError error={error}></UnknownPageError></MainLayout>;

  return (
    <MainLayout>
      {isToolboxOpen && <Toolbox onFilterChange={handleFilterChange} />}
      <div className="relative min-h-screen">
        {/* Toolbox Button */}
        <ToolboxButton isToolboxOpen={isToolboxOpen} toggleToolbox={toggleToolbox} />

        {/* Timeline Content - Pass filtered tickets instead of all tickets */}
        <TimelineContainer
          isToolboxOpen={isToolboxOpen}
          tickets={filteredTickets.length > 0 || selectedLabelId ? filteredTickets : tickets}
          formatDate={formatDate}
          lastTicketRef={lastTicketRef}
        />
      </div>
    </MainLayout>
  );
};

export default Timeline;