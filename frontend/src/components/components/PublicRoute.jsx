import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Loader from "../Common/Loader";

const PublicRoute = () => {
  const { user, isAuthChecked } = useAuthStore();

  if (!isAuthChecked) {
    return (
      <>
        <Loader />
      </>
    ); // or spinner
  }

  // Check if user profile is complete
  const isProfileComplete = user?.phoneNumber && user?.phoneNumber.trim() !== "";

  // Allow access if no user OR user exists but profile incomplete
  return user && isProfileComplete ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
