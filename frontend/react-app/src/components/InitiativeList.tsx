import { Initiative } from "../types/initiative"
import InitiativeCard from "./InitiativeCard"

interface Props {
    initiatives: Initiative[]
}

const InitiativeList: React.FC<Props> = ({ initiatives }) => {
    return (
        <div className="container">
            <div role="list" aria-label="List of initiatives">
                {initiatives.map(i => (
                    <div key={i.id} role="listitem">
                        <InitiativeCard initiative={i} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default InitiativeList
