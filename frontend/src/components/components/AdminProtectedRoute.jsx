import { Navigate, Outlet } from "react-router-dom";
import Loader from "../Common/Loader";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";

const AdminProtectedRoute = () => {
  const { user, isAuthChecked } = useAdminAuthStore();

  if (!isAuthChecked) {
    return (
      <>
        <Loader />
      </>
    ); // or spinner
  }

  return user ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminProtectedRoute;
