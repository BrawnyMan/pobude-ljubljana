import { getApiUrl } from "../api/config";
import { useState } from "react";

const API_URL = getApiUrl();

export default function InitiativeForm({ onSubmitted }: { onSubmitted: () => void }) {
    const [location, setLocation] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [email, setEmail] = useState("");
    const [captcha, setCaptcha] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            location,
            title,
            description,
            email,
            captcha,
        };

        try {
            const response = await fetch(`${API_URL}/pobude`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Napaka pri oddaji.");
            alert("Pobuda uspešno oddana!");

            setLocation("");
            setTitle("");
            setDescription("");
            setEmail("");
            setCaptcha("");

            if (onSubmitted) onSubmitted();
        } catch (err) {
            alert("Napaka: preverite podatke in poskusite znova.");
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="container mt-4" style={{ maxWidth: "600px" }}>
            <h2 className="mb-4">Dodaj pobudo</h2>

            <div className="mb-3">
                <label htmlFor="location" className="form-label">1. korak: Izberite lokacijo</label>
                <select
                    id="location"
                    className="form-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                >
                    <option value="">-- izberite kraj --</option>
                    <option value="Ljubljana - Center">Ljubljana - Center</option>
                    <option value="Ljubljana - Šiška">Ljubljana - Šiška</option>
                    <option value="Ljubljana - Vič">Ljubljana - Vič</option>
                    <option value="Ljubljana - Bežigrad">Ljubljana - Bežigrad</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="title" className="form-label">2. korak: Naslov pobude</label>
                <input
                    id="title"
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="form-label">Opis pobude</label>
                <textarea
                    id="description"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                />
            </div>

            <div className="mb-3">
                <button type="button" className="btn btn-secondary" disabled>
                    Dodaj fotografije (v pripravi)
                </button>
            </div>

            <div className="mb-3">
                <label htmlFor="email" className="form-label">3. korak: Vaš e-poštni naslov</label>
                <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="captcha" className="form-label">4. korak: Verifikacija</label>
                <input
                    id="captcha"
                    type="text"
                    className="form-control"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary w-100">
                Oddaj pobudo
            </button>
        </form>
    );
}
