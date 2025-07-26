import { Initiative } from "../types/initiative"

interface Props {
    initiative: Initiative
}

const InitiativeCard: React.FC<Props> = ({ initiative }) => {
    return (
        <article className="card mb-3">
            <div className="card-body">
                <h2 className="card-title h5">{initiative.title}</h2>
                <p className="card-text">{initiative.description}</p>
                <p className="card-text">
                    <small className="text-muted">
                        Status: <span aria-label={`Status: ${initiative.status}`}>{initiative.status}</span>
                    </small>
                </p>
                <p className="card-text">
                    <small className="text-muted">
                        Datum: {initiative.createdAt}
                    </small>
                </p>
            </div>
        </article>
    )
}

export default InitiativeCard
