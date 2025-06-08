const API_BASE_URL = 'http://localhost:8000/api';

export interface Pobuda {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  email: string;
  image_path: string | null;
  status: string;
  created_at: string;
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

export const getPobude = async (): Promise<Pobuda[]> => {
  const response = await fetch(`${API_BASE_URL}/pobude`);

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