import { apiService } from './api.service';

export interface LoginRequest {
  login: string;
  contraseña: string;
}

export interface LoginResponse {
  token: string;
  debeCambiarPassword: boolean;
  usuario: {
    idUsuario: number;
    login: string;
    usuario: string;
    email: string;
    rol: string;
  };
}

export interface ChangePasswordRequest {
  contraseñaActual: string;
  contraseñaNueva: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return await apiService.post<LoginResponse>('/auth/login', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return await apiService.post<ChangePasswordResponse>('/auth/change-password', data);
  },

  async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      // Intentar hacer una petición simple al backend para validar el token
      await apiService.get('/auth/profile');
      return true;
    } catch (error) {
      // Si falla, el token es inválido
      this.logout();
      return false;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  },
};
