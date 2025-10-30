import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  name: string;
  role: string;
  loginTime: string;
  permissions?: {
    dashboard: boolean;
    relatorio: boolean;
    movimentacoes: boolean;
    fluxoCaixa: boolean;
    contratos: boolean;
    chat: boolean;
    assinatura: boolean;
    gerenciarAcessos: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  // Verificar status de autenticação
  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      this.isAuthenticatedSubject.next(true);
      this.userSubject.next(JSON.parse(userData));
    }
  }

  // Login
  async login(email: string, password: string): Promise<boolean> {
    try {
      // Simular chamada para API
      const response = await this.authenticateWithAPI(email, password);
      
      if (response.success) {
        this.setUserSession(response.user, response.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }

  // Simulação de autenticação com API
  private async authenticateWithAPI(email: string, password: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular credenciais válidas
        if (email === 'julia@startarget.com' && password === '123456') {
          resolve({
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              email: email,
              name: 'Julia (Admin)',
              role: 'admin',
              loginTime: new Date().toISOString(),
              permissions: {
                dashboard: true,
                relatorio: true,
                movimentacoes: true,
                fluxoCaixa: true,
                contratos: true,
                chat: true,
                assinatura: true,
                gerenciarAcessos: true
              }
            }
          });
        } else if (email === 'cliente@startarget.com' && password === '123456') {
          resolve({
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              email: email,
              name: 'Cliente',
              role: 'cliente',
              loginTime: new Date().toISOString(),
              permissions: {
                dashboard: true,
                relatorio: true,
                movimentacoes: true,
                fluxoCaixa: true,
                contratos: true,
                chat: true,
                assinatura: true,
                gerenciarAcessos: true
              }
            }
          });
        } else {
          resolve({ success: false });
        }
      }, 1000);
    });
  }

  // Salvar sessão do usuário
  private setUserSession(user: User, token: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(user);
  }

  // Logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
    
    this.router.navigate(['/login']);
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  // Atualizar usuário (por exemplo, permissões)
  updateCurrentUser(user: User) {
    this.userSubject.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  // Obter token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Verificar se token é válido (simulação)
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Simular validação de token
    return token.startsWith('mock-jwt-token');
  }

  // Verificar permissões
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Verificar se pode acessar rota
  canAccess(route: string): boolean {
    if (!this.isAuthenticated()) return false;
    
    // Lógica de permissões por rota
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Admin pode acessar tudo
    if (user.role === 'admin') return true;
    
    const map: Record<string, keyof NonNullable<User['permissions']>> = {
      'dashboard': 'dashboard',
      'relatorio': 'relatorio',
      'movimentacoes': 'movimentacoes',
      'fluxo-caixa': 'fluxoCaixa',
      'contratos': 'contratos',
      'chat': 'chat',
      'assinatura': 'assinatura',
      'gerenciar-acessos': 'gerenciarAcessos'
    };

    const key = map[route];
    if (!key) return true; // rotas não mapeadas liberadas
    return Boolean(user.permissions?.[key]);
  }

  // Renovar token (simulação)
  async refreshToken(): Promise<boolean> {
    try {
      // Simular renovação de token
      const newToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', newToken);
      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }
}
