import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
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
        <header className="header bg-primary text-white py-3">
            <div className="container d-flex justify-content-between align-items-center">
                <h1 className="mb-0">Pobude Ljubljana</h1>
                <nav>
                    <ul className="nav">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/">Domov</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/pobude">Pobude</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white" href="/admin" onClick={handleAdminClick}>Admin</a>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item">
                                <a className="nav-link text-white" href="/logout" onClick={handleLogout}>Logout</a>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
