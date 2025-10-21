import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CONTRATOS_MOCK, Contrato, DadosCliente } from '../../data/mock-data';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contratos.component.html',
})
export class ContratosComponent implements OnInit {
  contratos: Contrato[] = [];
  filtroStatus: string = 'todos';
  filtroTexto: string = '';
  visualizacao: 'lista' | 'kanban' = 'kanban';
  mostrarFormularioCliente: boolean = false;
  contratoSelecionado: Contrato | null = null;

  // Formulário de dados do cliente
  dadosCliente: DadosCliente = {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    enderecoCompleto: '',
    cep: '',
    celularFinanceiro: '',
    emailFinanceiro: '',
    responsavel: '',
    cpf: '',
    plano: '',
    descricaoNegociacao: '',
    valorRecorrencia: '',
    dataVenda: '',
    dataPrimeiraParcelaRecorrencia: ''
  };

  // Dados adicionais do contrato
  servico: string = '';
  inicioContrato: string = '';
  inicioRecorrencia: string = '';
  valorContrato: number = 0;
  valorRecorrencia: number = 0;
  formaPagamento: string = '';

  // Colunas do Kanban
  colunas = [
    { id: 'em-dia', titulo: 'Em Dia', cor: 'green', icone: '✅' },
    { id: 'atraso', titulo: 'Atraso', cor: 'orange', icone: '⏰' },
    { id: 'pendente', titulo: 'Pendentes', cor: 'yellow', icone: '⏳' },
    { id: 'inadimplentes', titulo: 'Inadimplentes', cor: 'red', icone: '⚠️' }
  ];

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

  getContratosPorStatus(status: string): number {
    return this.contratos.filter(c => c.status === status).length;
  }

  // Métodos para Kanban
  getContratosPorColuna(colunaId: string): Contrato[] {
    const contratosFiltrados = this.contratosFiltrados;
    
    switch (colunaId) {
      case 'em-dia':
        return contratosFiltrados.filter(c => {
          if (c.status !== 'assinado') return false;
          const hoje = new Date();
          const vencimento = new Date(c.dataVencimento);
          return vencimento >= hoje; // Data de vencimento maior ou igual a hoje
        });
      case 'atraso':
        return contratosFiltrados.filter(c => this.isAtraso(c));
      case 'pendente':
        return contratosFiltrados.filter(c => c.status === 'pendente');
      case 'inadimplentes':
        return contratosFiltrados.filter(c => c.status === 'vencido' || this.isInadimplente(c));
      default:
        return [];
    }
  }

  isInadimplente(contrato: Contrato): boolean {
    const hoje = new Date();
    const vencimento = new Date(contrato.dataVencimento);
    // Debug: console.log(`Contrato ${contrato.titulo}: vencimento=${contrato.dataVencimento}, hoje=${hoje.toISOString().split('T')[0]}, vencimento < hoje=${vencimento < hoje}`);
    return contrato.status === 'assinado' && vencimento < hoje;
  }

  isAtraso(contrato: Contrato): boolean {
    // Para este exemplo, não há contratos em atraso conforme solicitado
    return false;
  }

  getTotalPorColuna(colunaId: string): number {
    return this.getContratosPorColuna(colunaId).length;
  }

  getValorTotalPorColuna(colunaId: string): number {
    return this.getContratosPorColuna(colunaId).reduce((total, contrato) => total + contrato.valor, 0);
  }

  alterarVisualizacao(tipo: 'lista' | 'kanban'): void {
    this.visualizacao = tipo;
  }

  // Métodos para formulário de dados do cliente
  abrirFormularioCliente(contrato: Contrato): void {
    this.contratoSelecionado = contrato;
    this.mostrarFormularioCliente = true;
    
    // Preencher dados existentes se houver, senão usar dados mockados
    if (contrato.dadosCliente) {
      this.dadosCliente = { ...contrato.dadosCliente };
    } else {
      this.preencherDadosMockados(contrato);
    }
    
    if (contrato.servico) {
      this.servico = contrato.servico;
    } else {
      this.servico = 'Consultoria Financeira e Implementação de ERP';
    }
    
    if (contrato.inicioContrato) {
      this.inicioContrato = contrato.inicioContrato;
    } else {
      this.inicioContrato = new Date().toISOString().split('T')[0];
    }
    
    if (contrato.inicioRecorrencia) {
      this.inicioRecorrencia = contrato.inicioRecorrencia;
    } else {
      const dataRecorrencia = new Date();
      dataRecorrencia.setMonth(dataRecorrencia.getMonth() + 1);
      this.inicioRecorrencia = dataRecorrencia.toISOString().split('T')[0];
    }
    
    if (contrato.valorContrato) {
      this.valorContrato = contrato.valorContrato;
    } else {
      this.valorContrato = contrato.valor;
    }
    
    if (contrato.valorRecorrencia) {
      this.valorRecorrencia = contrato.valorRecorrencia;
    } else {
      this.valorRecorrencia = Math.round(contrato.valor * 0.15);
    }
    
    if (contrato.formaPagamento) {
      this.formaPagamento = contrato.formaPagamento;
    } else {
      this.formaPagamento = 'pix';
    }
  }

  preencherDadosMockados(contrato: Contrato): void {
    // Dados mockados baseados no contrato
    const dadosMock = this.gerarDadosMockados(contrato);
    this.dadosCliente = { ...dadosMock };
  }

  gerarDadosMockados(contrato: Contrato): DadosCliente {
    const hoje = new Date();
    const dataVenda = new Date(hoje.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const dataRecorrencia = new Date(dataVenda);
    dataRecorrencia.setMonth(dataRecorrencia.getMonth() + 1);

    return {
      razaoSocial: contrato.cliente + ' LTDA',
      nomeFantasia: contrato.cliente,
      cnpj: this.gerarCNPJ(),
      enderecoCompleto: 'Rua das Flores, 123, Centro, São Paulo - SP',
      cep: '01234-567',
      celularFinanceiro: '(11) 99999-8888',
      emailFinanceiro: 'financeiro@' + contrato.cliente.toLowerCase().replace(/\s+/g, '') + '.com.br',
      responsavel: 'João Silva',
      cpf: '123.456.789-00',
      plano: 'TURBOLOC',
      descricaoNegociacao: `SETUP: ${this.formatCurrency(contrato.valor)} em ${Math.ceil(contrato.valor / 1000)}x de ${this.formatCurrency(Math.ceil(contrato.valor / Math.ceil(contrato.valor / 1000)))}`,
      valorRecorrencia: `${this.formatCurrency(Math.round(contrato.valor * 0.15))} + 15% após o 3° mês`,
      dataVenda: dataVenda.toISOString().split('T')[0],
      dataPrimeiraParcelaRecorrencia: dataRecorrencia.toISOString().split('T')[0]
    };
  }

  gerarCNPJ(): string {
    const numeros = Array.from({length: 14}, () => Math.floor(Math.random() * 10));
    return `${numeros[0]}${numeros[1]}.${numeros[2]}${numeros[3]}${numeros[4]}.${numeros[5]}${numeros[6]}${numeros[7]}/${numeros[8]}${numeros[9]}${numeros[10]}${numeros[11]}-${numeros[12]}${numeros[13]}`;
  }

  fecharFormularioCliente(): void {
    this.mostrarFormularioCliente = false;
    this.contratoSelecionado = null;
    this.limparFormulario();
  }

  salvarDadosCliente(): void {
    if (this.contratoSelecionado) {
      // Atualizar dados do cliente no contrato
      this.contratoSelecionado.dadosCliente = { ...this.dadosCliente };
      this.contratoSelecionado.servico = this.servico;
      this.contratoSelecionado.inicioContrato = this.inicioContrato;
      this.contratoSelecionado.inicioRecorrencia = this.inicioRecorrencia;
      this.contratoSelecionado.valorContrato = this.valorContrato;
      this.contratoSelecionado.valorRecorrencia = this.valorRecorrencia;
      this.contratoSelecionado.formaPagamento = this.formaPagamento;

      // Atualizar na lista de contratos
      const index = this.contratos.findIndex(c => c.id === this.contratoSelecionado!.id);
      if (index !== -1) {
        this.contratos[index] = { ...this.contratoSelecionado };
      }
    }
    
    this.fecharFormularioCliente();
  }

  limparFormulario(): void {
    this.dadosCliente = {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      enderecoCompleto: '',
      cep: '',
      celularFinanceiro: '',
      emailFinanceiro: '',
      responsavel: '',
      cpf: '',
      plano: '',
      descricaoNegociacao: '',
      valorRecorrencia: '',
      dataVenda: '',
      dataPrimeiraParcelaRecorrencia: ''
    };
    this.servico = '';
    this.inicioContrato = '';
    this.inicioRecorrencia = '';
    this.valorContrato = 0;
    this.valorRecorrencia = 0;
    this.formaPagamento = '';
  }

  formatarCNPJ(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      this.dadosCliente.cnpj = value;
    }
  }

  formatarCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
      this.dadosCliente.cpf = value;
    }
  }

  formatarCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
      this.dadosCliente.cep = value;
    }
  }

  formatarCelular(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      this.dadosCliente.celularFinanceiro = value;
    }
  }

  getDataAtual(): string {
    return new Date().toLocaleDateString('pt-BR');
  }


  exportarContratos(): void {
    const dados = this.contratosFiltrados.map(contrato => ({
      'ID': contrato.id,
      'Título': contrato.titulo,
      'Cliente': contrato.cliente,
      'Valor': this.formatCurrency(contrato.valor),
      'Data Vencimento': contrato.dataVencimento,
      'Status': contrato.status,
      'Descrição': contrato.descricao
    }));

    const csv = this.converterParaCSV(dados);
    this.downloadCSV(csv, 'contratos.csv');
  }

  private converterParaCSV(dados: any[]): string {
    if (dados.length === 0) return '';
    
    const headers = Object.keys(dados[0]);
    const csvContent = [
      headers.join(','),
      ...dados.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
