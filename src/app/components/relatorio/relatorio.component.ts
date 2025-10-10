import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss']
})
export class RelatorioComponent implements OnInit, AfterViewInit, OnDestroy {
  // Propriedades do gráfico
  periodoGrafico: 'mensal' | 'anual' = 'mensal';
  receitaChart: Chart | null = null;

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

  // Dados mockados para o gráfico
  dadosFiltrados = {
    receitas: 45000,
    despesas: 32000,
    margemLiquida: 28.9,
    lucro: 13000,
    indicadores: {
      crescimentoReceita: 12.5
    }
  };

  // Dados do gráfico
  chartData = {
    labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
    receita: [5000, 3000, 4000, 0, 0, 0, 0, 6000, 7000, 0, 0, 0, 0, 0, 0, 8000, 0, 0, 0, 0, 0, 0, 9000, 10000, 0, 0, 0, 0, 0, 0, 5000],
    despesa: [0, 0, 0, 0, 0, 15000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12000, 0, 0, 0, 0, 0, 8000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    renegociado: [0, 0, 0, 2000, 0, 0, 0, 0, 0, 1500, 0, 0, 0, 0, 0, 0, 0, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000],
    saldoProjetado: [5000, 8000, 12000, 10000, 10000, -5000, -5000, 1000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 4000, 4000, 4000, 4000, 4000, 4000, -4000, 5000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 20000]
  };

  // Dados mockados das movimentações por dia
  movimentacoesPorDia: { [key: number]: any[] } = {
    1: [
      { tipo: 'RECEITA', cliente: 'Cliente A', descricao: 'Pagamento DE Cliente A', categoria: 'Vendas', valor: 5000, dia: 1 }
    ],
    2: [
      { tipo: 'RECEITA', cliente: 'Cliente B', descricao: 'Pagamento DE Cliente B', categoria: 'Vendas', valor: 3000, dia: 2 }
    ],
    3: [
      { tipo: 'RECEITA', cliente: 'Cliente C', descricao: 'Pagamento DE Cliente C', categoria: 'Vendas', valor: 4000, dia: 3 }
    ],
    4: [
      { tipo: 'RENEGOCIAÇÃO', cliente: 'Cliente D', descricao: 'Renegociação DE Cliente D', categoria: 'Vendas', valor: 2000, dia: 4 }
    ],
    6: [
      { tipo: 'DESPESA', cliente: 'Fornecedor X', descricao: 'Pagamento DO(A) Fornecedor X', categoria: 'Operacional', valor: 15000, dia: 6 }
    ],
    8: [
      { tipo: 'RECEITA', cliente: 'Cliente E', descricao: 'Pagamento DE Cliente E', categoria: 'Vendas', valor: 6000, dia: 8 }
    ],
    9: [
      { tipo: 'RECEITA', cliente: 'Cliente F', descricao: 'Pagamento DE Cliente F', categoria: 'Vendas', valor: 7000, dia: 9 }
    ],
    10: [
      { tipo: 'RENEGOCIAÇÃO', cliente: 'Cliente G', descricao: 'Renegociação DE Cliente G', categoria: 'Vendas', valor: 1500, dia: 10 }
    ],
    15: [
      { tipo: 'DESPESA', cliente: 'Fornecedor Y', descricao: 'Pagamento DO(A) Fornecedor Y', categoria: 'Operacional', valor: 12000, dia: 15 },
      { tipo: 'RECEITA', cliente: 'Cliente H', descricao: 'Pagamento DE Cliente H', categoria: 'Vendas', valor: 8000, dia: 15 }
    ],
    18: [
      { tipo: 'RENEGOCIAÇÃO', cliente: 'Cliente I', descricao: 'Renegociação DE Cliente I', categoria: 'Vendas', valor: 3000, dia: 18 }
    ],
    21: [
      { tipo: 'DESPESA', cliente: 'Fornecedor Z', descricao: 'Pagamento DO(A) Fornecedor Z', categoria: 'Operacional', valor: 8000, dia: 21 }
    ],
    23: [
      { tipo: 'RECEITA', cliente: 'Cliente J', descricao: 'Pagamento DE Cliente J', categoria: 'Vendas', valor: 9000, dia: 23 }
    ],
    24: [
      { tipo: 'RECEITA', cliente: 'Cliente K', descricao: 'Pagamento DE Cliente K', categoria: 'Vendas', valor: 10000, dia: 24 }
    ],
    31: [
      { tipo: 'RECEITA', cliente: 'Cliente L', descricao: 'Pagamento DE Cliente L', categoria: 'Vendas', valor: 5000, dia: 31 }
    ]
  };

  // Estado para controle de filtro por dia
  diaSelecionado: number | null = null;
  movimentacoesFiltradas: any[] = [];

  ngOnInit() {
    this.visibleMonth = new Date();
    this.buildCalendar();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.receitaChart) {
      this.receitaChart.destroy();
    }
  }

  initChart() {
    const ctx = document.getElementById('receitaChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.receitaChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.chartData.labels,
        datasets: [
          {
            label: 'Receita',
            data: this.chartData.receita,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            type: 'bar'
          },
          {
            label: 'Despesa',
            data: this.chartData.despesa,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            type: 'bar'
          },
          {
            label: 'Renegociado',
            data: this.chartData.renegociado,
            backgroundColor: 'rgba(234, 179, 8, 0.8)',
            borderColor: 'rgba(234, 179, 8, 1)',
            borderWidth: 1,
            type: 'bar'
          },
          {
            label: 'Saldo total projetado no período',
            data: this.chartData.saldoProjetado,
            backgroundColor: 'transparent',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            type: 'line',
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Dias'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const elementIndex = elements[0].index;
            const dia = elementIndex + 1;
            this.filtrarMovimentacoesPorDia(dia);
          }
        }
      }
    });
  }

  setPeriodoGrafico(periodo: 'mensal' | 'anual') {
    this.periodoGrafico = periodo;
    // Aqui você pode implementar a lógica para alterar os dados do gráfico
    // baseado no período selecionado
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Métodos para filtrar movimentações
  filtrarMovimentacoesPorDia(dia: number): void {
    this.diaSelecionado = dia;
    this.movimentacoesFiltradas = this.movimentacoesPorDia[dia] || [];
  }

  limparFiltroDia(): void {
    this.diaSelecionado = null;
    this.movimentacoesFiltradas = [];
  }

  getTodasMovimentacoes(): any[] {
    const todas: any[] = [];
    Object.values(this.movimentacoesPorDia).forEach(movimentacoes => {
      todas.push(...movimentacoes);
    });
    return todas.sort((a, b) => b.dia - a.dia); // Ordena por dia decrescente
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
}
