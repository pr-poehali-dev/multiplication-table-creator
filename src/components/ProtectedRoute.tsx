import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import TelegramAuth from "./TelegramAuth";
import UserProfile from "./UserProfile";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <TelegramAuth onAuth={login} />;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <UserProfile />
      </div>
      {children}
    </>
  );
};

export default ProtectedRoute;