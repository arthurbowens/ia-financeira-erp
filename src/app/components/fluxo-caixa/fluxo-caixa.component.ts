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
  // Meses exibidos no DFC (como no PDF)
  meses: string[] = [];
  anoSelecionado: number = 2025;

  // Estrutura de uma linha do DFC
  dfcLinhas: Array<{ nome: string; tipo: 'SECAO' | 'RECEITA' | 'DESPESA' | 'RESULTADO' | 'FATURAMENTO' | 'SUBTOTAL_RECEITA' | 'SUBTOTAL_DESPESA'; nivel: 0 | 1; valores: (number | null)[]; total?: number; media?: number }> = [];

  // Estado de expansão das seções
  expandirReceitas: boolean = true;
  expandirDespesas: boolean = true;

  ngOnInit() {
    this.meses = this.gerarMeses(this.anoSelecionado, 9); // jan..set do ano
    this.gerarMockDfc();
  }

  gerarMockDfc(): void {
    const rnd = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) / 1) * 1;

    // Seções principais
    const linhas: FluxoCaixaComponent['dfcLinhas'] = [];

    // Cabeçalho seção Faturamento (Novos Contratos)
    linhas.push({ nome: 'FATURAMENTO (NOVOS CONTRATOS)', tipo: 'SECAO', nivel: 0, valores: Array(this.meses.length).fill(null) });
    linhas.push({ nome: 'NFs Emitidas (Conforme Recebimento)', tipo: 'FATURAMENTO', nivel: 1, valores: this.meses.map(() => rnd(80000, 140000)) });

    // Total Receitas
    linhas.push({ nome: 'TOTAL RECEITAS', tipo: 'SECAO', nivel: 0, valores: Array(this.meses.length).fill(null) });
    linhas.push({ nome: '1. Receitas Operacionais (Recebimentos)', tipo: 'RECEITA', nivel: 1, valores: this.meses.map(() => rnd(90000, 180000)) });
    linhas.push({ nome: '2. Outras Entradas', tipo: 'RECEITA', nivel: 1, valores: this.meses.map(() => rnd(3000, 15000)) });
    // Subtotal Receitas
    linhas.push({ nome: 'Subtotal Receitas', tipo: 'SUBTOTAL_RECEITA', nivel: 1, valores: Array(this.meses.length).fill(null) });

    // Total Despesas
    linhas.push({ nome: 'TOTAL DESPESAS', tipo: 'SECAO', nivel: 0, valores: Array(this.meses.length).fill(null) });
    linhas.push({ nome: '1. Custos Operacionais', tipo: 'DESPESA', nivel: 1, valores: this.meses.map(() => rnd(35000, 65000)) });
    linhas.push({ nome: '2. Despesas Operacionais', tipo: 'DESPESA', nivel: 1, valores: this.meses.map(() => rnd(25000, 55000)) });
    linhas.push({ nome: '3. Atividades Estratégicas', tipo: 'DESPESA', nivel: 1, valores: this.meses.map(() => rnd(8000, 20000)) });
    linhas.push({ nome: '4. Atividades de Investimento', tipo: 'DESPESA', nivel: 1, valores: this.meses.map(() => rnd(5000, 15000)) });
    linhas.push({ nome: '5. Atividades de Financiamento', tipo: 'DESPESA', nivel: 1, valores: this.meses.map(() => rnd(4000, 12000)) });
    // Subtotal Despesas
    linhas.push({ nome: 'Subtotal Despesas', tipo: 'SUBTOTAL_DESPESA', nivel: 1, valores: Array(this.meses.length).fill(null) });

    // Resultado
    linhas.push({ nome: 'RESULTADO', tipo: 'RESULTADO', nivel: 0, valores: Array(this.meses.length).fill(null) });

    // Cálculo de totais e médias
    this.dfcLinhas = linhas.map(l => ({ ...l, total: this.somar(l.valores), media: this.media(l.valores) }));

    // Preencher valores de subtotais por mês
    const preencherSubtotal = (tipoDetalhe: 'RECEITA' | 'DESPESA', tipoSubtotal: 'SUBTOTAL_RECEITA' | 'SUBTOTAL_DESPESA') => {
      const indicesSubtotal = this.dfcLinhas
        .map((l, idx) => ({ l, idx }))
        .filter(x => x.l.tipo === tipoSubtotal)
        .map(x => x.idx);

      indicesSubtotal.forEach(idxSubtotal => {
        // Encontrar o intervalo de linhas de detalhe acima até a última SECAO
        let i = idxSubtotal - 1;
        const detalhes: typeof this.dfcLinhas = [];
        while (i >= 0 && this.dfcLinhas[i].tipo !== 'SECAO') {
          if (this.dfcLinhas[i].tipo === tipoDetalhe) detalhes.push(this.dfcLinhas[i]);
          i--;
        }
        const valores = this.meses.map((_, col) =>
          detalhes.reduce((acc, l) => acc + (l.valores[col] ?? 0), 0)
        );
        this.dfcLinhas[idxSubtotal].valores = valores;
        this.dfcLinhas[idxSubtotal].total = this.somar(valores);
        this.dfcLinhas[idxSubtotal].media = this.media(valores);
      });
    };

    preencherSubtotal('RECEITA', 'SUBTOTAL_RECEITA');
    preencherSubtotal('DESPESA', 'SUBTOTAL_DESPESA');

    // Recalcular resultado: receitas - despesas (por mês)
    const receitasPorMes = this.somarPorMes(this.dfcLinhas.filter(l => l.tipo === 'RECEITA' || l.tipo === 'FATURAMENTO'));
    const despesasPorMes = this.somarPorMes(this.dfcLinhas.filter(l => l.tipo === 'DESPESA'));
    const idxResultado = this.dfcLinhas.findIndex(l => l.tipo === 'RESULTADO');
    if (idxResultado >= 0) {
      const valores = this.meses.map((_, i) => receitasPorMes[i] - despesasPorMes[i]);
      this.dfcLinhas[idxResultado].valores = valores;
      this.dfcLinhas[idxResultado].total = this.somar(valores);
      this.dfcLinhas[idxResultado].media = this.media(valores);
    }
  }

  onAnoChange(novoAno: string): void {
    const ano = parseInt(novoAno, 10);
    if (!isNaN(ano)) {
      this.anoSelecionado = ano;
      this.meses = this.gerarMeses(this.anoSelecionado, 9);
      this.gerarMockDfc();
    }
  }

  private gerarMeses(ano: number, quantidade: number): string[] {
    const nomes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return Array.from({ length: quantidade }, (_, i) => `${nomes[i]}/${String(ano).slice(-2)}`);
  }

  private somar(valores: (number | null)[]): number {
    return valores.reduce((acc: number, v: number | null) => acc + (v ?? 0), 0);
  }

  private media(valores: (number | null)[]): number {
    const existentes = valores.filter(v => typeof v === 'number') as number[];
    if (existentes.length === 0) return 0;
    return this.somar(existentes) / existentes.length;
  }

  private somarPorMes(linhas: FluxoCaixaComponent['dfcLinhas']): number[] {
    return this.meses.map((_, i) =>
      linhas.reduce((acc: number, l) => acc + (l.valores[i] ?? 0), 0)
    );
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatCurrencySigned(value: number): string {
    if (value < 0) {
      return `(${this.formatCurrency(Math.abs(value))})`;
    }
    return this.formatCurrency(value);
  }

  // Exportações
  exportarCsv(): void {
    const header = ['Descrição', ...this.meses, 'TOTAL', 'MÉDIA'];
    const linhas = this.dfcLinhas.map(l => [
      l.nome,
      ...l.valores.map(v => (v ?? 0).toString().replace('.', ',')),
      (l.total ?? 0).toString().replace('.', ','),
      Math.round((l.media ?? 0)).toString().replace('.', ',')
    ]);
    const conteudo = [header, ...linhas].map(r => r.join(';')).join('\n');
    const blob = new Blob(["\ufeff" + conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DFC_${this.anoSelecionado}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  imprimir(): void {
    window.print();
  }

  // Controle de visibilidade de linhas
  isLinhaVisivel(l: { tipo: string }): boolean {
    if (l.tipo === 'RECEITA') return this.expandirReceitas;
    if (l.tipo === 'DESPESA') return this.expandirDespesas;
    return true;
  }

  alternarReceitas(): void {
    this.expandirReceitas = !this.expandirReceitas;
  }

  alternarDespesas(): void {
    this.expandirDespesas = !this.expandirDespesas;
  }
}


