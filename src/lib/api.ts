
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  const baseUrl = getBackendUrl();
  
  // Build URL with query params
  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Get token from localStorage for authenticated requests
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Log error but don't throw for server errors (5xx)
      if (response.status >= 500) {
        console.error(`Server error (${response.status}):`, errorData);
        // Return empty array or default value for 5xx errors
        return [] as unknown as T;
      }
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : (null as unknown as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Return empty array for network errors to prevent app crashes
    console.error("API request failed:", error);
    return [] as unknown as T;
  }
}

// Upload form data (multipart/form-data)
async function uploadFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}${endpoint}`;

  // Get token from localStorage for authenticated requests
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status >= 500) {
        console.error(`Server error (${response.status}):`, errorData);
        return [] as unknown as T;
      }
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (null as unknown as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Upload request failed:", error);
    return [] as unknown as T;
  }
}

// API methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),

  uploadFormData: <T>(endpoint: string, formData: FormData) =>
    uploadFormData<T>(endpoint, formData),
};

export default api;

