import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CONTRATOS_MOCK, Contrato } from '../../data/mock-data';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  contratos: Contrato[] = [];
  filtroStatus: string = 'todos';
  filtroTexto: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.contratos = CONTRATOS_MOCK;
  }

  get contratosFiltrados(): Contrato[] {
    return this.contratos.filter(contrato => {
      const statusMatch = this.filtroStatus === 'todos' || contrato.status === this.filtroStatus;
      const textoMatch = this.filtroTexto === '' || 
        contrato.titulo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        contrato.cliente.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      return statusMatch && textoMatch;
    });
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  assinarContrato(contrato: Contrato) {
    this.router.navigate(['/assinatura'], { 
      queryParams: { contratoId: contrato.id } 
    });
  }

  enviarWhatsApp(contrato: Contrato) {
    const mensagem = `Olá! Gostaria de falar sobre o contrato: ${contrato.titulo}. Valor: ${this.formatCurrency(contrato.valor)}`;
    const url = `https://wa.me/${contrato.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }

  adicionarContrato() {
    // Simular adição de novo contrato
    const novoContrato: Contrato = {
      id: (this.contratos.length + 1).toString(),
      titulo: 'Novo Contrato',
      cliente: 'Cliente Novo',
      valor: 0,
      dataVencimento: new Date().toISOString().split('T')[0],
      status: 'pendente',
      descricao: 'Descrição do novo contrato',
      conteudo: 'Conteúdo do contrato...',
      whatsapp: '5548988281035'
    };
    
    this.contratos.unshift(novoContrato);
  }

  getTotalContratos(): number {
    return this.contratosFiltrados.length;
  }

  getTotalValor(): number {
    return this.contratosFiltrados.reduce((total, contrato) => total + contrato.valor, 0);
  }
}
