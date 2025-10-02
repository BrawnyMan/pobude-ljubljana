const API_BASE_URL = import.meta.env.VITE_API_URL;
export const API_ORIGIN = API_BASE_URL.replace(/\/?api\/?$/, '');
export const toAssetUrl = (path: string): string => `${API_ORIGIN}${path}`;

export interface Pobuda {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  email: string;
  image_path?: string;
  status: string;
  created_at: string;
  category: string;
  response?: string;
  responded_at?: string;
}

export const createPobuda = async (formData: FormData): Promise<Pobuda> => {
  const response = await fetch(`${API_BASE_URL}/pobude`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create pobuda');
  }

  return response.json();
};

export const getPobude = async (params?: { limit?: number; offset?: number }): Promise<Pobuda[]> => {
  const query = new URLSearchParams();
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  if (params?.offset !== undefined) query.set('offset', String(params.offset));
  const url = query.toString() ? `${API_BASE_URL}/pobude?${query}` : `${API_BASE_URL}/pobude`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch pobude');
  }

  return response.json();
};

export const getPobuda = async (id: number): Promise<Pobuda> => {
  const response = await fetch(`${API_BASE_URL}/pobude/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch pobuda');
  }

  return response.json();
}; 

export const searchStreets = async (query: string, limit: number = 20): Promise<string[]> => {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`${API_BASE_URL}/streets/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Napaka pri iskanju ulic');
  }
  return response.json();
};