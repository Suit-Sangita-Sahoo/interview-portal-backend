import React from "react";
import {
    Navigate,
    Outlet,
    useLocation
} from "react-router-dom";

function ProtectedRoute() {

    const location = useLocation();

    const token = localStorage.getItem("token");

    /*
     * No JWT means the user is not authenticated.
     */
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname
                }}
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;