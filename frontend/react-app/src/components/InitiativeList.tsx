import { Initiative } from "../types/initiative"
import InitiativeCard from "./InitiativeCard"

interface Props {
    initiatives: Initiative[]
}

const InitiativeList: React.FC<Props> = ({ initiatives }) => {
    return (
        <div className="container">
            {initiatives.map(i => (
                <InitiativeCard key={i.id} initiative={i} />
            ))}
        </div>
    )
}

export default InitiativeList
