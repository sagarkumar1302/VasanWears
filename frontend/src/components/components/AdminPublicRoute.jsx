import { Navigate, Outlet } from "react-router-dom";
import Loader from "../Common/Loader";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";

const AdminPublicRoute = () => {
  const { user, isAuthChecked } = useAdminAuthStore();

  if (!isAuthChecked) {
    return (
      <>
        <Loader />
      </>
    ); // or spinner
  }

  return user ? <Navigate to="/admin/dashboard" replace /> : <Outlet />;
};

export default AdminPublicRoute;
