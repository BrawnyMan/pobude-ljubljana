import { Initiative } from "../types/initiative"

interface Props {
    initiative: Initiative
}

const InitiativeCard: React.FC<Props> = ({ initiative }) => {
    return (
        <div className="card mb-3">
            <div className="card-body">
                <h5 className="card-title">{initiative.title}</h5>
                <p className="card-text">{initiative.description}</p>
                <p className="card-text">
                    <small className="text-muted">Status: {initiative.status}</small>
                </p>
                <p className="card-text">
                    <small className="text-muted">Datum: {initiative.createdAt}</small>
                </p>
            </div>
        </div>
    )
}

export default InitiativeCard
