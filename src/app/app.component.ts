import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { LoadingComponent } from './components/loading/loading.component';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, LoadingComponent, ErrorNotificationComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'ia-financeira-erp';
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  currentYear: number = new Date().getFullYear();
  
  // Simular tipo de usuário (em produção viria do AuthService)
  get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Métodos para verificar permissões e ocultar itens de menu
  hasPermission(permission: string): boolean {
    return this.authService.canAccess(permission);
  }

  // Métodos específicos para cada módulo
  canAccessDashboard(): boolean {
    return this.hasPermission('dashboard');
  }

  canAccessRelatorio(): boolean {
    return this.hasPermission('relatorio');
  }

  canAccessMovimentacoes(): boolean {
    return this.hasPermission('movimentacoes');
  }

  canAccessFluxoCaixa(): boolean {
    return this.hasPermission('fluxo-caixa');
  }

  canAccessContratos(): boolean {
    return this.hasPermission('contratos');
  }

  canAccessChat(): boolean {
    return this.hasPermission('chat');
  }

  canAccessAssinatura(): boolean {
    return this.hasPermission('assinatura');
  }

  canAccessGerenciarAcessos(): boolean {
    return this.hasPermission('gerenciar-acessos');
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  toggleUserMenu(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click')
  closeUserMenuOnOutsideClick() {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  onManageAccess() {
    this.isUserMenuOpen = false;
    this.router.navigate(['/gerenciar-acessos']);
  }

}
