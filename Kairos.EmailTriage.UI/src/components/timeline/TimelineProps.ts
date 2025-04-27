import { Ticket } from "@/models";

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

// Define the props for the TimelineContainer component
interface TimelineContainerProps {
    isToolboxOpen: boolean;
    tickets: Ticket[];
    formatDate: (date: Date) => string; // Function to format dates
    lastTicketRef: React.RefObject<HTMLDivElement | null>; // Ref for the last ticket element, can be null
}

export type { TicketCardProps, TimelineContainerProps };