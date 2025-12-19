import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Loader from "../Common/Loader";

const ProtectedRoute = () => {
  const { user, isAuthChecked } = useAuthStore();
  const location = useLocation();

  if (!isAuthChecked) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
