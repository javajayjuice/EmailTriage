"use client";

import { Label } from "@/models";
import { LabelContext } from "./LabelContext";
import { useState, ReactNode } from "react";

const API_URL = "https://localhost:44311/api/services/app/Label";

interface Props {
  children: ReactNode;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export function LabelContextProvider({ children }: Props) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllLabels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/GetAllLables`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch labels");
      }

      const data: { result: Label[] } = await response.json();
      setLabels(data.result || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getLabelById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/GetLableById?Id=${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch label");
      }

      const data = await response.json();
      setSelectedLabel(data.result || null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (label: Partial<Label>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/CreateLable`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(label),
      });

      if (!response.ok) {
        throw new Error("Failed to create label");
      }

      const data = await response.json();
      setLabels((prev) => [...prev, data.result]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateLabel = async (label: Label) => {
    if (!label.id) throw new Error("Label id is required for update");

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/UpdateLable`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(label),
      });

      if (!response.ok) {
        throw new Error("Failed to update label");
      }

      const data = await response.json();

      setLabels((prev) =>
        prev.map((l) => (l.id === data.result.id ? data.result : l))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LabelContext.Provider
      value={{
        labels,
        selectedLabel,
        loading,
        error,
        getAllLabels,
        getLabelById,
        createLabel,
        updateLabel,
      }}
    >
      {children}
    </LabelContext.Provider>
  );
}
