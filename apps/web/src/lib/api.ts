import { useAuth } from '../providers/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  status: string;
  statusCode: number;
  message: string;
}

export class AppError extends Error {
  statusCode: number;
  constructor(data: ApiError) {
    super(data.message);
    this.statusCode = data.statusCode;
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  token: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new AppError(data as ApiError);
  }

  return data as T;
}

export const useApi = () => {
  const { token } = useAuth();

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }, token),
    post: <T>(path: string, body: any) => 
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),
    put: <T>(path: string, body: any) => 
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, token),
    patch: <T>(path: string, body: any) => 
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }, token),
  };
};
