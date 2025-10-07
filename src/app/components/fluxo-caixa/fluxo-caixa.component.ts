import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fluxo-caixa',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm p-6 text-center">
        <div class="text-3xl mb-2">💼</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Fluxo de Caixa</h1>
        <p class="text-gray-600">Esta tela está sendo construída. Em breve você poderá visualizar o fluxo de caixa detalhado aqui.</p>
        <div class="mt-6">
          <a routerLink="/dashboard" class="text-sm font-semibold text-primary-600 hover:underline">Voltar ao Dashboard</a>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class FluxoCaixaComponent {}


