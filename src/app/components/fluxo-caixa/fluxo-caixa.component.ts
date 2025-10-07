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
  transacoes: any[] = [];

  ngOnInit() {
    this.carregarDadosMock();
  }

  setVisao(nova: 'diario' | 'mensal'): void {
    this.visao = nova;
  }

  onMesAlterado(valor: string): void {
    this.mesSelecionado = valor;
    this.carregarDadosMock();
  }

  carregarDadosMock(): void {
    const tipos = ['DESPESA', 'RECEITA'];
    const categorias = ['Operacional', 'Financeiro', 'Marketing', 'Vendas', 'Administrativo'];
    const empresas = ['TechCorp', 'Inovação Ltda', 'Digital Solutions', 'StartupXYZ', 'Empresa ABC'];
    
    this.transacoes = Array.from({ length: 1 }, (_, i) => {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const valor = Math.random() * 10000 + 100;
      const dia = Math.floor(Math.random() * 30) + 1;
      
      return {
        parcela: '∞',
        tipo: tipo,
        dataVencimento: `${dia.toString().padStart(2, '0')}/10/2025`,
        dataCompensacao: `${dia.toString().padStart(2, '0')}/10/2025`,
        clienteFornecedor: empresas[Math.floor(Math.random() * empresas.length)],
        descricao: `${tipo === 'DESPESA' ? 'Pagamento' : 'Recebimento'} ${tipo === 'DESPESA' ? 'DO(A)' : 'DE'} ${empresas[Math.floor(Math.random() * empresas.length)]}`,
        categoria: categorias[Math.floor(Math.random() * categorias.length)],
        valor: Math.round(valor * 100) / 100
      };
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}


