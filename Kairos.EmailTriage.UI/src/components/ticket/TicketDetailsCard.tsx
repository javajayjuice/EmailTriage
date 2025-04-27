import { useRouter } from "next/navigation";

interface TicketCardProps {
    ticket: {
        id: string;
        subject?: string;
        createdAt: Date;
        body?: string;
        label?: { name: string, id: string, description: string };
        confidenceScore?: number;
        isFAQ?: boolean;
        answer?: string;
        updatedAt?: Date;
    };
    formatDate: (date: Date) => string;
}

const TicketDetailsCard: React.FC<TicketCardProps> = ({ ticket }) => {
    return (
        <div>
            {/* Body */}
            {ticket.body && (
                <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="html-content" dangerouslySetInnerHTML={{ __html: ticket.body }} />
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
                <p>Label ID: {ticket.label?.id}</p>
            </div>
        </div>
    );
};

export default TicketDetailsCard;