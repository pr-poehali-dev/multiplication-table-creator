import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TelegramUser } from "@/components/TelegramAuth";

interface AuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  login: (user: TelegramUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("telegram_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("telegram_user");
      }
    }
  }, []);

  const login = async (telegramUser: TelegramUser) => {
    try {
      const response = await fetch("https://functions.poehali.dev/56712dda-5408-4d19-bda6-42dc97480e9e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramUser),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          setUser(telegramUser);
          setIsAuthenticated(true);
          localStorage.setItem("telegram_user", JSON.stringify(telegramUser));
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("telegram_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
