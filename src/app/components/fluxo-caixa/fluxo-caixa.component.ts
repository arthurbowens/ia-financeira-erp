import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fluxo-caixa',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Cabeçalho -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="text-2xl">💼</div>
            <h1 class="text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
          </div>
          <div class="flex items-center gap-2">
            <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
              <button (click)="setVisao('diario')"
                      [class.bg-gray-900]="visao==='diario'"
                      [class.text-white]="visao==='diario'"
                      class="px-4 py-1 text-sm font-semibold hover:bg-gray-100">Diário</button>
              <button (click)="setVisao('mensal')"
                      [class.bg-gray-900]="visao==='mensal'"
                      [class.text-white]="visao==='mensal'"
                      class="px-4 py-1 text-sm font-semibold hover:bg-gray-100">Mensal</button>
            </div>
            <input type="month"
                   [ngModel]="mesSelecionado"
                   (ngModelChange)="onMesAlterado($event)"
                   class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>
      </div>

      <!-- Placeholder do conteúdo futuro -->
      <div class="bg-white rounded-xl shadow-sm p-6 text-center">
        <p class="text-gray-600">Cabeçalho inicial do Fluxo de Caixa pronto. Em seguida adicionaremos filtros e tabela.</p>
        <div class="mt-6">
          <a routerLink="/dashboard" class="text-sm font-semibold text-primary-600 hover:underline">Voltar ao Dashboard</a>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class FluxoCaixaComponent {
  visao: 'diario' | 'mensal' = 'diario';
  mesSelecionado: string = new Date().toISOString().slice(0, 7); // YYYY-MM

  setVisao(nova: 'diario' | 'mensal'): void {
    this.visao = nova;
  }

  onMesAlterado(valor: string): void {
    this.mesSelecionado = valor;
  }
}


