import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/login" replace />;

    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decoded.exp < currentTime) {
            // Token is expired! Clean up and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            return <Navigate to="/login" replace />;
        }
        
        return <Outlet />;
    } catch (error) {
        // If token is malformed
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;

