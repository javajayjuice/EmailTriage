"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Ticket } from "@/models";
import { ticketApiService } from "../apis/ticket";

const TicketDetails: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // Get the ticket ID from the URL
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (id) {
      ticketApiService.getTicketById(id).then((fetchedTicket) => {
        setTicket(fetchedTicket ?? null);
      });
    }
  }, [id]);

  if (!ticket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{ticket.subject || "No Subject"}</h1>
      <p className="text-gray-600 mb-4">{ticket.body || "No details available."}</p>
      {ticket.label && (
        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {ticket.label.name}
        </span>
      )}
      <div className="mt-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default TicketDetails;