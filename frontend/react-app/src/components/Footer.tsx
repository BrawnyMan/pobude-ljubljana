import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
    <footer className="footer bg-light text-center py-3 mt-auto">
        <div className="container">
            <span>© 2015 Mestna občina Ljubljana</span>
            <span className="mx-2">|</span>
            <Link to="/pravno-obvestilo">Pravno obvestilo</Link>
            <span className="mx-2">|</span>
            <Link to="/pomoc">Pomoč</Link>
        </div>
    </footer>
);

export default Footer;
