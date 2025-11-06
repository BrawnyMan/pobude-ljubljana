import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const focusStyles = `
  header.header a:focus {
    background-color: rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 0 0 3px #ffffff !important;
    outline: 3px solid #ffffff !important;
    outline-offset: 2px !important;
    border-radius: 4px !important;
    z-index: 9999 !important;
    position: relative !important;
  }
  
  header.header h1 a:focus,
  header.header .nav-link:focus,
  header.header a.text-white:focus {
    background-color: rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 0 0 3px #ffffff !important;
    outline: 3px solid #ffffff !important;
    outline-offset: 2px !important;
    border-radius: 4px !important;
    z-index: 9999 !important;
    position: relative !important;
  }
`;

const Header: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('admin_token') !== null;

    
    useEffect(() => {
        const styleId = 'header-focus-styles';
        
        
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = focusStyles;
        document.head.appendChild(styleElement);
        
        
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
        <header className="header bg-primary text-white py-3" role="banner">
            <div className="container d-flex justify-content-between align-items-center">
                <h1 className="mb-0">
                    <Link to="/" className="text-white text-decoration-none" aria-label="Pobude Ljubljana - Go to homepage">
                        Pobude Ljubljana
                    </Link>
                </h1>
                <nav role="navigation" aria-label="Main navigation">
                    <ul className="nav" role="menubar">
                        <li className="nav-item" role="none">
                            <Link className="nav-link text-white" to="/" role="menuitem">Domov</Link>
                        </li>
                        <li className="nav-item" role="none">
                            <Link className="nav-link text-white" to="/pobude" role="menuitem">Pobude</Link>
                        </li>
                        <li className="nav-item" role="none">
                            <Link className="nav-link text-white" to="/statistics" role="menuitem">Statistika</Link>
                        </li>
                        <li className="nav-item" role="none">
                            <a 
                                className="nav-link text-white" 
                                href="/admin" 
                                onClick={handleAdminClick}
                                role="menuitem"
                                aria-label={isLoggedIn ? "Admin dashboard" : "Admin login"}
                            >
                                Admin
                            </a>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item" role="none">
                                <a 
                                    className="nav-link text-white" 
                                    href="/logout" 
                                    onClick={handleLogout}
                                    role="menuitem"
                                    aria-label="Logout from admin account"
                                >
                                    Logout
                                </a>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;