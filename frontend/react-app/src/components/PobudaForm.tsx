import { useState } from "react";
import { dodajPobudo } from "../api/pobudeApi";

export default function PobudaForm() {
    const [naslov, setNaslov] = useState("");
    const [kraj, setKraj] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dodajPobudo(naslov, kraj);
            alert("Pobuda uspešno oddana!");
            setNaslov("");
            setKraj("");
        } catch (err) {
            alert("Napaka pri oddaji.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Dodaj novo pobudo</h3>
            <div>
                <label>Naslov:</label>
                <input value={naslov} onChange={(e) => setNaslov(e.target.value)} required />
            </div>
            <div>
                <label>Kraj:</label>
                <input value={kraj} onChange={(e) => setKraj(e.target.value)} required />
            </div>
            <button type="submit">Oddaj</button>
        </form>
    );
}
