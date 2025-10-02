import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
    <footer className="footer bg-light text-center py-3 mt-auto" role="contentinfo">
        <div className="container">
            <span>© 2025 Mestna občina Ljubljana</span>
            <span className="mx-2" aria-hidden="true">|</span>
            <Link to="/pravno-obvestilo" aria-label="Pravno obvestilo - Legal notice">Pravno obvestilo</Link>
            <span className="mx-2" aria-hidden="true">|</span>
            <Link to="/pomoc" aria-label="Pomoč - Help">Pomoč</Link>
        </div>
    </footer>
);

export default Footer;
