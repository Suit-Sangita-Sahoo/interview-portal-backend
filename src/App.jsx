import React from "react";
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";

import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import AddCredential from "./pages/AddCredential";
import CredentialDetails from "./pages/CredentialDetails";
import EditCredential from "./pages/EditCredential";
import ShareCredential from "./pages/ShareCredential";
import TeamVault from "./pages/TeamVault";

function App() {
    return (
        <Routes>

            {/* =====================================================
                DEFAULT
            ===================================================== */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/register"
                        replace
                    />
                }
            />

            {/* =====================================================
                PUBLIC ROUTES
            ===================================================== */}

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            {/* =====================================================
                PROTECTED ROUTES
            ===================================================== */}

            <Route element={<ProtectedRoute />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/add-credential"
                    element={<AddCredential />}
                />

                <Route
                    path="/credentials/:id"
                    element={<CredentialDetails />}
                />

                <Route
                    path="/credentials/:id/edit"
                    element={<EditCredential />}
                />

                <Route
                    path="/credentials/:id/share"
                    element={<ShareCredential />}
                />

                <Route
                    path="/teams"
                    element={<TeamVault />}
                />

            </Route>

            {/* =====================================================
                UNKNOWN ROUTE
            ===================================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/register"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;