export const API_CONFIG = {
  BASE_URL: "https://localhost:44311/api/services/app",
  ENDPOINTS: {
    TICKETS: {
      GET_ALL: "/Ticket/GetAllTickets",
      GET_BY_ID: "/Ticket/GetTicketById",
      CREATE: "/Ticket/CreateTicket",
    },
    LABELS: {
      GET_ALL: "/Label/GetAllLables",
    },
  },
  CACHE_DURATION: {
    SHORT: 2 * 60 * 1000,   // 2 minutes
    MEDIUM: 5 * 60 * 1000,  // 5 minutes
    LONG: 30 * 60 * 1000,   // 30 minutes
  }
};