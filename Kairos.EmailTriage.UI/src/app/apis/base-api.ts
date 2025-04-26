export class BaseApiService {
  protected getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  protected handleError(error: unknown, message: string): undefined {
    console.error(`${message}:`, error);
    return undefined;
  }

  protected async fetchWithAuth<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T | undefined> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return this.handleError(error, `API call to ${url} failed`);
    }
  }
}