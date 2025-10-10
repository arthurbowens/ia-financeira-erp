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

  ngOnInit() {
    // Inicialização do componente
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
}
