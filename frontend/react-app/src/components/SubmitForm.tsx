import { useState } from "react"

const SubmitForm = () => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const input = { title, description }

        try {
            const res = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            })

            const data = await res.json()
            alert("AI predlog:\n" + data.analysis)
        } catch (err) {
            console.error("Napaka pri AI analizi", err)
        }

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
