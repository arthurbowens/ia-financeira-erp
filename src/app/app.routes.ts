import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chatbot/chatbot.component').then(m => m.ChatbotComponent)
  },
  {
    path: 'contratos',
    loadComponent: () => import('./components/contratos/contratos.component').then(m => m.ContratosComponent)
  },
  {
    path: 'assinatura',
    loadComponent: () => import('./components/assinatura/assinatura.component').then(m => m.AssinaturaComponent)
  },
  {
    path: 'fluxo-caixa',
    loadComponent: () => import('./components/fluxo-caixa/fluxo-caixa.component').then(m => m.FluxoCaixaComponent)
  },
  {
    path: 'movimentacoes',
    loadComponent: () => import('./components/movimentacoes/movimentacoes.component').then(m => m.MovimentacoesComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
