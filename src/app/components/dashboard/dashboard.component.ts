import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DADOS_FINANCEIROS_MOCK, DadosFinanceiros, CONTRATOS_MOCK, Contrato } from '../../data/mock-data';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  dados: DadosFinanceiros = DADOS_FINANCEIROS_MOCK;
  receitaChart: Chart | null = null;
  despesasChart: Chart | null = null;
  currentDate: Date = new Date();
  mediaNovosContratosReais3m: number = 0;
  mediaNovosContratosUnidades3m: number = 0;
  custoFinanceiroInvestimento: number = 0;
  mediaCustoFixo: number = 0;
  mediaCustoVariavel: number = 0;
  mediaCustoEstrategico: number = 0;
  totalClientesAtivos: number = 0;
  churnPercent: number = 0;
  ltvMeses: number = 0;
  inadimplenciaValor: number = 0;
  inadimplenciaTaxa: number = 0;
  // Projeção usada para exibir ao lado do gráfico
  projecaoSaldoFinal: number = 0;
  
  // Filtro de data
  dataInicial: string = '';
  dataFinal: string = '';
  tipoFiltro: 'mes' | 'trimestre' | 'ano' = 'mes';
  // Controle específico do gráfico principal
  periodoGrafico: 'mensal' | 'anual' = 'mensal';
  
  // Opções de filtro
  mesesDisponiveis: Array<{value: string, label: string}> = [];
  trimestresDisponiveis: Array<{value: string, label: string}> = [];
  anosDisponiveis: Array<{value: string, label: string}> = [];
  
  // Dados filtrados por período
  dadosFiltrados: DadosFinanceiros = this.dados;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.inicializarFiltros();
    this.filtrarDadosPorPeriodo();
    this.calcularMediasContratosUltimos3Meses();
    this.calcularMediaCustoFixo();
    this.calcularMediaCustoVariavel();
    this.calcularMediaCustoEstrategico();
    this.calcularCustoFinanceiroInvestimento();
    this.calcularTotalClientesAtivos();
    this.calcularChurnPercent();
    this.calcularLtvMeses();
    this.calcularInadimplencia();
    
    if (isPlatformBrowser(this.platformId)) {
      this.criarGraficoReceitas();
      this.criarGraficoDespesas();
    }
  }

  ngOnDestroy() {
    if (this.receitaChart) {
      this.receitaChart.destroy();
    }
    if (this.despesasChart) {
      this.despesasChart.destroy();
    }
  }

  criarGraficoReceitas() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const ctx = document.getElementById('receitaChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroi gráfico existente se houver
    if (this.receitaChart) {
      this.receitaChart.destroy();
      this.receitaChart = null;
    }

    // Dados do gráfico (mensal: dias; anual: meses)
    const labels: string[] = this.periodoGrafico === 'mensal'
      ? Array.from({ length: 31 }, (_, i) => String(i + 1))
      : ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    let receitaSerie: number[] = [];
    let renegociadoSerie: number[] = [];
    let despesaSerie: number[] = [];

    if (this.periodoGrafico === 'mensal') {
      // Diários 1..31
      receitaSerie = labels.map((_, i) => {
        const d = i + 1;
        if (d % 7 === 2) return 26000;
        if (d % 5 === 3) return 12000;
        if (d % 3 === 0) return 6000;
        return 0;
      });
      renegociadoSerie = labels.map((_, i) => {
        const d = i + 1;
        if (d % 9 === 4) return 5000;
        if (d % 13 === 8) return 4000;
        return 0;
      });
      despesaSerie = labels.map((_, i) => {
        const d = i + 1;
        if (d === 6) return 70000;
        if (d === 15) return 48000;
        if (d === 21) return 16000;
        if (d === 30) return 20000;
        if (d % 10 === 0) return 9000;
        if (d % 4 === 0) return 6000;
        if (d % 2 === 0) return 3000;
        return 0;
      });
    } else {
      // Mensal por mês (12)
      receitaSerie = [13000,16000,19000,22000,25000,28000,32000,35000,38000,40000,42000,45000];
      renegociadoSerie = [2000,3000,0,4000,0,5000,0,3000,0,4000,0,6000];
      despesaSerie = [8000,9000,11000,12000,13000,14000,15000,16000,17000,20000,15000,18000];
    }

    // Saldo projetado acumulado
    const saldoProjetado: number[] = [];
    let saldo = this.periodoGrafico === 'mensal' ? 95000 : 50000;
    labels.forEach((_, i) => {
      saldo += (receitaSerie[i] + renegociadoSerie[i]) - despesaSerie[i];
      saldoProjetado.push(Math.max(saldo, 0));
    });
    this.projecaoSaldoFinal = saldoProjetado[saldoProjetado.length - 1] || 0;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Receita',
            data: receitaSerie,
            backgroundColor: '#2ecc71',
            borderColor: '#2ecc71',
            borderWidth: 0,
          },
          {
            label: 'Renegociado',
            data: renegociadoSerie,
            backgroundColor: '#f1c40f',
            borderColor: '#f1c40f',
            borderWidth: 0,
          },
          {
            label: 'Despesa',
            data: despesaSerie,
            backgroundColor: '#e74c3c',
            borderColor: '#e74c3c',
            borderWidth: 0,
          },
          {
            type: 'line',
            label: 'Saldo total projetado no período',
            data: saldoProjetado,
            borderColor: '#3498db',
            backgroundColor: 'transparent',
            borderWidth: 3,
            borderDash: [6, 6],
            pointBackgroundColor: '#3498db',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
            tension: 0.35,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.dataset.label || '';
                const v = ctx.parsed.y ?? ctx.raw;
                return `${label}: ${this.formatCurrency(Number(v || 0))}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            title: { display: true, text: 'Dias' }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: number | string) => {
                const n = typeof value === 'string' ? parseFloat(value) : value;
                return 'R$ ' + Number(n).toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    };

    this.receitaChart = new Chart(ctx, config);
  }

  setPeriodoGrafico(periodo: 'mensal' | 'anual') {
    this.periodoGrafico = periodo;
    this.criarGraficoReceitas();
  }

  // Indicadores ao lado do gráfico
  getSaldoEmConta(): number {
    const receitas = this.dadosFiltrados?.receitas || 0;
    const despesas = this.dadosFiltrados?.despesas || 0;
    const saldo = receitas - despesas;
    return saldo > 0 ? saldo : Math.abs(saldo) * 0.3; // valor positivo mínimo visível
  }

  getContasAReceber(): number {
    const receitas = this.dadosFiltrados?.receitas || 0;
    return receitas * 0.12; // aproximação para exibição
  }

  getContasAPagar(): number {
    const despesas = this.dadosFiltrados?.despesas || 0;
    return despesas * 0.18; // aproximação para exibição
  }

  criarGraficoDespesas() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const ctx = document.getElementById('despesasChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroi gráfico existente se houver
    if (this.despesasChart) {
      this.despesasChart.destroy();
      this.despesasChart = null;
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: (this.dadosFiltrados?.despesasPorCategoria || []).map(item => item.categoria),
        datasets: [{
          data: (this.dadosFiltrados?.despesasPorCategoria || []).map(item => item.valor),
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f093fb',
            '#f5576c'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribuição de Despesas por Categoria',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    };

    this.despesasChart = new Chart(ctx, config);
  }


  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getLucroPercentual(): number {
    const receitas = this.dadosFiltrados?.receitas || 0;
    const lucro = this.dadosFiltrados?.lucro || 0;
    return receitas > 0 ? (lucro / receitas) * 100 : 0;
  }

  getMargemLucro(): string {
    return this.getLucroPercentual().toFixed(1) + '%';
  }

  getMargemDespesas(): string {
    const despesas = this.dadosFiltrados?.despesas || 0;
    const receitas = this.dadosFiltrados?.receitas || 0;
    const margem = receitas > 0 ? (despesas / receitas) * 100 : 0;
    return margem.toFixed(1) + '%';
  }

  getStatusLucro(): string {
    const percentual = this.getLucroPercentual();
    if (percentual >= 20) return 'excelente';
    if (percentual >= 10) return 'bom';
    if (percentual >= 0) return 'regular';
    return 'ruim';
  }

  getStatusClass(): string {
    return `status-${this.getStatusLucro()}`;
  }

  private calcularMediasContratosUltimos3Meses(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        this.calcularContratosPorMes();
        break;
      case 'trimestre':
        this.calcularContratosPorTrimestre();
        break;
      case 'ano':
        this.calcularContratosPorAno();
        break;
    }
  }

  private calcularContratosPorMes(): void {
    const novosContratosPorMes: {[key: string]: {valor: number, quantidade: number}} = {
      '2025-10': { valor: 55000, quantidade: 2.5 },
      '2025-09': { valor: 52000, quantidade: 2.3 },
      '2025-08': { valor: 48000, quantidade: 2.1 },
      '2025-07': { valor: 45000, quantidade: 2.0 },
      '2025-06': { valor: 42000, quantidade: 1.8 },
      '2025-05': { valor: 38000, quantidade: 1.6 },
      '2025-04': { valor: 35000, quantidade: 1.4 },
      '2025-03': { valor: 32000, quantidade: 1.2 },
      '2025-02': { valor: 28000, quantidade: 1.0 },
      '2025-01': { valor: 25000, quantidade: 0.8 }
    };

    const mesAtual = this.dataInicial.substring(0, 7);
    if (novosContratosPorMes[mesAtual]) {
      this.mediaNovosContratosReais3m = novosContratosPorMes[mesAtual].valor;
      this.mediaNovosContratosUnidades3m = novosContratosPorMes[mesAtual].quantidade;
    } else {
      this.mediaNovosContratosReais3m = 40000;
      this.mediaNovosContratosUnidades3m = 1.8;
    }
  }

  private calcularContratosPorTrimestre(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
    
    const contratosPorTrimestre: {[key: string]: {valor: number, quantidade: number}} = {
      '2025-Q4': { valor: 155000, quantidade: 6.9 }, // Out+Set+Ago
      '2025-Q3': { valor: 135000, quantidade: 5.9 }, // Jul+Jun+Mai
      '2025-Q2': { valor: 105000, quantidade: 4.2 }, // Abr+Mar+Fev
      '2025-Q1': { valor: 75000, quantidade: 3.0 }   // Jan+Dez+Nov
    };

    const chaveTrimestre = `${ano}-Q${trimestre}`;
    if (contratosPorTrimestre[chaveTrimestre]) {
      this.mediaNovosContratosReais3m = contratosPorTrimestre[chaveTrimestre].valor;
      this.mediaNovosContratosUnidades3m = contratosPorTrimestre[chaveTrimestre].quantidade;
    } else {
      this.mediaNovosContratosReais3m = 120000;
      this.mediaNovosContratosUnidades3m = 5.0;
    }
  }

  private calcularContratosPorAno(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    
    const contratosPorAno: {[key: string]: {valor: number, quantidade: number}} = {
      '2025': { valor: 470000, quantidade: 20.0 },
      '2024': { valor: 380000, quantidade: 16.5 },
      '2023': { valor: 280000, quantidade: 12.0 }
    };

    if (contratosPorAno[ano.toString()]) {
      this.mediaNovosContratosReais3m = contratosPorAno[ano.toString()].valor;
      this.mediaNovosContratosUnidades3m = contratosPorAno[ano.toString()].quantidade;
    } else {
      this.mediaNovosContratosReais3m = 400000;
      this.mediaNovosContratosUnidades3m = 17.0;
    }
  }

  private calcularMediaCustoFixo(): void {
    // Dados mock simulando custos fixos dos últimos 6 meses
    const custosFixosUltimos6Meses = [
      { mes: 'Setembro 2023', valor: 28000 },
      { mes: 'Outubro 2023', valor: 29000 },
      { mes: 'Novembro 2023', valor: 30000 },
      { mes: 'Dezembro 2023', valor: 32000 },
      { mes: 'Janeiro 2024', valor: 31000 },
      { mes: 'Fevereiro 2024', valor: 33000 }
    ];

    const totalCustosFixos = custosFixosUltimos6Meses.reduce((acc, mes) => acc + mes.valor, 0);
    this.mediaCustoFixo = totalCustosFixos / 6; // média mensal em R$
  }

  private calcularMediaCustoVariavel(): void {
    // Dados mock simulando custos variáveis dos últimos 6 meses
    const custosVariaveisUltimos6Meses = [
      { mes: 'Setembro 2023', valor: 12000 },
      { mes: 'Outubro 2023', valor: 15000 },
      { mes: 'Novembro 2023', valor: 18000 },
      { mes: 'Dezembro 2023', valor: 14000 },
      { mes: 'Janeiro 2024', valor: 16000 },
      { mes: 'Fevereiro 2024', valor: 19000 }
    ];

    const totalCustosVariaveis = custosVariaveisUltimos6Meses.reduce((acc, mes) => acc + mes.valor, 0);
    this.mediaCustoVariavel = totalCustosVariaveis / 6; // média mensal em R$
  }

  private calcularMediaCustoEstrategico(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        this.calcularCustoEstrategicoPorMes();
        break;
      case 'trimestre':
        this.calcularCustoEstrategicoPorTrimestre();
        break;
      case 'ano':
        this.calcularCustoEstrategicoPorAno();
        break;
    }
  }

  private calcularCustoEstrategicoPorMes(): void {
    const custosEstrategicosPorMes: {[key: string]: number} = {
      '2025-10': 42000, '2025-09': 38000, '2025-08': 35000, '2025-07': 32000,
      '2025-06': 28000, '2025-05': 25000, '2025-04': 22000, '2025-03': 20000,
      '2025-02': 18000, '2025-01': 15000
    };

    const mesAtual = this.dataInicial.substring(0, 7);
    this.mediaCustoEstrategico = custosEstrategicosPorMes[mesAtual] || 30000;
  }

  private calcularCustoEstrategicoPorTrimestre(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
    
    const custosPorTrimestre: {[key: string]: number} = {
      '2025-Q4': 115000, // Out+Set+Ago
      '2025-Q3': 95000,  // Jul+Jun+Mai
      '2025-Q2': 70000,  // Abr+Mar+Fev
      '2025-Q1': 53000   // Jan+Dez+Nov
    };

    const chaveTrimestre = `${ano}-Q${trimestre}`;
    this.mediaCustoEstrategico = custosPorTrimestre[chaveTrimestre] || 85000;
  }

  private calcularCustoEstrategicoPorAno(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    
    const custosPorAno: {[key: string]: number} = {
      '2025': 333000, '2024': 280000, '2023': 220000
    };

    this.mediaCustoEstrategico = custosPorAno[ano.toString()] || 300000;
  }

  private calcularCustoFinanceiroInvestimento(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        this.calcularCustoFinanceiroPorMes();
        break;
      case 'trimestre':
        this.calcularCustoFinanceiroPorTrimestre();
        break;
      case 'ano':
        this.calcularCustoFinanceiroPorAno();
        break;
    }
  }

  private calcularCustoFinanceiroPorMes(): void {
    const custoFinanceiroPorMes: {[key: string]: number} = {
      '2025-10': 85000, '2025-09': 78000, '2025-08': 72000, '2025-07': 68000,
      '2025-06': 62000, '2025-05': 58000, '2025-04': 54000, '2025-03': 50000,
      '2025-02': 46000, '2025-01': 42000
    };

    const mesAtual = this.dataInicial.substring(0, 7);
    this.custoFinanceiroInvestimento = custoFinanceiroPorMes[mesAtual] || 60000;
  }

  private calcularCustoFinanceiroPorTrimestre(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
    
    const custosPorTrimestre: {[key: string]: number} = {
      '2025-Q4': 235000, // Out+Set+Ago
      '2025-Q3': 198000, // Jul+Jun+Mai
      '2025-Q2': 164000, // Abr+Mar+Fev
      '2025-Q1': 138000  // Jan+Dez+Nov
    };

    const chaveTrimestre = `${ano}-Q${trimestre}`;
    this.custoFinanceiroInvestimento = custosPorTrimestre[chaveTrimestre] || 180000;
  }

  private calcularCustoFinanceiroPorAno(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    
    const custosPorAno: {[key: string]: number} = {
      '2025': 735000, '2024': 650000, '2023': 520000
    };

    this.custoFinanceiroInvestimento = custosPorAno[ano.toString()] || 600000;
  }

  private calcularTotalClientesAtivos(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        const clientesPorMes: {[key: string]: number} = {
          '2025-10': 1250, '2025-09': 1180, '2025-08': 1120, '2025-07': 1080,
          '2025-06': 1020, '2025-05': 980, '2025-04': 920, '2025-03': 880,
          '2025-02': 820, '2025-01': 750
        };
        const mesAtual = this.dataInicial.substring(0, 7);
        this.totalClientesAtivos = clientesPorMes[mesAtual] || 1000;
        break;
      case 'trimestre':
        const dataIni = new Date(this.dataInicial);
        const ano = dataIni.getFullYear();
        const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
        const clientesPorTrimestre: {[key: string]: number} = {
          '2025-Q4': 3550, '2025-Q3': 3080, '2025-Q2': 2820, '2025-Q1': 2450
        };
        const chaveTrimestre = `${ano}-Q${trimestre}`;
        this.totalClientesAtivos = clientesPorTrimestre[chaveTrimestre] || 3000;
        break;
      case 'ano':
        const anoAtual = new Date(this.dataInicial).getFullYear();
        const clientesPorAno: {[key: string]: number} = {
          '2025': 11900, '2024': 10500, '2023': 8500
        };
        this.totalClientesAtivos = clientesPorAno[anoAtual.toString()] || 10000;
        break;
    }
  }

  private calcularChurnPercent(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        const churnPorMes: {[key: string]: number} = {
          '2025-10': 1.8, '2025-09': 2.1, '2025-08': 2.3, '2025-07': 2.6,
          '2025-06': 2.9, '2025-05': 3.2, '2025-04': 3.5, '2025-03': 3.8,
          '2025-02': 4.1, '2025-01': 4.5
        };
        const mesAtual = this.dataInicial.substring(0, 7);
        this.churnPercent = churnPorMes[mesAtual] || 3.0;
        break;
      case 'trimestre':
        const dataIni = new Date(this.dataInicial);
        const ano = dataIni.getFullYear();
        const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
        const churnPorTrimestre: {[key: string]: number} = {
          '2025-Q4': 2.1, '2025-Q3': 2.9, '2025-Q2': 3.5, '2025-Q1': 4.1
        };
        const chaveTrimestre = `${ano}-Q${trimestre}`;
        this.churnPercent = churnPorTrimestre[chaveTrimestre] || 3.2;
        break;
      case 'ano':
        const anoAtual = new Date(this.dataInicial).getFullYear();
        const churnPorAno: {[key: string]: number} = {
          '2025': 2.6, '2024': 3.1, '2023': 3.8
        };
        this.churnPercent = churnPorAno[anoAtual.toString()] || 3.0;
        break;
    }
  }

  private calcularLtvMeses(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        const ltvPorMes: {[key: string]: number} = {
          '2025-10': 28, '2025-09': 27, '2025-08': 26, '2025-07': 25,
          '2025-06': 24, '2025-05': 23, '2025-04': 22, '2025-03': 21,
          '2025-02': 20, '2025-01': 19
        };
        const mesAtual = this.dataInicial.substring(0, 7);
        this.ltvMeses = ltvPorMes[mesAtual] || 24;
        break;
      case 'trimestre':
        const dataIni = new Date(this.dataInicial);
        const ano = dataIni.getFullYear();
        const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
        const ltvPorTrimestre: {[key: string]: number} = {
          '2025-Q4': 27, '2025-Q3': 24, '2025-Q2': 21, '2025-Q1': 20
        };
        const chaveTrimestre = `${ano}-Q${trimestre}`;
        this.ltvMeses = ltvPorTrimestre[chaveTrimestre] || 23;
        break;
      case 'ano':
        const anoAtual = new Date(this.dataInicial).getFullYear();
        const ltvPorAno: {[key: string]: number} = {
          '2025': 25, '2024': 22, '2023': 18
        };
        this.ltvMeses = ltvPorAno[anoAtual.toString()] || 22;
        break;
    }
  }

  private calcularInadimplencia(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        const inadValorPorMes: {[key: string]: number} = {
          '2025-10': 42000, '2025-09': 45000, '2025-08': 47000, '2025-07': 50000,
          '2025-06': 52000, '2025-05': 54000, '2025-04': 56000, '2025-03': 58000,
          '2025-02': 60000, '2025-01': 62000
        };
        const inadTaxaPorMes: {[key: string]: number} = {
          '2025-10': 3.1, '2025-09': 3.3, '2025-08': 3.5, '2025-07': 3.7,
          '2025-06': 3.9, '2025-05': 4.1, '2025-04': 4.3, '2025-03': 4.5,
          '2025-02': 4.7, '2025-01': 5.0
        };
        const mesAtual = this.dataInicial.substring(0, 7);
        this.inadimplenciaValor = inadValorPorMes[mesAtual] || 50000;
        this.inadimplenciaTaxa = inadTaxaPorMes[mesAtual] || 4.0;
        break;
      case 'trimestre':
        const dataIni = new Date(this.dataInicial);
        const ano = dataIni.getFullYear();
        const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
        const inadValorPorTrimestre: {[key: string]: number} = {
          '2025-Q4': 134000, '2025-Q3': 149000, '2025-Q2': 164000, '2025-Q1': 180000
        };
        const inadTaxaPorTrimestre: {[key: string]: number} = {
          '2025-Q4': 3.3, '2025-Q3': 3.8, '2025-Q2': 4.3, '2025-Q1': 4.7
        };
        const chaveTrimestre = `${ano}-Q${trimestre}`;
        this.inadimplenciaValor = inadValorPorTrimestre[chaveTrimestre] || 150000;
        this.inadimplenciaTaxa = inadTaxaPorTrimestre[chaveTrimestre] || 4.0;
        break;
      case 'ano':
        const anoAtual = new Date(this.dataInicial).getFullYear();
        const inadValorPorAno: {[key: string]: number} = {
          '2025': 627000, '2024': 580000, '2023': 520000
        };
        const inadTaxaPorAno: {[key: string]: number} = {
          '2025': 3.9, '2024': 4.2, '2023': 4.8
        };
        this.inadimplenciaValor = inadValorPorAno[anoAtual.toString()] || 600000;
        this.inadimplenciaTaxa = inadTaxaPorAno[anoAtual.toString()] || 4.0;
        break;
    }
  }

  private inicializarFiltros(): void {
    // Inicializa meses
    this.mesesDisponiveis = [
      { value: '2025-10', label: 'outubro 2025' },
      { value: '2025-09', label: 'setembro 2025' },
      { value: '2025-08', label: 'agosto 2025' },
      { value: '2025-07', label: 'julho 2025' },
      { value: '2025-06', label: 'junho 2025' },
      { value: '2025-05', label: 'maio 2025' },
      { value: '2025-04', label: 'abril 2025' },
      { value: '2025-03', label: 'março 2025' },
      { value: '2025-02', label: 'fevereiro 2025' },
      { value: '2025-01', label: 'janeiro 2025' }
    ];

    // Inicializa trimestres
    this.trimestresDisponiveis = [
      { value: '2025-Q4', label: '4º Trimestre 2025' },
      { value: '2025-Q3', label: '3º Trimestre 2025' },
      { value: '2025-Q2', label: '2º Trimestre 2025' },
      { value: '2025-Q1', label: '1º Trimestre 2025' }
    ];

    // Inicializa anos
    this.anosDisponiveis = [
      { value: '2025', label: '2025' },
      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' }
    ];

    // Define valores padrão
    this.dataInicial = '2025-10-01';
    this.dataFinal = '2025-10-31';
    this.tipoFiltro = 'mes';
  }

  onFiltroAlterado(): void {
    console.log('Filtro alterado:', { tipoFiltro: this.tipoFiltro, dataInicial: this.dataInicial, dataFinal: this.dataFinal });
    this.filtrarDadosPorPeriodo();
    this.calcularMediasContratosUltimos3Meses();
    this.calcularMediaCustoFixo();
    this.calcularMediaCustoVariavel();
    this.calcularMediaCustoEstrategico();
    this.calcularCustoFinanceiroInvestimento();
    this.calcularTotalClientesAtivos();
    this.calcularChurnPercent();
    this.calcularLtvMeses();
    this.calcularInadimplencia();
    
    // Atualiza os gráficos
    if (isPlatformBrowser(this.platformId)) {
      this.criarGraficoReceitas();
      this.criarGraficoDespesas();
    }
  }

  onTipoFiltroAlterado(): void {
    // Ajusta as datas baseado no tipo de filtro
    const hoje = new Date();
    const ano = hoje.getFullYear();
    
    switch (this.tipoFiltro) {
      case 'mes':
        this.dataInicial = `${ano}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
        this.dataFinal = `${ano}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${new Date(ano, hoje.getMonth() + 1, 0).getDate()}`;
        break;
      case 'trimestre':
        const trimestre = Math.ceil((hoje.getMonth() + 1) / 3);
        const mesInicial = (trimestre - 1) * 3 + 1;
        const mesFinal = trimestre * 3;
        this.dataInicial = `${ano}-${String(mesInicial).padStart(2, '0')}-01`;
        this.dataFinal = `${ano}-${String(mesFinal).padStart(2, '0')}-${new Date(ano, mesFinal, 0).getDate()}`;
        break;
      case 'ano':
        this.dataInicial = `${ano}-01-01`;
        this.dataFinal = `${ano}-12-31`;
        break;
    }
    
    this.onFiltroAlterado();
  }

  getTrimestreSelecionado(): string {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
    return `${ano}-Q${trimestre}`;
  }

  getAnoSelecionado(): string {
    const dataIni = new Date(this.dataInicial);
    return dataIni.getFullYear().toString();
  }

  selecionarTrimestre(trimestreValue: string): void {
    const [ano, q] = trimestreValue.split('-Q');
    const trimestre = parseInt(q);
    
    // Calcula datas do trimestre
    const mesInicial = (trimestre - 1) * 3 + 1;
    const mesFinal = trimestre * 3;
    
    this.dataInicial = `${ano}-${String(mesInicial).padStart(2, '0')}-01`;
    this.dataFinal = `${ano}-${String(mesFinal).padStart(2, '0')}-${new Date(parseInt(ano), mesFinal, 0).getDate()}`;
    
    this.onFiltroAlterado();
  }

  selecionarAno(anoValue: string): void {
    this.dataInicial = `${anoValue}-01-01`;
    this.dataFinal = `${anoValue}-12-31`;
    this.onFiltroAlterado();
  }

  private filtrarDadosPorPeriodo(): void {
    switch (this.tipoFiltro) {
      case 'mes':
        this.filtrarDadosPorMes();
        break;
      case 'trimestre':
        this.filtrarDadosPorTrimestre();
        break;
      case 'ano':
        this.filtrarDadosPorAno();
        break;
    }
  }

  private filtrarDadosPorMes(): void {
    const mesAtual = this.dataInicial.substring(0, 7); // YYYY-MM
    // Dados mock para 10 meses de 2025 (janeiro a outubro) com valores diferentes
    const dadosPorMes: {[key: string]: DadosFinanceiros} = {
      '2025-10': {
        receitas: 400000,
        despesas: 130000,
        lucro: 270000,
        contratosAtivos: 7,
        contratosPendentes: 3,
        contratosVencidos: 1,
        margemBruta: 67.5,
        margemLiquida: 67.5,
        roi: 207.7,
        receitaMensal: [
          { mes: 'Ago', valor: 36000 },
          { mes: 'Set', valor: 38000 },
          { mes: 'Out', valor: 40000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 70000 },
          { categoria: 'Tecnologia', valor: 22000 },
          { categoria: 'Marketing', valor: 18000 },
          { categoria: 'Consultoria', valor: 13000 },
          { categoria: 'Outros', valor: 7000 }
        ],
        indicadores: {
          crescimentoReceita: 38.5,
          eficienciaOperacional: 90.2,
          satisfacaoCliente: 96.9,
          produtividade: 172.4
        }
      },
      '2025-09': {
        receitas: 380000,
        despesas: 125000,
        lucro: 255000,
        contratosAtivos: 6,
        contratosPendentes: 4,
        contratosVencidos: 2,
        margemBruta: 67.1,
        margemLiquida: 67.1,
        roi: 204.0,
        receitaMensal: [
          { mes: 'Jul', valor: 34000 },
          { mes: 'Ago', valor: 36000 },
          { mes: 'Set', valor: 38000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 68000 },
          { categoria: 'Tecnologia', valor: 20000 },
          { categoria: 'Marketing', valor: 17000 },
          { categoria: 'Consultoria', valor: 12000 },
          { categoria: 'Outros', valor: 8000 }
        ],
        indicadores: {
          crescimentoReceita: 35.7,
          eficienciaOperacional: 88.6,
          satisfacaoCliente: 95.8,
          produtividade: 168.1
        }
      },
      '2025-08': {
        receitas: 350000,
        despesas: 120000,
        lucro: 230000,
        contratosAtivos: 6,
        contratosPendentes: 5,
        contratosVencidos: 2,
        margemBruta: 65.7,
        margemLiquida: 65.7,
        roi: 191.7,
        receitaMensal: [
          { mes: 'Jun', valor: 32000 },
          { mes: 'Jul', valor: 34000 },
          { mes: 'Ago', valor: 35000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 65000 },
          { categoria: 'Tecnologia', valor: 18000 },
          { categoria: 'Marketing', valor: 15000 },
          { categoria: 'Consultoria', valor: 12000 },
          { categoria: 'Outros', valor: 10000 }
        ],
        indicadores: {
          crescimentoReceita: 32.1,
          eficienciaOperacional: 86.4,
          satisfacaoCliente: 94.2,
          produtividade: 162.8
        }
      },
      '2025-07': {
        receitas: 320000,
        despesas: 110000,
        lucro: 210000,
        contratosAtivos: 5,
        contratosPendentes: 6,
        contratosVencidos: 3,
        margemBruta: 65.6,
        margemLiquida: 65.6,
        roi: 190.9,
        receitaMensal: [
          { mes: 'Mai', valor: 30000 },
          { mes: 'Jun', valor: 32000 },
          { mes: 'Jul', valor: 32000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 60000 },
          { categoria: 'Tecnologia', valor: 17000 },
          { categoria: 'Marketing', valor: 14000 },
          { categoria: 'Consultoria', valor: 11000 },
          { categoria: 'Outros', valor: 8000 }
        ],
        indicadores: {
          crescimentoReceita: 28.5,
          eficienciaOperacional: 84.1,
          satisfacaoCliente: 92.6,
          produtividade: 157.3
        }
      },
      '2025-06': {
        receitas: 280000,
        despesas: 100000,
        lucro: 180000,
        contratosAtivos: 5,
        contratosPendentes: 7,
        contratosVencidos: 4,
        margemBruta: 64.3,
        margemLiquida: 64.3,
        roi: 180.0,
        receitaMensal: [
          { mes: 'Abr', valor: 26000 },
          { mes: 'Mai', valor: 28000 },
          { mes: 'Jun', valor: 28000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 55000 },
          { categoria: 'Tecnologia', valor: 15000 },
          { categoria: 'Marketing', valor: 13000 },
          { categoria: 'Consultoria', valor: 10000 },
          { categoria: 'Outros', valor: 7000 }
        ],
        indicadores: {
          crescimentoReceita: 24.8,
          eficienciaOperacional: 81.7,
          satisfacaoCliente: 90.9,
          produtividade: 151.6
        }
      },
      '2025-05': {
        receitas: 250000,
        despesas: 90000,
        lucro: 160000,
        contratosAtivos: 4,
        contratosPendentes: 8,
        contratosVencidos: 5,
        margemBruta: 64.0,
        margemLiquida: 64.0,
        roi: 177.8,
        receitaMensal: [
          { mes: 'Mar', valor: 23000 },
          { mes: 'Abr', valor: 25000 },
          { mes: 'Mai', valor: 25000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 50000 },
          { categoria: 'Tecnologia', valor: 13000 },
          { categoria: 'Marketing', valor: 12000 },
          { categoria: 'Consultoria', valor: 9000 },
          { categoria: 'Outros', valor: 6000 }
        ],
        indicadores: {
          crescimentoReceita: 21.2,
          eficienciaOperacional: 79.2,
          satisfacaoCliente: 89.1,
          produtividade: 145.9
        }
      },
      '2025-04': {
        receitas: 220000,
        despesas: 80000,
        lucro: 140000,
        contratosAtivos: 4,
        contratosPendentes: 9,
        contratosVencidos: 6,
        margemBruta: 63.6,
        margemLiquida: 63.6,
        roi: 175.0,
        receitaMensal: [
          { mes: 'Fev', valor: 20000 },
          { mes: 'Mar', valor: 22000 },
          { mes: 'Abr', valor: 22000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 45000 },
          { categoria: 'Tecnologia', valor: 12000 },
          { categoria: 'Marketing', valor: 11000 },
          { categoria: 'Consultoria', valor: 8000 },
          { categoria: 'Outros', valor: 4000 }
        ],
        indicadores: {
          crescimentoReceita: 17.6,
          eficienciaOperacional: 76.8,
          satisfacaoCliente: 87.3,
          produtividade: 140.2
        }
      },
      '2025-03': {
        receitas: 190000,
        despesas: 75000,
        lucro: 115000,
        contratosAtivos: 3,
        contratosPendentes: 10,
        contratosVencidos: 7,
        margemBruta: 60.5,
        margemLiquida: 60.5,
        roi: 153.3,
        receitaMensal: [
          { mes: 'Jan', valor: 17000 },
          { mes: 'Fev', valor: 19000 },
          { mes: 'Mar', valor: 19000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 40000 },
          { categoria: 'Tecnologia', valor: 11000 },
          { categoria: 'Marketing', valor: 10000 },
          { categoria: 'Consultoria', valor: 8000 },
          { categoria: 'Outros', valor: 6000 }
        ],
        indicadores: {
          crescimentoReceita: 14.1,
          eficienciaOperacional: 74.3,
          satisfacaoCliente: 85.4,
          produtividade: 134.5
        }
      },
      '2025-02': {
        receitas: 160000,
        despesas: 70000,
        lucro: 90000,
        contratosAtivos: 3,
        contratosPendentes: 11,
        contratosVencidos: 8,
        margemBruta: 56.3,
        margemLiquida: 56.3,
        roi: 128.6,
        receitaMensal: [
          { mes: 'Dez', valor: 15000 },
          { mes: 'Jan', valor: 16000 },
          { mes: 'Fev', valor: 16000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 35000 },
          { categoria: 'Tecnologia', valor: 10000 },
          { categoria: 'Marketing', valor: 9000 },
          { categoria: 'Consultoria', valor: 8000 },
          { categoria: 'Outros', valor: 8000 }
        ],
        indicadores: {
          crescimentoReceita: 10.5,
          eficienciaOperacional: 71.8,
          satisfacaoCliente: 83.6,
          produtividade: 128.8
        }
      },
      '2025-01': {
        receitas: 130000,
        despesas: 65000,
        lucro: 65000,
        contratosAtivos: 2,
        contratosPendentes: 12,
        contratosVencidos: 9,
        margemBruta: 50.0,
        margemLiquida: 50.0,
        roi: 100.0,
        receitaMensal: [
          { mes: 'Nov', valor: 12000 },
          { mes: 'Dez', valor: 13000 },
          { mes: 'Jan', valor: 13000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 30000 },
          { categoria: 'Tecnologia', valor: 9000 },
          { categoria: 'Marketing', valor: 8000 },
          { categoria: 'Consultoria', valor: 10000 },
          { categoria: 'Outros', valor: 8000 }
        ],
        indicadores: {
          crescimentoReceita: 6.9,
          eficienciaOperacional: 69.2,
          satisfacaoCliente: 81.7,
          produtividade: 123.1
        }
      }
    };

    // Usa dados específicos do mês ou dados padrão
    this.dadosFiltrados = dadosPorMes[mesAtual] || this.dados;
    console.log('Dados filtrados para', mesAtual, ':', this.dadosFiltrados.receitas);
  }

  private filtrarDadosPorTrimestre(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
    
    // Dados mock para trimestres (agregação de 3 meses)
    const dadosPorTrimestre: {[key: string]: DadosFinanceiros} = {
      '2025-Q4': {
        receitas: 400000 + 380000 + 350000, // Out+Set+Ago
        despesas: 130000 + 125000 + 120000,
        lucro: 270000 + 255000 + 230000,
        contratosAtivos: 7,
        contratosPendentes: 3,
        contratosVencidos: 1,
        margemBruta: 67.5,
        margemLiquida: 67.5,
        roi: 207.7,
        receitaMensal: [
          { mes: 'Ago', valor: 35000 },
          { mes: 'Set', valor: 38000 },
          { mes: 'Out', valor: 40000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 203000 },
          { categoria: 'Tecnologia', valor: 60000 },
          { categoria: 'Marketing', valor: 50000 },
          { categoria: 'Consultoria', valor: 37000 },
          { categoria: 'Outros', valor: 25000 }
        ],
        indicadores: {
          crescimentoReceita: 38.5,
          eficienciaOperacional: 90.2,
          satisfacaoCliente: 96.9,
          produtividade: 172.4
        }
      },
      '2025-Q3': {
        receitas: 350000 + 320000 + 280000, // Jul+Jun+Mai
        despesas: 120000 + 110000 + 100000,
        lucro: 230000 + 210000 + 180000,
        contratosAtivos: 6,
        contratosPendentes: 4,
        contratosVencidos: 2,
        margemBruta: 65.7,
        margemLiquida: 65.7,
        roi: 191.7,
        receitaMensal: [
          { mes: 'Mai', valor: 25000 },
          { mes: 'Jun', valor: 28000 },
          { mes: 'Jul', valor: 32000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 180000 },
          { categoria: 'Tecnologia', valor: 50000 },
          { categoria: 'Marketing', valor: 42000 },
          { categoria: 'Consultoria', valor: 33000 },
          { categoria: 'Outros', valor: 25000 }
        ],
        indicadores: {
          crescimentoReceita: 32.1,
          eficienciaOperacional: 86.4,
          satisfacaoCliente: 94.2,
          produtividade: 162.8
        }
      },
      '2025-Q2': {
        receitas: 280000 + 250000 + 220000, // Abr+Mar+Fev
        despesas: 100000 + 90000 + 80000,
        lucro: 180000 + 160000 + 140000,
        contratosAtivos: 5,
        contratosPendentes: 5,
        contratosVencidos: 3,
        margemBruta: 64.3,
        margemLiquida: 64.3,
        roi: 180.0,
        receitaMensal: [
          { mes: 'Fev', valor: 16000 },
          { mes: 'Mar', valor: 19000 },
          { mes: 'Abr', valor: 22000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 150000 },
          { categoria: 'Tecnologia', valor: 40000 },
          { categoria: 'Marketing', valor: 36000 },
          { categoria: 'Consultoria', valor: 27000 },
          { categoria: 'Outros', valor: 15000 }
        ],
        indicadores: {
          crescimentoReceita: 24.8,
          eficienciaOperacional: 81.7,
          satisfacaoCliente: 90.9,
          produtividade: 151.6
        }
      },
      '2025-Q1': {
        receitas: 220000 + 190000 + 160000, // Jan+Dez+Nov (2024)
        despesas: 80000 + 75000 + 70000,
        lucro: 140000 + 115000 + 90000,
        contratosAtivos: 4,
        contratosPendentes: 6,
        contratosVencidos: 4,
        margemBruta: 63.6,
        margemLiquida: 63.6,
        roi: 175.0,
        receitaMensal: [
          { mes: 'Nov', valor: 12000 },
          { mes: 'Dez', valor: 15000 },
          { mes: 'Jan', valor: 16000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 120000 },
          { categoria: 'Tecnologia', valor: 32000 },
          { categoria: 'Marketing', valor: 29000 },
          { categoria: 'Consultoria', valor: 26000 },
          { categoria: 'Outros', valor: 18000 }
        ],
        indicadores: {
          crescimentoReceita: 17.6,
          eficienciaOperacional: 76.8,
          satisfacaoCliente: 87.3,
          produtividade: 140.2
        }
      }
    };

    const chaveTrimestre = `${ano}-Q${trimestre}`;
    this.dadosFiltrados = dadosPorTrimestre[chaveTrimestre] || this.dados;
    console.log('Dados filtrados para trimestre', chaveTrimestre, ':', this.dadosFiltrados.receitas);
  }

  private filtrarDadosPorAno(): void {
    const dataIni = new Date(this.dataInicial);
    const ano = dataIni.getFullYear();
    
    // Dados mock para anos (agregação de 12 meses)
    const dadosPorAno: {[key: string]: DadosFinanceiros} = {
      '2025': {
        receitas: 4000000, // Agregação de todos os meses
        despesas: 1300000,
        lucro: 2700000,
        contratosAtivos: 8,
        contratosPendentes: 2,
        contratosVencidos: 1,
        margemBruta: 67.5,
        margemLiquida: 67.5,
        roi: 207.7,
        receitaMensal: [
          { mes: 'Jan', valor: 13000 },
          { mes: 'Fev', valor: 16000 },
          { mes: 'Mar', valor: 19000 },
          { mes: 'Abr', valor: 22000 },
          { mes: 'Mai', valor: 25000 },
          { mes: 'Jun', valor: 28000 },
          { mes: 'Jul', valor: 32000 },
          { mes: 'Ago', valor: 35000 },
          { mes: 'Set', valor: 38000 },
          { mes: 'Out', valor: 40000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 700000 },
          { categoria: 'Tecnologia', valor: 200000 },
          { categoria: 'Marketing', valor: 180000 },
          { categoria: 'Consultoria', valor: 150000 },
          { categoria: 'Outros', valor: 70000 }
        ],
        indicadores: {
          crescimentoReceita: 38.5,
          eficienciaOperacional: 90.2,
          satisfacaoCliente: 96.9,
          produtividade: 172.4
        }
      },
      '2024': {
        receitas: 2800000,
        despesas: 900000,
        lucro: 1900000,
        contratosAtivos: 6,
        contratosPendentes: 4,
        contratosVencidos: 3,
        margemBruta: 67.9,
        margemLiquida: 67.9,
        roi: 211.1,
        receitaMensal: [
          { mes: 'Jan', valor: 20000 },
          { mes: 'Fev', valor: 22000 },
          { mes: 'Mar', valor: 24000 },
          { mes: 'Abr', valor: 26000 },
          { mes: 'Mai', valor: 28000 },
          { mes: 'Jun', valor: 30000 },
          { mes: 'Jul', valor: 32000 },
          { mes: 'Ago', valor: 34000 },
          { mes: 'Set', valor: 36000 },
          { mes: 'Out', valor: 38000 },
          { mes: 'Nov', valor: 40000 },
          { mes: 'Dez', valor: 42000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 500000 },
          { categoria: 'Tecnologia', valor: 150000 },
          { categoria: 'Marketing', valor: 120000 },
          { categoria: 'Consultoria', valor: 100000 },
          { categoria: 'Outros', valor: 30000 }
        ],
        indicadores: {
          crescimentoReceita: 25.0,
          eficienciaOperacional: 85.0,
          satisfacaoCliente: 92.0,
          produtividade: 160.0
        }
      },
      '2023': {
        receitas: 2000000,
        despesas: 700000,
        lucro: 1300000,
        contratosAtivos: 4,
        contratosPendentes: 6,
        contratosVencidos: 5,
        margemBruta: 65.0,
        margemLiquida: 65.0,
        roi: 185.7,
        receitaMensal: [
          { mes: 'Jan', valor: 15000 },
          { mes: 'Fev', valor: 16000 },
          { mes: 'Mar', valor: 17000 },
          { mes: 'Abr', valor: 18000 },
          { mes: 'Mai', valor: 19000 },
          { mes: 'Jun', valor: 20000 },
          { mes: 'Jul', valor: 21000 },
          { mes: 'Ago', valor: 22000 },
          { mes: 'Set', valor: 23000 },
          { mes: 'Out', valor: 24000 },
          { mes: 'Nov', valor: 25000 },
          { mes: 'Dez', valor: 26000 }
        ],
        despesasPorCategoria: [
          { categoria: 'Salários', valor: 400000 },
          { categoria: 'Tecnologia', valor: 120000 },
          { categoria: 'Marketing', valor: 100000 },
          { categoria: 'Consultoria', valor: 60000 },
          { categoria: 'Outros', valor: 20000 }
        ],
        indicadores: {
          crescimentoReceita: 15.0,
          eficienciaOperacional: 80.0,
          satisfacaoCliente: 88.0,
          produtividade: 140.0
        }
      }
    };

    this.dadosFiltrados = dadosPorAno[ano.toString()] || this.dados;
    console.log('Dados filtrados para ano', ano, ':', this.dadosFiltrados.receitas);
  }

  getPeriodoAtualLabel(): string {
    const dataIni = new Date(this.dataInicial);
    const dataFim = new Date(this.dataFinal);
    
    switch (this.tipoFiltro) {
      case 'mes':
        return dataIni.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      case 'trimestre':
        const trimestre = Math.ceil((dataIni.getMonth() + 1) / 3);
        return `${trimestre}º Trimestre ${dataIni.getFullYear()}`;
      case 'ano':
        return dataIni.getFullYear().toString();
      default:
        return 'Carregando...';
    }
  }

  getStatusFiltro(): string {
    const dataIni = new Date(this.dataInicial);
    const mes = dataIni.getMonth() + 1;
    
    // Simula status baseado no mês selecionado
    if (mes >= 9) return 'Excelente';
    if (mes >= 6) return 'Bom';
    if (mes >= 3) return 'Regular';
    return 'Inicial';
  }
}
