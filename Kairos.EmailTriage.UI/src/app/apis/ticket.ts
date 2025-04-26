import { Ticket } from "@/models";
import { EnhancedCacheService } from "./enhanced-cache-service";

const TICKETS_CACHE_KEY = 'all_tickets';
const TICKET_DETAIL_PREFIX = 'ticket_detail_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getAllTickets = async (): Promise<Ticket[] | undefined> => {
  // Check cache first
  const cachedTickets = EnhancedCacheService.get<Ticket[]>(TICKETS_CACHE_KEY);
  if (cachedTickets) {
    console.log("Using cached tickets data");
    // Ensure no duplicate IDs in the cached data
    return EnhancedCacheService.ensureUniqueIds(cachedTickets);
  }
  
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://localhost:44311/api/services/app/Ticket/GetAllTickets",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Invalid credentials");
    }
    
    const jsonResponse: { result: Ticket[] } = await response.json();
    console.log("Tickets fetched successfully:", jsonResponse.result);
    
    // Ensure unique IDs before caching
    const uniqueTickets = EnhancedCacheService.ensureUniqueIds(jsonResponse.result);
    
    // Store in cache
    EnhancedCacheService.set(TICKETS_CACHE_KEY, uniqueTickets, CACHE_DURATION);
    
    return uniqueTickets;
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return undefined;
  } finally {
    console.log("Tickets api call finished");
  }
};

const getTicketById = async (id: string): Promise<Ticket | undefined> => {
  // Check cache first
  const cacheKey = `${TICKET_DETAIL_PREFIX}${id}`;
  const cachedTicket = EnhancedCacheService.get<Ticket>(cacheKey);
  if (cachedTicket) {
    console.log(`Using cached data for ticket ${id}`);
    return cachedTicket;
  }
  
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://localhost:44311/api/services/app/Ticket/GetTicketById?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch ticket");
    }
    
    const jsonResponse: { result: Ticket } = await response.json();
    console.log("Ticket fetched successfully:", jsonResponse.result);
    
    // Store in cache
    EnhancedCacheService.set(cacheKey, jsonResponse.result, CACHE_DURATION);
    
    return jsonResponse.result;
  } catch (err) {
    console.error("Error fetching ticket by ID:", err);
    return undefined;
  }
};

const createTicket = async (ticket: Ticket): Promise<Ticket | undefined> => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://localhost:44311/api/services/app/Ticket/CreateTicket",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticket),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to create ticket");
    }
    
    const jsonResponse: { result: Ticket } = await response.json();
    console.log("Ticket created successfully:", jsonResponse.result);
    
    // Invalidate the all tickets cache since we added a new ticket
    EnhancedCacheService.invalidate(TICKETS_CACHE_KEY);
    
    return jsonResponse.result;
  } catch (err) {
    console.error("Error creating ticket:", err);
    return undefined;
  }
};

export const ticketApiService = {
  getAllTickets,
  createTicket,
  getTicketById,
  // Helper method to invalidate cache when needed
  invalidateCache: () => EnhancedCacheService.invalidate(TICKETS_CACHE_KEY)
};
