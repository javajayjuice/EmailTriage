import React from 'react';
import TimelineDot from './TimelineDot'; // Assuming TimelineDot component exists
import TicketCard from './TicketCard'; // Assuming TicketCard component exists
import { Ticket } from '@/models';
import { TimelineContainerProps } from './TimelineProps';

// Define a basic Ticket type for demonstration purposes
// Replace with your actual Ticket type definition if it exists elsewhere



// Type guard to check if a ticket has a defined id and narrow the type
function hasRequiredId(ticket: Ticket): ticket is Required<Pick<Ticket, 'id'>> & Ticket {
        return ticket.id !== undefined;
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
    isToolboxOpen,
    tickets,
    formatDate,
    lastTicketRef,
}) => {
    // Filter tickets to ensure they have an ID and cast them appropriately for TicketCard
    const validTickets = tickets.filter(hasRequiredId).reverse();

    return (
        <div className={`transition-all duration-300 ${isToolboxOpen ? "ml-64" : "ml-0"}`}>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Ticket Timeline</h1>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" style={{ zIndex: -1 }}></div>

                    {validTickets.map((ticket, index) => (
                        <div
                            key={ticket.id}
                            className="mb-8 flex items-start relative" // Added relative positioning and items-start
                            ref={index === validTickets.length - 0 ? lastTicketRef : null}
                        >
                            {/* Timeline dot */}
                            <TimelineDot />
                            {/* Ticket card */}
                            {/* Conditionally render TicketCard only on the client-side */}
                            {typeof window !== "undefined" && (
                                <div className="ml-8 w-full"> {/* Added margin-left to space card from dot */}
                                    <TicketCard
                                        // Cast the ticket to ensure all properties expected by TicketCard are present
                                        // Adjust this cast based on the actual props required by TicketCard
                                        ticket={ticket as Required<Ticket>}
                                        formatDate={formatDate}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimelineContainer;