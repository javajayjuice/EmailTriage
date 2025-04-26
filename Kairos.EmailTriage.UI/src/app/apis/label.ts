import { Label } from "@/models";
import { CacheService } from "./cache-service";

const LABELS_CACHE_KEY = 'all_labels';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - labels change less frequently

const getAllLabels = async (): Promise<Label[] | undefined> => {
  // Check cache first
  const cachedLabels = CacheService.get<Label[]>(LABELS_CACHE_KEY);
  if (cachedLabels) {
    console.log("Using cached labels data");
    return cachedLabels;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://localhost:44311/api/services/app/Label/GetAllLables",
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
    
    const jsonResponse: { result: Label[] } = await response.json();
    console.log("Labels fetched successfully:", jsonResponse.result);
    
    // Store in cache
    CacheService.set(LABELS_CACHE_KEY, jsonResponse.result, CACHE_DURATION);
    
    return jsonResponse.result;
  } catch (err) {
    console.error("Error fetching labels:", err);
    return undefined;
  }
};

export const labelApiService = {
  getAllLabels,
  // Helper method to invalidate cache when needed
  invalidateCache: () => CacheService.invalidate(LABELS_CACHE_KEY)
};