import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fluxo-caixa',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './fluxo-caixa.component.html',
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


