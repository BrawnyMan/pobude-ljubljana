import { Link } from "react-router-dom"

const Header = () => {
    return (
        <header className="bg-primary text-white py-3">
            <div className="container">
                <h1 className="h3 mb-2">Pobude meščanov</h1>
                <nav>
                    <Link to="/" className="text-white me-3 text-decoration-none">Domov</Link>
                    <Link to="/pobude" className="text-white me-3 text-decoration-none">Vse pobude</Link>
                    <Link to="/admin" className="text-white text-decoration-none">Admin</Link>
                </nav>
            </div>
        </header>
    )
}

export default Header
