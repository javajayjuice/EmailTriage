"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Ticket } from "@/models";
import { ticketApiService } from "../../apis/ticket";
import Navbar from "@/components/Navbar";

const TicketDetails: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const fetchedTicket = await ticketApiService.getTicketById(id);
        setTicket(fetchedTicket ?? null);
      } catch (err) {
        setError("Failed to load ticket details.");
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const formatDateTime = (date?: Date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "medium",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error || "Ticket not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">{ticket.subject || "No Subject"}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <span className="text-sm opacity-90">
                {ticket.createdAt ? `Created: ${formatDateTime(ticket.createdAt)}` : ""}
              </span>
              {ticket.updatedAt && (
                <span className="text-sm opacity-90">
                  Updated: {formatDateTime(ticket.updatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Label and Confidence */}
            <div className="flex flex-wrap gap-3 mb-6">
              {ticket.label && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {ticket.label.name}
                </span>
              )}
              {ticket.confidenceScore !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Confidence: {(ticket.confidenceScore * 100).toFixed(1)}%
                </span>
              )}
              {ticket.isFAQ && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  FAQ
                </span>
              )}
            </div>

            {/* Body */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Content</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                {ticket.body ? (
                  <p className="whitespace-pre-wrap">{ticket.body}</p>
                ) : (
                  <p className="italic text-gray-500">No content available</p>
                )}
              </div>
            </div>

            {/* Cleaned Body */}
            {ticket.cleanedBody && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Cleaned Content</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="whitespace-pre-wrap">{ticket.cleanedBody}</p>
                </div>
              </div>
            )}

            {/* Answer */}
            {ticket.answer && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Answer</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="whitespace-pre-wrap">{ticket.answer}</p>
                </div>
              </div>
            )}

            {/* Label Details */}
            {ticket.label && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Label Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p><span className="font-medium">Label:</span> {ticket.label.name}</p>
                  <p><span className="font-medium">Description:</span> {ticket.label.description}</p>
                </div>
              </div>
            )}

            {/* Ticket ID */}
            <div className="mt-6 text-sm text-gray-500">
              <p>Ticket ID: {ticket.id}</p>
              <p>Label ID: {ticket.labelId}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Back to Timeline
            </button>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => {/* Add edit functionality */}}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => {/* Add delete functionality */}}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;