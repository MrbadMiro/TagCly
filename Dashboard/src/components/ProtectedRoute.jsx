import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const userRole = userInfo?.role;

    if (!userInfo) {
        return <Navigate to="/login" replace />; // Redirect to login if not authenticated
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />; // Redirect to home if role is not allowed
    }

    return <Outlet />; // Render the child routes if allowed
};

export default ProtectedRoute;