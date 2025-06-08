import InitiativeList from "../components/InitiativeList"
import { Initiative } from "../types/initiative"

const mockInitiatives: Initiative[] = [
    {
        id: 1,
        title: "Popravilo pločnika",
        description: "Pločnik na Trubarjevi ulici je poškodovan.",
        status: "pending",
        location: { lat: 46.0569, lng: 14.5058 },
        createdAt: "2025-05-15"
    },
    {
        id: 2,
        title: "Več klopi v parku",
        description: "V Tivoliju primanjkuje klopi za starejše.",
        status: "approved",
        location: { lat: 46.0572, lng: 14.4899 },
        createdAt: "2025-05-10"
    }
]

const AllInitiativesPage = () => {
    return (
        <div className="container py-4">
            <h2 className="mb-4">Vse pobude</h2>
            <InitiativeList initiatives={mockInitiatives} />
        </div>
    )
}

export default AllInitiativesPage
