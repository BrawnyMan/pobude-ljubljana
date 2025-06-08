import { useState } from "react"
import { Initiative } from "../types/initiative"
import InitiativeCard from "./InitiativeCard"

const mockData: Initiative[] = [
    {
        id: 1,
        title: "Popravilo ceste",
        description: "Na Dunajski cesti so velike luknje.",
        status: "pending",
        location: { lat: 46.05, lng: 14.5 },
        createdAt: "2025-05-20"
    }
]

const AdminPanel = () => {
    const [initiatives, setInitiatives] = useState<Initiative[]>(mockData)

    const handleApprove = (id: number) => {
        setInitiatives(prev =>
            prev.map(i => (i.id === id ? { ...i, status: "approved" } : i))
        )
    }

    const handleReject = (id: number) => {
        setInitiatives(prev =>
            prev.map(i => (i.id === id ? { ...i, status: "rejected" } : i))
        )
    }

    return (
        <div className="container">
            {initiatives.map(i => (
                <div key={i.id} className="card mb-3 p-3">
                    <InitiativeCard initiative={i} />
                    <div className="mt-2">
                        <button className="btn btn-success me-2" onClick={() => handleApprove(i.id)}>Odobri</button>
                        <button className="btn btn-danger" onClick={() => handleReject(i.id)}>Zavrni</button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AdminPanel
