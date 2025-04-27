"use client";

import { ReactNode } from "react";
import { AuthContextProvider } from "./auth/AuthContextProvider";
import { TicketContextProvider } from "./ticket/TicketContextProvider";
import { LabelContextProvider } from "./label/LabelContextProvider";
import { SignalRContextProvider } from "./signalr/SignalrContextProvider";
import { NavigationContextProvider } from "./navigation/NavigationContextProvider";
// import { SignalRProvider } from "@/contexts/SignalRProvider"; // if you have it later

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthContextProvider>
      <NavigationContextProvider>
        <TicketContextProvider>
          <LabelContextProvider>
            <SignalRContextProvider>
              {children}
            </SignalRContextProvider>
          </LabelContextProvider>
        </TicketContextProvider>
      </NavigationContextProvider>
    </AuthContextProvider>
  );
}
