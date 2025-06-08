import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/HomePage"
import AllInitiativesPage from "../pages/AllInitiativesPage"
import AdminPage from "../pages/AdminPage"

const Router = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pobude" element={<AllInitiativesPage />} />
        <Route path="/admin" element={<AdminPage />} />
    </Routes>
)

export default Router
