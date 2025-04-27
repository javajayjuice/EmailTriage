"use client";

import { createContext, useContext } from "react";
import { Ticket } from "@/models";

interface SignalRContextType {
  registerOnServerEvents: (messageType: string, callback: (payload: Ticket[]) => void) => void;
  stopConnection: (messageType: string) => void;
}

export const SignalRContext = createContext<SignalRContextType>({
  registerOnServerEvents: () => { throw new Error("Function not implemented."); },
  stopConnection: () => { throw new Error("Function not implemented."); },
});

export const useSignalR = () => useContext(SignalRContext);
