import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AxiosError } from 'axios';
import { apiClient } from '../config/api';

interface User {
  id?: string;
  userId?: string;
  username: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

interface ApiError {
  message: string;
}

const TOKEN_KEY = 'token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

const setApiToken = (token: string) => {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  apiClient.defaults.headers.common['X-Session-Token'] = token;
};

const clearApiToken = () => {
  delete apiClient.defaults.headers.common.Authorization;
  delete apiClient.defaults.headers.common['X-Session-Token'];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (token) {
      setApiToken(token);
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get<User>('/api/auth/me');
      setUser({
        id: response.data.id || response.data.userId,
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
      });
      setIsAuthenticated(true);
    } catch {
      removeToken();
      clearApiToken();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', {
        username,
        password,
      });

      const { access_token, user } = response.data;
      setToken(access_token);
      setApiToken(access_token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Local session cleanup still needs to happen if the API is unavailable.
    } finally {
      removeToken();
      clearApiToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
