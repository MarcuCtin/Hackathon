import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { api, User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = api.getToken();
        if (token) {
          const { data } = await api.getMe();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        api.clearToken();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email: string, password: string) {
    await api.login(email, password);
    const { data } = await api.getMe();
    setUser(data);
  }

  async function register(email: string, password: string, name?: string) {
    await api.register(email, password, name);
    const { data } = await api.getMe();
    setUser(data);
  }

  function logout() {
    api.clearToken();
    setUser(null);
  }

  async function refreshUser() {
    try {
      const token = api.getToken();
      if (token) {
        const { data } = await api.getMe();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
      api.clearToken();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
