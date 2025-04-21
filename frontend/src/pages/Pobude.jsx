import React, { useEffect, useState } from "react";
import { pridobiVsePobude } from "../api/pobudeApi";
import PobudaCard from "../components/PobudaCard";

export default function Pobude() {
    const [pobude, setPobude] = useState([]);

    useEffect(() => {
        pridobiVsePobude().then(setPobude);
    }, []);

    return (
        <div>
            <h1>Oddane pobude</h1>
            {pobude.map(p => <PobudaCard key={p.id} pobuda={p} />)}
        </div>
    );
}
