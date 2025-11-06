import { BrowserRouter } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Router from "./routes/Router";

function App() {
    return (
        <BrowserRouter>
            <div className="d-flex flex-column min-vh-100">
                <a href="#main-content" className="visually-hidden-focusable position-absolute top-0 start-0 p-3 bg-primary text-white text-decoration-none" style={{ zIndex: 9999 }}>
                    Skip to main content
                </a>
                
                <Header />
                <main id="main-content" className="flex-grow-1 py-4" role="main">
                    <Router />
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
