import { useEffect, useState } from "react";
import InitiativeForm from "../components/InitiativeForm";
import InitiativeTable from "../components/InitiativeTable";
import { getApiUrl } from "../api/config";

const API_URL = getApiUrl();

export default function Home() {
    const [initiatives, setInitiatives] = useState([]);

    const fetchInitiatives = () => {
        fetch(`${API_URL}/pobude`)
            .then((res) => res.json())
            .then(setInitiatives)
            .catch((err) => console.error("Napaka pri nalaganju:", err));
    };

    useEffect(() => {
        fetchInitiatives();
    }, []);

    return (
        <>
            <InitiativeForm onSubmitted={fetchInitiatives} />
            <hr className="my-5" />
            <InitiativeTable data={initiatives} />
        </>
    );
}
