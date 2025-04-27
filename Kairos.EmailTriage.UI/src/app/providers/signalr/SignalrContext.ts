import { createContext, useContext } from "react";
import { HubConnectionState } from "@microsoft/signalr";

interface SignalRContextType {
  registerOnServerEvents: (messageType: string, callback: (payload: any) => void) => void;
  stopConnection: (messageType: string) => void;
  getConnectionState: (messageType: string) => HubConnectionState;
  isConnected: (messageType: string) => boolean;
}

export const SignalRContext = createContext<SignalRContextType>({
  registerOnServerEvents: () => {},
  stopConnection: () => {},
  getConnectionState: () => HubConnectionState.Disconnected,
  isConnected: () => false,
});

export const useSignalR = () => useContext(SignalRContext);
