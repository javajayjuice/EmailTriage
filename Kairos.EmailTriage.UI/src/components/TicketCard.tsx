import { useRouter } from "next/navigation";

interface TicketCardProps {
  ticket: {
    id: string;
    subject?: string;
    createdAt: Date;
    body?: string;
    label?: { name: string };
    confidenceScore?: number;
    isFAQ?: boolean;
    answer?: string;
    updatedAt?: Date;
  };
  formatDate: (date: Date) => string;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, formatDate }) => {
  const router = useRouter();

  const handleClick = () => {
    // Update this to use the new URL structure
    router.push(`/tickets/${ticket.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="ml-8 bg-white p-4 rounded-lg shadow-md w-full border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-800">
          {ticket.subject || "No Subject"}
        </h2>
        <span className="text-sm text-gray-500">
          {formatDate(ticket.createdAt)}
        </span>
      </div>
      {ticket.body && <p className="mt-2 text-gray-600">{ticket.body}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {ticket.label && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {ticket.label.name}
          </span>
        )}
        {ticket.confidenceScore !== undefined && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Score: {(ticket.confidenceScore * 100).toFixed(1)}%
          </span>
        )}
        {ticket.isFAQ && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            FAQ
          </span>
        )}
      </div>
    </div>
  );
};

export default TicketCard;