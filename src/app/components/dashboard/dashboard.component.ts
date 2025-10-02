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
  mediaCustoFixo: number = 0;
  mediaCustoVariavel: number = 0;
  mediaCustoEstrategico: number = 0;
  totalClientesAtivos: number = 0;
  churnPercent: number = 0;
  ltvMeses: number = 0;
  inadimplenciaValor: number = 0;
  inadimplenciaTaxa: number = 0;
  
  // Filtro de mês
  mesSelecionado: string = '';
  mesesDisponiveis: Array<{value: string, label: string}> = [];
  
  // Dados filtrados por mês
  dadosFiltrados: DadosFinanceiros = this.dados;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.inicializarFiltroMes();
    this.filtrarDadosPorMes();
    this.calcularMediasContratosUltimos3Meses();
    this.calcularMediaCustoFixo();
    this.calcularMediaCustoVariavel();
    this.calcularMediaCustoEstrategico();
    this.calcularTotalClientesAtivos();
    this.calcularChurnPercent();
    this.calcularLtvMeses();
    this.calcularInadimplencia();
    this.calcularLtvMeses();
    
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

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: (this.dadosFiltrados?.receitaMensal || []).map(item => item.mes),
        datasets: [{
          label: 'Receita Mensal',
          data: (this.dadosFiltrados?.receitaMensal || []).map(item => item.valor),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#28a745',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evolução da Receita Mensal',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    };

    this.receitaChart = new Chart(ctx, config);
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
    // Dados mock simulando novos contratos dos últimos 3 meses
    const dadosMockUltimos3Meses = [
      { mes: 'Dezembro 2023', valor: 32000, quantidade: 2 }, // 2 contratos de R$ 16.000 cada
      { mes: 'Janeiro 2024', valor: 68000, quantidade: 3 },  // 3 contratos de R$ 22.667 cada
      { mes: 'Fevereiro 2024', valor: 45000, quantidade: 2 } // 2 contratos de R$ 22.500 cada
    ];

    // Calcula as médias
    const totalValor = dadosMockUltimos3Meses.reduce((acc, mes) => acc + mes.valor, 0);
    const totalQuantidade = dadosMockUltimos3Meses.reduce((acc, mes) => acc + mes.quantidade, 0);

    this.mediaNovosContratosReais3m = totalValor / 3; // média mensal em R$
    this.mediaNovosContratosUnidades3m = totalQuantidade / 3; // média mensal em unidades
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
    // Dados mock por mês para custos estratégicos
    const custosEstrategicosPorMes: {[key: string]: number} = {
      '2025-10': 42000,
      '2025-09': 38000,
      '2025-08': 35000,
      '2025-07': 32000,
      '2025-06': 28000,
      '2025-05': 25000,
      '2025-04': 22000,
      '2025-03': 20000,
      '2025-02': 18000,
      '2025-01': 15000
    };

    // Usa o valor do mês selecionado ou calcula média dos últimos 6 meses
    const mesSelecionado = this.mesSelecionado;
    if (custosEstrategicosPorMes[mesSelecionado]) {
      this.mediaCustoEstrategico = custosEstrategicosPorMes[mesSelecionado];
    } else {
      // Fallback: média dos últimos 6 meses
      const valores = Object.values(custosEstrategicosPorMes);
      const total = valores.reduce((acc, valor) => acc + valor, 0);
      this.mediaCustoEstrategico = total / valores.length;
    }
  }

  private calcularTotalClientesAtivos(): void {
    // Dados mock por mês para total de clientes ativos
    const clientesAtivosPorMes: {[key: string]: number} = {
      '2025-10': 1250,
      '2025-09': 1180,
      '2025-08': 1120,
      '2025-07': 1080,
      '2025-06': 1020,
      '2025-05': 980,
      '2025-04': 920,
      '2025-03': 880,
      '2025-02': 820,
      '2025-01': 750
    };

    // Usa o valor do mês selecionado ou calcula média dos últimos 6 meses
    const mesSelecionado = this.mesSelecionado;
    if (clientesAtivosPorMes[mesSelecionado]) {
      this.totalClientesAtivos = clientesAtivosPorMes[mesSelecionado];
    } else {
      // Fallback: média dos últimos 6 meses
      const valores = Object.values(clientesAtivosPorMes);
      const total = valores.reduce((acc, valor) => acc + valor, 0);
      this.totalClientesAtivos = total / valores.length;
    }
  }

  private calcularChurnPercent(): void {
    // Churn mensal mockado por mês (2025) em percentual
    const churnPorMes: { [key: string]: number } = {
      '2025-10': 1.8,
      '2025-09': 2.1,
      '2025-08': 2.3,
      '2025-07': 2.6,
      '2025-06': 2.9,
      '2025-05': 3.2,
      '2025-04': 3.5,
      '2025-03': 3.8,
      '2025-02': 4.1,
      '2025-01': 4.5,
    };

    const mesSelecionado = this.mesSelecionado;
    if (churnPorMes[mesSelecionado] !== undefined) {
      this.churnPercent = churnPorMes[mesSelecionado];
    } else {
      // Fallback: média do período disponível
      const valores = Object.values(churnPorMes);
      const total = valores.reduce((acc, v) => acc + v, 0);
      this.churnPercent = total / valores.length;
    }
  }

  private calcularLtvMeses(): void {
    // LTV em meses mockado por mês (2025)
    const ltvPorMes: { [key: string]: number } = {
      '2025-10': 28,
      '2025-09': 27,
      '2025-08': 26,
      '2025-07': 25,
      '2025-06': 24,
      '2025-05': 23,
      '2025-04': 22,
      '2025-03': 21,
      '2025-02': 20,
      '2025-01': 19,
    };

    const mesSelecionado = this.mesSelecionado;
    if (ltvPorMes[mesSelecionado] !== undefined) {
      this.ltvMeses = ltvPorMes[mesSelecionado];
    } else {
      const valores = Object.values(ltvPorMes);
      const total = valores.reduce((acc, v) => acc + v, 0);
      this.ltvMeses = total / valores.length;
    }
  }

  private calcularInadimplencia(): void {
    // Mock mensal 2025: valor total de inadimplência (R$) e taxa (%)
    const inadValorPorMes: { [key: string]: number } = {
      '2025-10': 42000,
      '2025-09': 45000,
      '2025-08': 47000,
      '2025-07': 50000,
      '2025-06': 52000,
      '2025-05': 54000,
      '2025-04': 56000,
      '2025-03': 58000,
      '2025-02': 60000,
      '2025-01': 62000,
    };

    const inadTaxaPorMes: { [key: string]: number } = {
      '2025-10': 3.1,
      '2025-09': 3.3,
      '2025-08': 3.5,
      '2025-07': 3.7,
      '2025-06': 3.9,
      '2025-05': 4.1,
      '2025-04': 4.3,
      '2025-03': 4.5,
      '2025-02': 4.7,
      '2025-01': 5.0,
    };

    const mesSelecionado = this.mesSelecionado;
    this.inadimplenciaValor = inadValorPorMes[mesSelecionado] ?? this.inadimplenciaValor;
    this.inadimplenciaTaxa = inadTaxaPorMes[mesSelecionado] ?? this.inadimplenciaTaxa;
    if (this.inadimplenciaValor === 0 && this.inadimplenciaTaxa === 0) {
      const valores = Object.values(inadValorPorMes);
      const total = valores.reduce((acc, v) => acc + v, 0);
      this.inadimplenciaValor = total / valores.length;

      const taxas = Object.values(inadTaxaPorMes);
      const totalTaxa = taxas.reduce((acc, v) => acc + v, 0);
      this.inadimplenciaTaxa = totalTaxa / taxas.length;
    }
  }

  private inicializarFiltroMes(): void {
    // Gera lista dos 12 meses de 2025
    this.mesesDisponiveis = [];
    
    // Cria lista de meses de janeiro a outubro 2025
    const meses = [
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
    
    this.mesesDisponiveis = meses;
    
    // Define outubro 2025 como padrão (melhor mês disponível)
    this.mesSelecionado = '2025-10';
    console.log('Mês selecionado inicial:', this.mesSelecionado);
  }

  onMesSelecionado(): void {
    console.log('Mês selecionado:', this.mesSelecionado);
    // Filtra os dados baseado no mês selecionado
    this.filtrarDadosPorMes();
    this.calcularMediasContratosUltimos3Meses();
    this.calcularMediaCustoFixo();
    this.calcularMediaCustoVariavel();
    this.calcularMediaCustoEstrategico();
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

  private filtrarDadosPorMes(): void {
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
    this.dadosFiltrados = dadosPorMes[this.mesSelecionado] || this.dados;
    console.log('Dados filtrados para', this.mesSelecionado, ':', this.dadosFiltrados.receitas);
    console.log('DadosFiltrados completo:', this.dadosFiltrados);
  }

  getMesAtualLabel(): string {
    const mes = this.mesesDisponiveis.find(m => m.value === this.mesSelecionado);
    return mes ? mes.label : 'Carregando...';
  }

  getStatusFiltro(): string {
    const mes = this.mesesDisponiveis.find(m => m.value === this.mesSelecionado);
    if (!mes) return 'Carregando...';
    
    // Simula status baseado no mês selecionado (janeiro a outubro)
    const mesNumero = parseInt(this.mesSelecionado.split('-')[1]);
    if (mesNumero >= 9) return 'Excelente';
    if (mesNumero >= 6) return 'Bom';
    if (mesNumero >= 3) return 'Regular';
    return 'Inicial';
  }
}
