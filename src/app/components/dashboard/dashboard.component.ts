import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DADOS_FINANCEIROS_MOCK, DadosFinanceiros } from '../../data/mock-data';
import { AiService } from '../../services/ai.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dados: DadosFinanceiros = DADOS_FINANCEIROS_MOCK;
  receitaChart: Chart | null = null;
  despesasChart: Chart | null = null;
  analiseIA: string = '';
  isAnalisando: boolean = false;
  currentDate: Date = new Date();

  constructor(
    private aiService: AiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.criarGraficoReceitas();
      this.criarGraficoDespesas();
    }
    this.analisarDadosFinanceiros();
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

  analisarDadosFinanceiros() {
    this.isAnalisando = true;
    this.aiService.analyzeFinancialData(this.dados).subscribe({
      next: (response) => {
        this.analiseIA = response.message;
        this.isAnalisando = false;
      },
      error: (error) => {
        console.error('Erro na análise da IA:', error);
        this.analiseIA = 'Erro ao analisar os dados financeiros. Tente novamente.';
        this.isAnalisando = false;
      }
    });
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
}
