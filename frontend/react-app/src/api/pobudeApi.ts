const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Pobuda {
    id: number;
    naslov: string;
    kraj: string;
    status: string;
}

export async function pridobiPobude(): Promise<Pobuda[]> {
    const res = await fetch(`${API_URL}/pobude`);
    if (!res.ok) throw new Error("Napaka pri pridobivanju pobud.");
    return res.json();
}

export async function dodajPobudo(naslov: string, kraj: string): Promise<Pobuda> {
    const res = await fetch(`${API_URL}/ustvari-nakljucno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naslov, kraj }),
    });
    if (!res.ok) throw new Error("Napaka pri dodajanju pobude.");
    return res.json();
}
