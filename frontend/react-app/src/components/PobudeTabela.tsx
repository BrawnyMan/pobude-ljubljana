import { useEffect, useState } from "react";
import { pridobiPobude, Pobuda } from "../api/pobudeApi";

export default function PobudeTabela() {
    const [pobude, setPobude] = useState<Pobuda[]>([]);

    useEffect(() => {
        pridobiPobude().then(setPobude).catch(() => alert("Napaka pri nalaganju pobud."));
    }, []);

    return (
        <div>
            <h3>Vse pobude</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Naslov</th>
                        <th>Kraj</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {pobude.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.naslov}</td>
                            <td>{p.kraj}</td>
                            <td>{p.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
