export function getApiUrl(): string {
    const url = import.meta.env.VITE_API_URL;
    if (!url) throw new Error("Missing VITE_API_URL in environment.");
    return url;
}
