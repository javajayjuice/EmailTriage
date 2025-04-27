import React, { useEffect, useState } from "react";
import CenterModal from "@/components/modal/CenterModal";
import { Ticket } from "@/models";
import { ticketApiService } from "@/app/apis/ticket";
import { useLabel } from "@/app/providers/label/LabelContext";

interface ToolboxProps {
  onFilterChange?: (filteredLabelId: string) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ onFilterChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [label, setLabel] = useState("");
  const [selectedLabelFilter, setSelectedLabelFilter] = useState("");

  // Track whether we've already loaded labels
  const [labelsLoaded, setLabelsLoaded] = useState(false);

  // Get labels from context - notice we're now destructuring the loading state too
  const { labels, getAllLabels, loading } = useLabel();

  // Only fetch labels once, when the component mounts
  useEffect(() => {
    // Only call getAllLabels if we haven't loaded them yet and they're not already loading
    if (!labelsLoaded && !loading && labels.length === 0) {
      getAllLabels();
      setLabelsLoaded(true);
    }
  }, [getAllLabels, labels.length, labelsLoaded, loading]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const labelId = e.target.value;
    setSelectedLabelFilter(labelId);

    // Call the callback function if it exists
    if (onFilterChange) {
      onFilterChange(labelId);
    }
  };

  const handleSubmit = () => {
    const newTicket: Ticket = {
      subject,
      body,
      labelId: label,
    };

    ticketApiService.createTicket(newTicket).then((createdTicket) => {
      if (createdTicket) {
        console.log("Ticket created successfully:", createdTicket);
      } else {
        console.error("Failed to create ticket");
      }
    });
    setIsModalOpen(false);
    setSubject("");
    setBody("");
    setLabel("");
  };

  return (
    <div className="absolute left-0 top-16 h-full w-64 bg-blue-100 shadow-lg z-40 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tool Box</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-600"
      >
        Create Ticket
      </button>
      <div className="mb-4">
        <label htmlFor="filter" className="block text-gray-700 mb-2">
          Filter Tickets by Label
        </label>
        <select
          id="filter"
          className="w-full border border-gray-300 rounded-lg p-2"
          value={selectedLabelFilter}
          onChange={handleFilterChange}
          disabled={loading} // Disable while loading
        >
          <option value="">All Labels</option>
          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>
        {loading && <p className="text-sm text-gray-500 mt-1">Loading labels...</p>}
      </div>

      {/* Modal for Creating a Ticket */}
      <CenterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Ticket</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ticket subject"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-gray-700 mb-1">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ticket details"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="label" className="block text-gray-700 mb-1">
              Label
            </label>
            <select
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a label (optional)</option>
              {labels.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </CenterModal>
    </div>
  );
};

export default Toolbox;