import { useRouter } from "next/navigation";
import { TicketCardProps } from "./TimelineProps";


const TicketCard: React.FC<TicketCardProps> = ({ ticket, formatDate }) => {
  const router = useRouter();

  const handleClick = () => {
    // Update this to use the new URL structure
    router.push(`/tickets/${ticket.id}`);
  };

  return (
    <>


      <div
        className="ml-8 bg-white p-4 rounded-lg shadow-md max-w-2xl border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        onDoubleClick={handleClick}
      >
        <div className="mb-2 flex items-center gap-3">
          <a
            className="block font-sans text-base font-medium leading-relaxed tracking-normal text-blue-gray-900 antialiased transition-colors hover:text-pink-500"
          >
            {ticket.subject || "No Subject"}
          </a>
          <div className="ml-auto">
            <div
              className="center relative inline-block select-none whitespace-nowrap rounded-full bg-purple-500 py-1 px-2 align-baseline font-sans text-xs font-medium capitalize leading-none tracking-wide text-white"
            >
              <div className="mt-px">{formatDate(ticket.creationTime)}</div>
            </div>
          </div>
        </div>
        <p className=" font-sans text-sm font-normal leading-normal text-gray-700 antialiased line-clamp-3" title={ticket.body}>
          {ticket.body}
        </p>
        <div className="mt-4 flex items-center gap-5">

          {ticket.label && (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {ticket.label.name}
              </span>
            </div>
          )}

          {ticket.confidenceScore !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {ticket.confidenceScore != null
                ? `Confidence: ${(ticket.confidenceScore * 100).toFixed(1)}%`
                : "Agent defined"}
            </span>
          )}


        </div>
      </div>
    </>
  );
};

export default TicketCard;