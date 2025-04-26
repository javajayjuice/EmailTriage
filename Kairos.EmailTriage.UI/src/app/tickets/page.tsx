"use client";
import { useEffect, useRef, useState } from "react";
import { socketService } from "../apis/socket";
import { Ticket } from "@/models";
import { ticketApiService } from "../apis/ticket";
import Navbar from "@/components/Navbar";
import TicketCard from "@/components/TicketCard";
import Toolbox from "@/components/Toolbox";
import TimelineDot from "@/components/TimelineDot";
import ToolboxButton from "@/components/ToolboxButton";

// Timeline Component with Toolbox
const Timeline: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const lastTicketRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ticketApiService.getAllTickets().then((onLoadTickets: Ticket[] | undefined) => {
      setTickets(onLoadTickets ?? []);
    });
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      lastTicketRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [tickets]);

  useEffect(() => {
    socketService.registerOnServerEvents(
      "Tickets",
      (payload: Ticket[]) => {
        setTickets((prevTickets) => {
          const newTickets = [...prevTickets, ...payload];
          return newTickets;
        });
      }
    );
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const toggleToolbox = () => {
    setIsToolboxOpen(!isToolboxOpen);
  };

  return (
    <div className="relative min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Toolbox Button */}
      <ToolboxButton isToolboxOpen={isToolboxOpen} toggleToolbox={toggleToolbox} />

      {/* Toolbox View */}
      {isToolboxOpen && <Toolbox tickets={tickets} />}

      {/* Timeline Content */}
      <div className={`transition-all duration-300 ${isToolboxOpen ? "ml-64" : "ml-0"}`}>
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Ticket Timeline</h1>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            {tickets
              .filter((ticket) => ticket.id !== undefined) // Ensure `id` is defined
              .map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="mb-8 flex"
                  ref={index === tickets.length - 1 ? lastTicketRef : null}
                >
                  {/* Timeline dot */}
                  <TimelineDot />
                  {/* Ticket card */}
                  {typeof window !== "undefined" && (
                    <TicketCard ticket={ticket as Required<Ticket>} formatDate={formatDate} />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;