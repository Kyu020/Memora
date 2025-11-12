// services/auth.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

// Simple in-memory store for the current user
let currentUser: User | null = null;
const subscribers: ((user: User | null) => void)[] = [];

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Registration failed');

      return result;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unable to connect to server. Please try again.');
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Login failed');

      if (result.data?.token && result.data.user) {
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        // Inject into in-memory current user
        currentUser = result.data.user;
        this.notifySubscribers(currentUser);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Unable to connect to server. Please try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      currentUser = null;
      this.notifySubscribers(currentUser);
    }
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    if (currentUser) return currentUser;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr);
      return currentUser;
    }

    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // --- NEW: Subscribe to user changes ---
  subscribe(callback: (user: User | null) => void) {
    subscribers.push(callback);
    // Immediately call with current value
    callback(currentUser);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) subscribers.splice(index, 1);
    };
  },

  notifySubscribers(user: User | null) {
    subscribers.forEach(cb => cb(user));
  },
};
