const API_BASE_URL = (import.meta as any).env.VITE_API_URL;

export const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const clearAuth = (): void => {
  localStorage.removeItem('admin_token');
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  if (!token) {
    clearAuth();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('No authentication token');
  }

  const defaultHeaders: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };
  
  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401 || response.status === 403) {
    clearAuth();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Authentication failed');
  }

  return response;
};

