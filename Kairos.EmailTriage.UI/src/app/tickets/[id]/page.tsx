"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Ticket } from "@/models";
import Navbar from "@/components/layout/Navbar";
import { useTicket } from "@/app/providers/ticket/TicketContext";
import { useLabel } from "@/app/providers/label/LabelContext";
import CenterModal from "@/components/modal/CenterModal";
import formatDate from "@/app/utils/date-format";
import TicketDetailsCard from "@/components/ticket/TicketDetailsCard";
import TicketLabelUpdateModal from "@/components/ticket/TicketLabelUpdateModal";
import MainLayout from "@/components/layout/MainLayout";

const TicketDetails: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { loading, error, getTicketById, selectedTicket, updateTicket, setSelectedTicket } = useTicket();
  const { labels, getAllLabels, loading: labelsLoading } = useLabel();

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState<string>("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Use ref to track if labels have been loaded for this modal session
  const labelsLoadedRef = useRef(false);

  // Fetch ticket details on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchTicket = async () => {
      try {
        if (isMounted) {
          await getTicketById(id);
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
      }
    };

    if (id) {
      fetchTicket();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load labels only once when modal is opened
  useEffect(() => {
    if (isEditModalOpen && !labelsLoadedRef.current) {
      if (!labels || labels.length === 0) {
        getAllLabels();
      }
      labelsLoadedRef.current = true;
    }

    // Reset the ref when modal is closed
    if (!isEditModalOpen) {
      labelsLoadedRef.current = false;
    }
  }, [isEditModalOpen]); // Remove getAllLabels from dependencies

  // Set initial selected label when ticket data is loaded or modal opens
  useEffect(() => {
    if (selectedTicket && selectedTicket.labelId) {
      setSelectedLabelId(selectedTicket.labelId);
    }
  }, [selectedTicket, isEditModalOpen]);

  // Memoize functions to prevent unnecessary re-renders
  const formatDateTime = useCallback((date?: Date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "medium",
    }).format(new Date(date));
  }, []);

  const handleOpenEditModal = useCallback(() => {
    setIsEditModalOpen(true);
    setUpdateError(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setUpdateError(null);
  }, []);

  const handleUpdateTicket = useCallback(async () => {
    if (!selectedTicket || !selectedTicket.id) {
      setUpdateError("No ticket selected");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      // Only update if label has changed
      if (selectedLabelId !== selectedTicket.labelId) {
        // Find the label object matching the selected ID
        const selectedLabel = labels.find(label => label.id === selectedLabelId);

        // Create an updated ticket with the new label information
        const updatedTicket = await updateTicket({
          ...selectedTicket,
          labelId: selectedLabelId
        });

        // Update the local state directly after successful update
        setSelectedTicket({
          ...selectedTicket,
          labelId: selectedLabelId,
          label: selectedLabel || selectedTicket.label // If label found, update it; otherwise keep existing
        });

        // Close the modal
        setIsEditModalOpen(false);
      } else {
        setUpdateError("No changes to save");
      }
    } catch (err: any) {
      console.error("Failed to update ticket:", err);
      setUpdateError(err.message || "Failed to update ticket");
    } finally {
      setUpdateLoading(false);
    }
  }, [selectedTicket, selectedLabelId, labels, updateTicket, setSelectedTicket]);

  // Add a function to handle successful label updates
  const handleLabelUpdated = useCallback(() => {
    // Refresh the ticket data if needed or perform any other actions
    getTicketById(id);
  }, [id, getTicketById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !selectedTicket) {
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

    <>
      <MainLayout>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4">
              <h1 className="text-2xl font-bold">{selectedTicket.subject || "No Subject"}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <span className="text-sm opacity-90">
                  {selectedTicket.creationTime ? `Created: ${formatDateTime(selectedTicket.creationTime)}` : ""}
                </span>
                {selectedTicket.updatedAt && (
                  <span className="text-sm opacity-90">
                    Updated: {formatDateTime(selectedTicket.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Content remains the same */}
            <div className="p-6">
              {/* Label and Confidence */}
              <div className="flex flex-wrap gap-3 mb-6">
                {selectedTicket.label && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedTicket.label.name}
                  </span>
                )}
                {selectedTicket.confidenceScore !== undefined && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {selectedTicket.confidenceScore != null
                      ? `Confidence: ${(selectedTicket.confidenceScore * 100).toFixed(1)}%`
                      : "Agent defined"}
                  </span>
                )}
                {selectedTicket.isFAQ && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    FAQ
                  </span>
                )}
              </div>

              <TicketDetailsCard ticket={selectedTicket as Required<Ticket>} formatDate={formatDate} />

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
                    onClick={handleOpenEditModal}
                  >
                    Edit Label
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={() => {/* Add delete functionality */ }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Label Modal */}
        <CenterModal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
          <TicketLabelUpdateModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            labels={labels}
            labelsLoading={labelsLoading}
            selectedTicket={selectedTicket}
            onLabelUpdated={handleLabelUpdated}
          />
        </CenterModal>
      </MainLayout>
    </>

  );
};

export default TicketDetails;