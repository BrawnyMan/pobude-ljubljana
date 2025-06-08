import Header from "./components/Header"
import Footer from "./components/Footer"
import Router from "./routes/Router"
import { BrowserRouter } from "react-router-dom"

function App() {
    return (
        <BrowserRouter>
            <Header />
            <main className="min-vh-100 py-4">
                <Router />
            </main>
            <Footer />
        </BrowserRouter>
    )
}

export default App
