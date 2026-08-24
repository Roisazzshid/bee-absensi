export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/proxy").replace(/\/$/, "");

export type ApiResponse<T> = { status: "success" | "error"; message: string; data: T; errors?: Record<string, string[] | string> | null };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: ApiResponse<never>["errors"]) { super(message); }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<ApiResponse<T>> {
  // When body is FormData, let the browser set Content-Type (with multipart boundary) automatically
  const isFormData = options.body instanceof FormData;
  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...baseHeaders, ...(options.headers as Record<string, string> | undefined) },
  });
  const body = (await response.json().catch(() => ({ status: "error", message: "Server mengirim respons yang tidak valid.", data: null }))) as ApiResponse<T>;
  if (!response.ok) throw new ApiError(body.message || "Permintaan ke server gagal.", response.status, body.errors);
  return body;
}
