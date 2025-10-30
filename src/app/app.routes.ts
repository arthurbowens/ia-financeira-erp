import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'relatorio',
    loadComponent: () => import('./components/relatorio/relatorio.component').then(m => m.RelatorioComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'gerenciar-acessos',
    loadComponent: () => import('./components/gerenciar-acessos/gerenciar-acessos.component').then(m => m.GerenciarAcessosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'contratos',
    loadComponent: () => import('./components/contratos/contratos.component').then(m => m.ContratosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'assinatura',
    loadComponent: () => import('./components/assinatura/assinatura.component').then(m => m.AssinaturaComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'fluxo-caixa',
    loadComponent: () => import('./components/fluxo-caixa/fluxo-caixa.component').then(m => m.FluxoCaixaComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'movimentacoes',
    loadComponent: () => import('./components/movimentacoes/movimentacoes.component').then(m => m.MovimentacoesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
