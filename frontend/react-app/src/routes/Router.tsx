import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PobudePage from '../pages/PobudePage';
import AdminPage from '../pages/AdminPage';

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pobude" element={<PobudePage />} />
            <Route path="/admin" element={<AdminPage />} />
        </Routes>
    );
};

export default Router;
