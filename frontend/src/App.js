import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Pobude from "./pages/Pobude";

function App() {
    return (
        <Router>
            <>
                <nav style={{ margin: "1em" }}>
                    <Link to="/" style={{ marginRight: "1em" }}>Zemljevid</Link>
                    <Link to="/pobude">Pobude</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pobude" element={<Pobude />} />
                </Routes>
            </>
        </Router>
    );
}

export default App;
