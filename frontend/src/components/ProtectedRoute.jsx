import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyToken } from "../services/authServices";

function ProtectedRoute({ children }) {
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setChecking(false);
                return;
            }

            try {
                await verifyToken();
                setAuthenticated(true);
            } catch (error) {
                localStorage.removeItem("token");
            } finally {
                setChecking(false);
            }
        };

        checkAuthentication();
    }, []);

    if (checking) {
        return <div>Checking authentication...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;