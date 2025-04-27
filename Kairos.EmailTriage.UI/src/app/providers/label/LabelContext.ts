"use client";

import { Label } from "@/models";
import { createContext, useContext } from "react";

interface LabelContextType {
  labels: Label[];
  selectedLabel: Label | null;
  loading: boolean;
  error: string | null;
  getAllLabels: () => Promise<void>;
  getLabelById: (id: string) => Promise<void>;
  createLabel: (label: Partial<Label>) => Promise<void>;
  updateLabel: (label: Label) => Promise<void>;
}

export const LabelContext = createContext<LabelContextType>({
  labels: [],
  selectedLabel: null,
  loading: false,
  error: null,
  getAllLabels: async () => {},
  getLabelById: async () => {},
  createLabel: async () => {},
  updateLabel: async () => {},
});

export const useLabel = () => useContext(LabelContext);
