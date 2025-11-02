import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import TelegramAuth from "./TelegramAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <TelegramAuth onAuth={login} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
