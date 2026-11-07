"use client";

import { createContext, useContext } from "react";

const WhatsAppContext = createContext<string>("");

/** Provides the store's WhatsApp digits (Site settings, else env) to client components. */
export const WhatsAppProvider = WhatsAppContext.Provider;

export function useWhatsAppDigits() {
  return useContext(WhatsAppContext);
}
