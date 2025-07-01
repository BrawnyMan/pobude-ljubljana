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
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Pobude Ljubljana</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/pobude">Vse Pobude</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/admin" onClick={handleAdminClick}>Admin</a>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item">
                                <a className="nav-link" href="/logout" onClick={handleLogout}>Logout</a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 