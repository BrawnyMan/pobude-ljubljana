import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// CSS styles for focus states
const focusStyles = `
  /* Remove any default outline behavior */
  * {
    outline: none;
  }
  
  /* Force focus styles on ALL links and buttons */
  a:focus,
  button:focus {
    background-color: rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 0 0 3px #ffffff !important;
    outline: 3px solid #ffffff !important;
    outline-offset: 2px !important;
    border-radius: 4px !important;
    z-index: 9999 !important;
    position: relative !important;
  }
  
  /* Specific targeting for your header structure */
  header.header a:focus,
  header.header a.nav-link:focus,
  header.header a.text-white:focus,
  nav[role="navigation"] a:focus,
  nav[role="navigation"] a.nav-link:focus,
  h1 a:focus,
  .nav-link:focus,
  .text-white:focus {
    background-color: rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 0 0 3px #ffffff !important;
    outline: 3px solid #ffffff !important;
    outline-offset: 2px !important;
    border-radius: 4px !important;
    z-index: 9999 !important;
    position: relative !important;
  }
  
  /* For navbar component if used */
  nav.navbar a:focus,
  nav.navbar button:focus,
  nav.navbar .nav-link:focus,
  nav.navbar .navbar-brand:focus,
  nav.navbar .navbar-toggler:focus {
    background-color: #e9ecef !important;
    box-shadow: 0 0 0 3px #0d6efd !important;
    outline: 3px solid #0d6efd !important;
    outline-offset: 2px !important;
    border-radius: 4px !important;
    z-index: 9999 !important;
    position: relative !important;
  }
`;

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('admin_token') === 'dummy-admin-token';

    // Inject styles when component mounts
    useEffect(() => {
        const styleId = 'navbar-focus-styles';
        
        // Remove existing style if present
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create and inject new style element
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = focusStyles;
        document.head.appendChild(styleElement);
        
        // Cleanup on unmount
        return () => {
            const style = document.getElementById(styleId);
            if (style) {
                style.remove();
            }
        };
    }, []);

    const handleAdminClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate(isLoggedIn ? '/admin' : '/login');
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('admin_token');
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light" role="navigation" aria-label="Main navigation">
            <div className="container-fluid">
                <Link 
                    className="navbar-brand" 
                    to="/" 
                    aria-label="Pobude Ljubljana - Go to homepage"
                >
                    Pobude Ljubljana
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation menu"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav" role="menubar">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item" role="none">
                            <Link 
                                className="nav-link" 
                                to="/" 
                                role="menuitem"
                                aria-label="Pojdi na domačo stran"
                            >
                                Domov
                            </Link>
                        </li>
                        <li className="nav-item" role="none">
                            <Link 
                                className="nav-link" 
                                to="/pobude" 
                                role="menuitem"
                                aria-label="Preglej vse pobude"
                            >
                                Vse Pobude
                            </Link>
                        </li>
                        <li className="nav-item" role="none">
                            <a 
                                className="nav-link" 
                                href="/admin" 
                                onClick={handleAdminClick}
                                role="menuitem"
                                aria-label={isLoggedIn ? "Pojdi na administratorsko ploščo" : "Prijavi se v administratorsko ploščo"}
                            >
                                Admin
                            </a>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item" role="none">
                                <a 
                                    className="nav-link" 
                                    href="/logout" 
                                    onClick={handleLogout}
                                    role="menuitem"
                                    aria-label="Odjavi se iz administratorskega računa"
                                >
                                    Odjava
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;