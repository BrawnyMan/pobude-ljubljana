import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PobudePage from '../pages/PobudePage';
import AdminPage from '../pages/AdminPage';
import LoginPage from '../pages/LoginPage';
import PravnoObvestiloPage from '../pages/PravnoObvestiloPage';
import PomocPage from '../pages/PomocPage';
import StatisticsPage from '../pages/StatisticsPage';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const isLoggedIn = localStorage.getItem('admin_token') === 'dummy-admin-token';
    return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pobude" element={<PobudePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/pravno-obvestilo" element={<PravnoObvestiloPage />} />
            <Route path="/pomoc" element={<PomocPage />} />
        </Routes>
    );
};

export default Router;
