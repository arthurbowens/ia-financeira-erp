import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DADOS_FINANCEIROS_MOCK, DadosFinanceiros, CONTRATOS_MOCK, Contrato } from '../../data/mock-data';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.criarGraficoReceitas();
      this.criarGraficoDespesas();
    }
    this.calcularMediasContratosUltimos3Meses();
    this.calcularMediaCustoFixo();
    this.calcularMediaCustoVariavel();
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

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.dados.receitaMensal.map(item => item.mes),
        datasets: [{
          label: 'Receita Mensal',
          data: this.dados.receitaMensal.map(item => item.valor),
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

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.dados.despesasPorCategoria.map(item => item.categoria),
        datasets: [{
          data: this.dados.despesasPorCategoria.map(item => item.valor),
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
    return this.dados.receitas > 0 ? (this.dados.lucro / this.dados.receitas) * 100 : 0;
  }

  getMargemLucro(): string {
    return this.getLucroPercentual().toFixed(1) + '%';
  }

  getMargemDespesas(): string {
    const margem = (this.dados.despesas / this.dados.receitas) * 100;
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
}
