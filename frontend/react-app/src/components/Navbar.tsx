import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('admin_token') === 'dummy-admin-token';

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
                <Link className="navbar-brand" to="/" aria-label="Pobude Ljubljana - Go to homepage">Pobude Ljubljana</Link>
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
                            <Link className="nav-link" to="/" role="menuitem">Home</Link>
                        </li>
                        <li className="nav-item" role="none">
                            <Link className="nav-link" to="/pobude" role="menuitem">Vse Pobude</Link>
                        </li>
                        <li className="nav-item" role="none">
                            <a 
                                className="nav-link" 
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
                                    className="nav-link" 
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 