import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movimentacoes.component.html',
})
export class MovimentacoesComponent {
  // UI: Date Range Picker (igual ao dashboard)
  mostrarRangePicker: boolean = false;
  visibleMonth: Date = new Date();
  calendarDays: Array<{ day: number, inCurrentMonth: boolean, dateStr: string }> = [];
  private tempRangeStart: string | null = null; // YYYY-MM-DD
  private tempRangeEnd: string | null = null;   // YYYY-MM-DD
  private hoverRangeDate: string | null = null;
  
  // Datas selecionadas para exibir no botão
  dataInicial: string = '';
  dataFinal: string = '';

  // Filtros
  filtros = {
    categoria: '',
    conta: '',
    tipo: '',
    periodo: ''
  };

  // Opções para os filtros
  categorias = [
    { value: '', label: 'Todas as Categorias' },
    { value: 'operacional', label: 'Operacional' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'ti', label: 'Tecnologia da Informação' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'outros', label: 'Outros' }
  ];

  contas = [
    { value: '', label: 'Todas as Contas' },
    { value: 'corrente', label: 'Conta Corrente' },
    { value: 'poupanca', label: 'Poupança' },
    { value: 'investimento', label: 'Investimento' },
    { value: 'cartao', label: 'Cartão de Crédito' }
  ];

  tipos = [
    { value: '', label: 'Todos os Tipos' },
    { value: 'receita', label: 'Receita' },
    { value: 'despesa', label: 'Despesa' }
  ];

  // Dados mock das movimentações
  movimentacoes = [
    {
      id: 1,
      parcela: '∞',
      tipo: 'DESPESA',
      dataVencimento: '15/10/2025',
      dataCompensacao: '15/10/2025',
      clienteFornecedor: 'TechCorp',
      descricao: 'Pagamento DO(A) TechCorp',
      categoria: 'operacional',
      valor: 5247.83,
      conta: 'corrente'
    },
    {
      id: 2,
      parcela: '1/12',
      tipo: 'RECEITA',
      dataVencimento: '20/10/2025',
      dataCompensacao: '20/10/2025',
      clienteFornecedor: 'Cliente ABC',
      descricao: 'Venda de produtos',
      categoria: 'comercial',
      valor: 15000.00,
      conta: 'corrente'
    },
    {
      id: 3,
      parcela: '2/12',
      tipo: 'DESPESA',
      dataVencimento: '25/10/2025',
      dataCompensacao: '25/10/2025',
      clienteFornecedor: 'Fornecedor XYZ',
      descricao: 'Compra de materiais',
      categoria: 'operacional',
      valor: 3200.50,
      conta: 'corrente'
    },
    {
      id: 4,
      parcela: '∞',
      tipo: 'DESPESA',
      dataVencimento: '30/10/2025',
      dataCompensacao: '30/10/2025',
      clienteFornecedor: 'Empresa de Marketing',
      descricao: 'Serviços de marketing digital',
      categoria: 'marketing',
      valor: 4500.00,
      conta: 'corrente'
    },
    {
      id: 5,
      parcela: '1/6',
      tipo: 'RECEITA',
      dataVencimento: '05/11/2025',
      dataCompensacao: '05/11/2025',
      clienteFornecedor: 'Cliente DEF',
      descricao: 'Prestação de serviços',
      categoria: 'comercial',
      valor: 8500.00,
      conta: 'corrente'
    },
    {
      id: 6,
      parcela: '∞',
      tipo: 'DESPESA',
      dataVencimento: '10/11/2025',
      dataCompensacao: '10/11/2025',
      clienteFornecedor: 'Escritório de Advocacia',
      descricao: 'Consultoria jurídica',
      categoria: 'juridico',
      valor: 2800.00,
      conta: 'corrente'
    },
    {
      id: 7,
      parcela: '3/12',
      tipo: 'DESPESA',
      dataVencimento: '15/11/2025',
      dataCompensacao: '15/11/2025',
      clienteFornecedor: 'Fornecedor de TI',
      descricao: 'Licenças de software',
      categoria: 'ti',
      valor: 1200.00,
      conta: 'corrente'
    },
    {
      id: 8,
      parcela: '∞',
      tipo: 'DESPESA',
      dataVencimento: '20/11/2025',
      dataCompensacao: '20/11/2025',
      clienteFornecedor: 'Empresa de RH',
      descricao: 'Treinamento de funcionários',
      categoria: 'rh',
      valor: 3600.00,
      conta: 'corrente'
    }
  ];

  // Movimentações filtradas
  movimentacoesFiltradas = [...this.movimentacoes];

  constructor() {
    this.visibleMonth = new Date();
    this.buildCalendar();
  }

  // ===== Date Range Picker Helpers =====
  toggleRangePicker(): void {
    this.mostrarRangePicker = !this.mostrarRangePicker;
    if (this.mostrarRangePicker) {
      this.tempRangeStart = null;
      this.tempRangeEnd = null;
      this.hoverRangeDate = null;
      this.visibleMonth = new Date();
      this.buildCalendar();
    }
  }

  cancelRangePicker(): void {
    this.mostrarRangePicker = false;
  }

  applyRangePicker(): void {
    if (this.tempRangeStart && this.tempRangeEnd) {
      // Garante ordem
      const a = this.tempRangeStart <= this.tempRangeEnd ? this.tempRangeStart : this.tempRangeEnd;
      const b = this.tempRangeStart <= this.tempRangeEnd ? this.tempRangeEnd : this.tempRangeStart;
      
      // Salva as datas selecionadas
      this.dataInicial = a;
      this.dataFinal = b;
      
      console.log('Período selecionado:', a, 'até', b);
      // Aqui você pode aplicar os filtros
    }
    this.mostrarRangePicker = false;
  }

  clearRange(): void {
    this.tempRangeStart = null;
    this.tempRangeEnd = null;
    this.hoverRangeDate = null;
  }

  prevMonth(): void {
    const d = new Date(this.visibleMonth);
    d.setMonth(d.getMonth() - 1);
    this.visibleMonth = d;
    this.buildCalendar();
  }

  nextMonth(): void {
    const d = new Date(this.visibleMonth);
    d.setMonth(d.getMonth() + 1);
    this.visibleMonth = d;
    this.buildCalendar();
  }

  getMonthYearLabel(): string {
    return this.visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  private buildCalendar(): void {
    const year = this.visibleMonth.getFullYear();
    const month = this.visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekDay = firstDay.getDay(); // 0-6 dom..sab
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();
    const days: Array<{ day: number, inCurrentMonth: boolean, dateStr: string }> = [];

    // Preenche dias do mês anterior para alinhar a semana
    for (let i = startWeekDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      days.push({ day, inCurrentMonth: false, dateStr: this.dateToStr(date) });
    }

    // Dias do mês atual
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({ day: d, inCurrentMonth: true, dateStr: this.dateToStr(date) });
    }

    // Completa até múltiplo de 7 com próximos dias
    while (days.length % 7 !== 0) {
      const nextIndex = days.length - (startWeekDay) - daysInMonth + 1;
      const date = new Date(year, month + 1, nextIndex);
      days.push({ day: date.getDate(), inCurrentMonth: false, dateStr: this.dateToStr(date) });
    }

    this.calendarDays = days;
  }

  private dateToStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onSelectDate(dateStr: string): void {
    if (!this.tempRangeStart || (this.tempRangeStart && this.tempRangeEnd)) {
      this.tempRangeStart = dateStr;
      this.tempRangeEnd = null;
      return;
    }
    // Seleciona fim
    if (this.tempRangeStart && !this.tempRangeEnd) {
      this.tempRangeEnd = dateStr;
    }
  }

  onHoverDate(dateStr: string | null): void {
    this.hoverRangeDate = dateStr;
  }

  // Estados visuais
  isStart(dateStr: string): boolean {
    return !!this.tempRangeStart && this.tempRangeStart === dateStr;
  }

  isEnd(dateStr: string): boolean {
    return !!this.tempRangeEnd && this.tempRangeEnd === dateStr;
  }

  isBetween(dateStr: string): boolean {
    const start = this.tempRangeStart;
    const end = this.tempRangeEnd || this.hoverRangeDate;
    if (!start || !end) return false;
    const a = start <= end ? start : end;
    const b = start <= end ? end : start;
    return dateStr > a && dateStr < b;
  }

  // ===== Filtros e Cálculos =====
  aplicarFiltros(): void {
    this.movimentacoesFiltradas = this.movimentacoes.filter(mov => {
      const categoriaMatch = !this.filtros.categoria || mov.categoria === this.filtros.categoria;
      const contaMatch = !this.filtros.conta || mov.conta === this.filtros.conta;
      const tipoMatch = !this.filtros.tipo || mov.tipo.toLowerCase() === this.filtros.tipo;
      
      return categoriaMatch && contaMatch && tipoMatch;
    });
  }

  limparFiltros(): void {
    this.filtros = {
      categoria: '',
      conta: '',
      tipo: '',
      periodo: ''
    };
    this.movimentacoesFiltradas = [...this.movimentacoes];
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  // Cálculos dos itens selecionados
  getTotalReceitas(): number {
    return this.movimentacoesFiltradas
      .filter(mov => mov.tipo === 'RECEITA')
      .reduce((total, mov) => total + mov.valor, 0);
  }

  getTotalDespesas(): number {
    return this.movimentacoesFiltradas
      .filter(mov => mov.tipo === 'DESPESA')
      .reduce((total, mov) => total + mov.valor, 0);
  }

  getSaldoLiquido(): number {
    return this.getTotalReceitas() - this.getTotalDespesas();
  }

  getTotalItens(): number {
    return this.movimentacoesFiltradas.length;
  }

  // Formatação de moeda
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Labels para os filtros
  getCategoriaLabel(value: string): string {
    const categoria = this.categorias.find(c => c.value === value);
    return categoria ? categoria.label : value;
  }

  getContaLabel(value: string): string {
    const conta = this.contas.find(c => c.value === value);
    return conta ? conta.label : value;
  }

  getTipoLabel(value: string): string {
    const tipo = this.tipos.find(t => t.value === value);
    return tipo ? tipo.label : value;
  }
}


