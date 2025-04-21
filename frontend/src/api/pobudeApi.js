const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function pridobiVsePobude() {
    const res = await fetch(`${API}/pobude`);
    return res.json();
}

export async function dodajNakljucnoPobudo() {
    const res = await fetch(`${API}/ustvari-nakljucno`, {
        method: "POST"
    });
    return res.json();
}
