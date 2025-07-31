import { useState } from "react"

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SubmitForm = () => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const input = { title, description }

        try {
            const res = await fetch(`${API_BASE_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            })

            if (!res.ok) {
                throw new Error('Failed to analyze initiative')
            }

            const data = await res.json()
            alert("AI predlog:\n" + data.analysis)
        } catch (err) {
            console.error("Napaka pri AI analizi", err)
            setError("Napaka pri AI analizi. Poskusite znova.")
        } finally {
            setIsSubmitting(false)
        }

        setTitle("")
        setDescription("")
    }

    return (
        <form onSubmit={handleSubmit} role="form" aria-label="AI analysis form">
            <h2 className="mb-3">Oddaj novo pobudo</h2>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Naslov:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                    aria-describedby="title-help"
                    disabled={isSubmitting}
                />
                <div id="title-help" className="form-text">
                    Vnesite naslov pobude (3-100 znakov)
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="description" className="form-label">Opis:</label>
                <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={4}
                    aria-describedby="description-help"
                    disabled={isSubmitting}
                ></textarea>
                <div id="description-help" className="form-text">
                    Opisite vašo pobudo (10-500 znakov)
                </div>
            </div>
            
            {error && (
                <div className="alert alert-danger mb-3" role="alert" aria-live="polite">
                    {error}
                </div>
            )}
            
            <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                aria-describedby={isSubmitting ? "submitting-status" : undefined}
            >
                {isSubmitting ? 'Analiziram...' : 'Oddaj'}
            </button>
            
            {isSubmitting && (
                <div id="submitting-status" className="visually-hidden" aria-live="polite">
                    Analiziram pobudo, prosimo počakajte...
                </div>
            )}
        </form>
    )
}

export default SubmitForm
