import { useState } from "react"

const SubmitForm = () => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Oddana pobuda:", { title, description })
        setTitle("")
        setDescription("")
    }

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="mb-3">Oddaj novo pobudo</h3>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Naslov:</label>
                <input
                    type="text"
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="description" className="form-label">Opis:</label>
                <textarea
                    id="description"
                    className="form-control"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Oddaj</button>
        </form>
    )
}

export default SubmitForm
