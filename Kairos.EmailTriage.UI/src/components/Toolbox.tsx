import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Label, Ticket } from "@/models";
import { labelApiService } from "@/app/apis/label";
import { ticketApiService } from "@/app/apis/ticket";

interface ToolboxProps {
  tickets: {
    subject?: string;
    label?: { name: string };
    confidenceScore?: number;
  }[];
}

const Toolbox: React.FC<ToolboxProps> = ({ tickets }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [label, setLabel] = useState("");
  const [labelOptions, setLabelOptions] = useState<Label[]>([]);
  // const labelOptions = ["Tech", "Support", "Billing"]; // Example options

  useEffect(() => {
    labelApiService.getAllLabels().then((onLoadTickets: Label[] | undefined) => {
      setLabelOptions(onLoadTickets ?? []);
    });
  }, []);

  const handleSubmit = () => {
    console.log({ subject, body, label });
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
    <div className="fixed left-0 top-16 h-full w-64 bg-blue-100 shadow-lg z-10 p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tool Box</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-600"
      >
        Create Ticket
      </button>
      <div className="mb-4">
        <label htmlFor="filter" className="block text-gray-700 mb-2">
          Dropdown Filter Tickets
        </label>
        <select
          id="filter"
          className="w-full border border-gray-300 rounded-lg p-2"
          defaultValue=""
        >
          <option value="" disabled>
            Select a filter
          </option>
          <option value="tech">Tech</option>
          <option value="support">Support</option>
        </select>
      </div>
      <ul className="space-y-2">
        {tickets.map((ticket, index) => (
          <li key={index} className="text-gray-700">
            <span className="block font-medium">{ticket.subject || "No Subject"}</span>
            <span className="text-sm text-gray-500">{ticket.label?.name || "No Label"}</span>
            {ticket.confidenceScore !== undefined && (
              <span className="block text-sm text-green-600">
                Score: {(ticket.confidenceScore * 100).toFixed(1)}%
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Modal for Creating a Ticket */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
              {labelOptions.map((option) => (
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
      </Modal>
    </div>
  );
};

export default Toolbox;