import { BrowserRouter } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Router from "./routes/Router";

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column min-vh-100">
                <Header />
                <main className="flex-grow-1 py-4">
                    <Router />
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
