import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { CONTRATOS_MOCK, Contrato } from '../../data/mock-data';

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assinatura.component.html',
})
export class AssinaturaComponent implements OnInit {
  contrato: Contrato | null = null;
  assinaturaDigital: string = '';
  isAssinando: boolean = false;
  assinaturaRealizada: boolean = false;
  analiseIA: string = '';
  isAnalisando: boolean = false;
  currentDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiService: AiService
  ) {}

  ngOnInit() {
    const contratoId = this.route.snapshot.queryParams['contratoId'];
    if (contratoId) {
      this.contrato = CONTRATOS_MOCK.find(c => c.id === contratoId) || null;
      if (this.contrato) {
        this.analisarContratoComIA();
      }
    }
  }

  analisarContratoComIA() {
    if (!this.contrato) return;

    this.isAnalisando = true;
    this.aiService.simulateDigitalSignature(this.contrato.conteudo).subscribe({
      next: (response) => {
        this.analiseIA = response.message;
        this.isAnalisando = false;
      },
      error: (error) => {
        console.error('Erro na análise da IA:', error);
        this.analiseIA = 'Erro ao analisar o contrato. Tente novamente.';
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }


  gerarHashAssinatura(): string {
    // Simular geração de hash para assinatura digital
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2);
    return `SHA256:${timestamp}${random}`.substring(0, 64);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pendente': return 'status-pendente';
      case 'assinado': return 'status-assinado';
      case 'vencido': return 'status-vencido';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'assinado': return 'Assinado';
      case 'vencido': return 'Vencido';
      default: return status;
    }
  }

  simularAssinatura(): void {
    if (!this.contrato) return;

    this.isAssinando = true;
    // Simula um atraso para a assinatura
    setTimeout(() => {
      this.assinaturaDigital = `Assinado por: [Seu Nome] em ${new Date().toLocaleString()}`;
      this.assinaturaRealizada = true;
      this.isAssinando = false;
      // Atualiza o status do contrato mockado
      const index = CONTRATOS_MOCK.findIndex(c => c.id === this.contrato!.id);
      if (index !== -1) {
        CONTRATOS_MOCK[index].status = 'assinado';
      }
    }, 2000);
  }

  voltarParaContratos(): void {
    this.router.navigate(['/contratos']);
  }
}
