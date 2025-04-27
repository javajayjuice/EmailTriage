"use client";

import { ReactNode } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr"; // Make sure HubConnectionState is imported
import { Ticket } from "@/models";
import { SignalRContext } from "./SignalrContext";

interface Props {
  children: ReactNode;
}

// Store connections and their started state
const connections = {} as { [key: string]: { type: string; connection: HubConnection; started: boolean } };

function createConnection(messageType: string): HubConnection {
  // Check if a connection for this messageType already exists
  if (connections[messageType]) {
    return connections[messageType].connection;
  }

  // Create a new connection if it doesn't exist
  console.log("SOCKET: Creating new connection for ", messageType);
  
  // Get token for authentication
  const token = localStorage.getItem("token");
  
  const connection = new HubConnectionBuilder()
    .withUrl("https://localhost:44311/hub", {
      logger: LogLevel.Information,
      accessTokenFactory: () => token || "", // Use token for authentication
      withCredentials: false,
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000]) // Configure reconnect intervals
    .configureLogging(LogLevel.Information)
    .build();

  // Store the new connection
  connections[messageType] = {
    type: messageType,
    connection: connection,
    started: false,
  };

  // Setup close handler to update started state
  connection.onclose((error) => {
    console.log(`SOCKET: Connection closed for ${messageType}. Error: ${error}`);
    if (connections[messageType]) {
      connections[messageType].started = false;
    }
    
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (connections[messageType]) {
        console.log(`SOCKET: Attempting to reconnect for ${messageType}...`);
        startConnection(messageType);
      }
    }, 5000);
  });

  return connection;
}

// Modified startConnection to accept messageType and manage state correctly
const startConnection = async (messageType: string) => {
  const connectionObj = connections[messageType];

  // Ensure connection object exists and is not already started/starting
  if (connectionObj && connectionObj.connection.state === HubConnectionState.Disconnected) {
    try {
      console.log(`SOCKET: Starting connection for ${messageType}...`);
      await connectionObj.connection.start();
      connectionObj.started = true; // Mark as started
      console.log(`SOCKET: Connection started successfully for ${messageType}. State: ${connectionObj.connection.state}`);
      
      // Invoke a method to join a specific group if needed
      try {
        await connectionObj.connection.invoke("JoinGroup", messageType);
        console.log(`SOCKET: Joined group ${messageType}`);
      } catch (invokeError) {
        console.warn(`SOCKET: Error joining group ${messageType}:`, invokeError);
        // Continue even if joining group fails
      }
    } catch (err) {
      console.error(`SOCKET: Failed to start connection for ${messageType}: `, err);
      connectionObj.started = false; // Ensure started is false on error
      
      // Implement exponential backoff for reconnection
      setTimeout(() => {
        if (connections[messageType]) {
          console.log(`SOCKET: Attempting to reconnect for ${messageType}...`);
          startConnection(messageType);
        }
      }, 5000);
    }
  } else if (connectionObj && connectionObj.connection.state !== HubConnectionState.Disconnected) {
    console.log(`SOCKET: Connection for ${messageType} is already in state: ${connectionObj.connection.state}.`);
    // Ensure the 'started' flag reflects the actual connection state
    connectionObj.started = connectionObj.connection.state === HubConnectionState.Connected;
  } else if (!connectionObj) {
    console.error(`SOCKET: Attempted to start a non-existent connection for ${messageType}.`);
  }
};

function stopConnection(messageType: string) {
  const connectionObj = connections[messageType];
  if (connectionObj && connectionObj.started) { // Only stop if started
    console.log(`SOCKET: Stopping connection for ${messageType}`);
    // Don't remove the connection object, just stop it.
    // Automatic reconnect might restart it, or subsequent register calls might reuse it.
    connectionObj.connection.stop()
      .then(() => {
        connectionObj.started = false;
        console.log(`SOCKET: Connection stopped for ${messageType}`);
      })
      .catch(err => console.error(`SOCKET: Error stopping connection for ${messageType}: `, err));
  } else if (connectionObj && !connectionObj.started) {
      console.log(`SOCKET: Connection for ${messageType} already stopped or not started.`);
  }
}

function registerOnServerEvents(messageType: string, callback: (payload: any) => void) { // Use 'any' or a more specific type for payload
  try {
    const connection = createConnection(messageType); // Ensures connection exists

    // Remove existing handlers for this messageType to prevent duplicates
    connection.off(messageType);

    // Register the new handler
    connection.on(messageType, (payload: any) => { // Use 'any' or a specific type
      // console.log(`SOCKET: Received message for ${messageType}:`, payload); // Optional: Log received messages
      callback(payload);
    });

    // Start the connection if it's not already connected/connecting
    if (connection.state === HubConnectionState.Disconnected) {
       startConnection(messageType); // Pass messageType
    } else {
       console.log(`SOCKET: Connection for ${messageType} already exists and is in state: ${connection.state}`);
       // Ensure the started flag is correct if the connection was already established
       if (connections[messageType]) {
           connections[messageType].started = connection.state === HubConnectionState.Connected;
       }
    }

  } catch (error) {
    console.error(`SOCKET: Error registering events for ${messageType}: `, error);
  }
}

function monitorConnectionState(messageType: string, connection: HubConnection) {
  const states = {
    [HubConnectionState.Disconnected]: "Disconnected",
    [HubConnectionState.Connected]: "Connected", 
    [HubConnectionState.Connecting]: "Connecting",
    [HubConnectionState.Disconnecting]: "Disconnecting",
    [HubConnectionState.Reconnecting]: "Reconnecting",
  };

  // Log state changes
  const oldState = connection.state;
  const interval = setInterval(() => {
    if (connection.state !== oldState) {
      console.log(`SOCKET: Connection state changed for ${messageType}: ${states[oldState]} -> ${states[connection.state]}`);
      
      // Update the stored state
      if (connections[messageType]) {
        connections[messageType].started = connection.state === HubConnectionState.Connected;
      }
    }
  }, 1000);
  
  return interval;
}

export function SignalRContextProvider({ children }: Props) {
  return (
    <SignalRContext.Provider
      value={{
        registerOnServerEvents,
        stopConnection,
        getConnectionState: (messageType: string) => 
          connections[messageType]?.connection.state ?? HubConnectionState.Disconnected,
        isConnected: (messageType: string) => 
          connections[messageType]?.connection.state === HubConnectionState.Connected,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
}
