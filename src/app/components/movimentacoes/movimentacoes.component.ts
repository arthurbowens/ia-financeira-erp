import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BomControleService, MovimentacaoFinanceira, FiltrosMovimentacoes } from '../../services/bomcontrole.service';
import { OmieService, MovimentacaoOmie, MovimentacoesOmieResponse, FiltrosMovimentacoesOmie } from '../../services/omie.service';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movimentacoes.component.html',
})
export class MovimentacoesComponent implements OnInit, OnDestroy {
  // UI: Date Range Picker
  mostrarRangePicker: boolean = false;
  visibleMonth: Date = new Date();
  calendarDays: Array<{ day: number, inCurrentMonth: boolean, dateStr: string }> = [];
  private tempRangeStart: string | null = null;
  private tempRangeEnd: string | null = null;
  private hoverRangeDate: string | null = null;
  
  // Datas selecionadas
  dataInicial: string = '';
  dataFinal: string = '';

  // Dados
  movimentacoes: MovimentacaoFinanceira[] = [];
  movimentacoesFiltradas: MovimentacaoFinanceira[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Totais agregados (de todas as movimentações, não apenas da página atual)
  totalReceitasGeral: number | null = null;
  totalDespesasGeral: number | null = null;
  saldoLiquidoGeral: number | null = null;

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 50;
  totalItens: number = 0;
  totalPaginas: number = 0;

  // Filtros
  filtros: FiltrosMovimentacoes = {
    tipoData: 'DataVencimento',
    itensPorPagina: 50,
    numeroDaPagina: 1
  };

  // Filtros de UI (categoria, tipo, etc.)
  filtrosUI = {
    categoria: '',
    tipo: '' as 'receita' | 'despesa' | '',
    textoPesquisa: ''
  };

  // Opções para filtros
  tipos = [
    { value: '', label: 'Todos os Tipos' },
    { value: 'receita', label: 'Receita' },
    { value: 'despesa', label: 'Despesa' }
  ];

  // Categorias dinâmicas (serão carregadas das movimentações)
  categorias: Array<{ value: string, label: string }> = [
    { value: '', label: 'Todas as Categorias' }
  ];

  // Fonte de dados
  fonteDados: 'bomcontrole' | 'omie' = 'omie'; // Padrão: OMIE

  private destroy$ = new Subject<void>();
  private textoPesquisaSubject = new Subject<string>();

  constructor(
    private bomControleService: BomControleService,
    private omieService: OmieService
  ) {
    this.visibleMonth = new Date();
    this.buildCalendar();
    
            // Debounce para pesquisa de texto - recarrega dados quando texto mudar
            this.textoPesquisaSubject.pipe(
              debounceTime(500),
              distinctUntilChanged(),
              takeUntil(this.destroy$)
            ).subscribe(texto => {
              this.filtrosUI.textoPesquisa = texto;
              this.paginaAtual = 1; // Volta para primeira página ao pesquisar
              this.carregarMovimentacoes();
            });
  }

  ngOnInit(): void {
    // Define período padrão se não houver datas selecionadas
    if (!this.dataInicial || !this.dataFinal) {
      const hoje = new Date();
      const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
      this.dataInicial = primeiroDiaAno.toISOString().split('T')[0];
      this.dataFinal = hoje.toISOString().split('T')[0];
      console.log('📅 Período padrão definido:', this.dataInicial, 'a', this.dataFinal);
    }
    
    this.carregarMovimentacoes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Carregamento de Dados =====
  carregarMovimentacoes(): void {
    this.loading = true;
    this.error = null;

    if (this.fonteDados === 'omie') {
      this.carregarMovimentacoesOmie();
    } else {
      this.carregarMovimentacoesBomControle();
    }
  }

  private carregarMovimentacoesBomControle(): void {
    // Prepara filtros - agora inclui filtros de UI também
    const filtros: FiltrosMovimentacoes = {
      ...this.filtros,
      dataInicio: this.dataInicial || undefined,
      dataTermino: this.dataFinal || undefined,
      categoria: this.filtrosUI.categoria || undefined,
      tipo: (this.filtrosUI.tipo === 'receita' || this.filtrosUI.tipo === 'despesa') ? this.filtrosUI.tipo : undefined,
      textoPesquisa: this.filtrosUI.textoPesquisa || undefined,
      numeroDaPagina: this.paginaAtual,
      itensPorPagina: this.itensPorPagina
    };

    console.log('🔍 Carregando movimentações do Bom Controle com filtros:', filtros);
    
    this.bomControleService.buscarMovimentacoes(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.processarRespostaBomControle(response);
        },
        error: (err) => {
          console.error('Erro ao carregar movimentações do Bom Controle:', err);
          this.error = err.error?.mensagem || 'Erro ao carregar movimentações';
          this.loading = false;
        }
      });
  }

  private carregarMovimentacoesOmie(): void {
    const filtros: FiltrosMovimentacoesOmie = {
      dataInicio: this.dataInicial || undefined,
      dataFim: this.dataFinal || undefined,
      pagina: this.paginaAtual,
      registrosPorPagina: this.itensPorPagina,
      tipo: (this.filtrosUI.tipo === 'receita' || this.filtrosUI.tipo === 'despesa') ? this.filtrosUI.tipo : undefined,
      categoria: this.filtrosUI.categoria || undefined,
      textoPesquisa: this.filtrosUI.textoPesquisa || undefined
    };

    console.log('🔍 Carregando movimentações do OMIE com filtros:', filtros);
    
    this.omieService.pesquisarMovimentacoes(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.processarRespostaOmie(response);
        },
        error: (err) => {
          console.error('Erro ao carregar movimentações do OMIE:', err);
          this.error = err.error?.mensagem || err.message || 'Erro ao carregar movimentações do OMIE';
          this.loading = false;
        }
      });
  }

  private processarRespostaBomControle(response: any): void {
    console.log('✅ Resposta completa do Bom Controle:', JSON.stringify(response, null, 2));
    
    this.movimentacoes = response.movimentacoes || [];
    console.log(`📦 Itens recebidos: ${this.movimentacoes.length}`);
    
    // Obtém o total de itens da resposta
    if (response.total !== undefined && response.total !== null) {
      this.totalItens = response.total;
    } else if (response.paginacao && response.paginacao.totalItens !== undefined) {
      this.totalItens = response.paginacao.totalItens;
    } else {
      this.totalItens = this.movimentacoes.length;
    }
    
    // Atualiza totais agregados
    this.totalReceitasGeral = response.totalReceitas !== undefined ? response.totalReceitas : null;
    this.totalDespesasGeral = response.totalDespesas !== undefined ? response.totalDespesas : null;
    this.saldoLiquidoGeral = response.saldoLiquido !== undefined ? response.saldoLiquido : 
                              (this.totalReceitasGeral !== null && this.totalDespesasGeral !== null ? 
                               this.totalReceitasGeral - this.totalDespesasGeral : null);
    
    // Usa o itensPorPagina retornado pelo backend se disponível
    if (response.paginacao && response.paginacao.itensPorPagina) {
      this.itensPorPagina = response.paginacao.itensPorPagina;
    }
    
    this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
    
    // Extrai categorias únicas
    this.extrairCategorias();
    
    // Os filtros já foram aplicados no backend
    this.movimentacoesFiltradas = [...this.movimentacoes];
    
    this.loading = false;
  }

  private processarRespostaOmie(response: MovimentacoesOmieResponse): void {
    console.log('✅ Resposta completa do OMIE:', JSON.stringify(response, null, 2));
    
    // Normaliza movimentações do OMIE para o formato esperado
    const movimentacoesOmie = response.movimentacoes || [];
    this.movimentacoes = movimentacoesOmie.map(mov => this.normalizarMovimentacaoOmie(mov));
    
    console.log(`📦 Itens recebidos do OMIE: ${this.movimentacoes.length}`);
    
    // Obtém o total de itens
    this.totalItens = response.total !== undefined ? response.total : this.movimentacoes.length;
    
    // Obtém totais agregados da resposta do backend (já calculados de todas as movimentações)
    // O backend agora retorna totalReceitas, totalDespesas e saldoLiquido
    const responseAny = response as any;
    if (responseAny.totalReceitas !== undefined && responseAny.totalReceitas !== null) {
      this.totalReceitasGeral = responseAny.totalReceitas;
      this.totalDespesasGeral = responseAny.totalDespesas !== undefined && responseAny.totalDespesas !== null 
        ? responseAny.totalDespesas : null;
      this.saldoLiquidoGeral = responseAny.saldoLiquido !== undefined && responseAny.saldoLiquido !== null
        ? responseAny.saldoLiquido
        : (this.totalReceitasGeral !== null && this.totalDespesasGeral !== null 
           ? this.totalReceitasGeral - this.totalDespesasGeral : null);
    } else {
      // Fallback: calcula apenas da página atual se backend não retornar os totais
      this.calcularTotaisOmie(movimentacoesOmie);
    }
    
    this.totalPaginas = Math.ceil(this.totalItens / this.itensPorPagina);
    
    // Extrai categorias únicas
    this.extrairCategorias();
    
    // Os filtros já foram aplicados no backend, então apenas usa os dados retornados
    this.movimentacoesFiltradas = [...this.movimentacoes];
    
    this.loading = false;
  }

  private normalizarMovimentacaoOmie(mov: MovimentacaoOmie): any {
    // Normaliza dados do OMIE para o formato esperado pelo componente
    const debito = mov.debito !== undefined ? mov.debito : (mov['tipo'] === 'DESPESA');
    const valor = mov['valor_documento'] || mov['valor_pago'] || 0;
    
    return {
      IdMovimentacaoFinanceiraParcela: mov['codigo_lancamento'] || '',
      Debito: debito,
      DataVencimento: mov['data_vencimento'] || '',
      DataCompetencia: mov['data_emissao'] || mov['data_vencimento'] || '',
      DataQuitacao: mov['data_pagamento'] || undefined,
      Valor: valor,
      Nome: mov['nome_cliente_fornecedor'] || mov['observacao'] || 'Movimentação OMIE',
      Observacao: mov['observacao'] || '',
      NomeClienteFornecedor: mov['nome_cliente_fornecedor'] || '',
      NomeCategoriaFinanceira: mov['categoria'] || 'Sem categoria',
      Status: mov['status'] || '',
      tipo: mov['tipo'],
      // Campos originais do OMIE preservados
      _omieData: mov
    };
  }

  private calcularTotaisOmie(movimentacoes: MovimentacaoOmie[]): void {
    let totalReceitas = 0;
    let totalDespesas = 0;

    movimentacoes.forEach(mov => {
      const valor = mov['valor_documento'] || mov['valor_pago'] || 0;
      const isDebito = mov.debito !== undefined ? mov.debito : (mov['tipo'] === 'DESPESA');
      
      if (isDebito) {
        totalDespesas += valor;
      } else {
        totalReceitas += valor;
      }
    });

    this.totalReceitasGeral = totalReceitas;
    this.totalDespesasGeral = totalDespesas;
    this.saldoLiquidoGeral = totalReceitas - totalDespesas;
    
    console.log(`💰 Totais OMIE: Receitas=${totalReceitas}, Despesas=${totalDespesas}, Saldo=${this.saldoLiquidoGeral}`);
  }

  private aplicarFiltrosUI(): void {
    let filtradas = [...this.movimentacoes];

    // Filtro por tipo (receita/despesa)
    if (this.filtrosUI.tipo) {
      filtradas = filtradas.filter(mov => {
        const isReceita = !mov.Debito;
        const isDespesa = mov.Debito;
        return this.filtrosUI.tipo === 'receita' ? isReceita : isDespesa;
      });
    }

    // Filtro por categoria
    if (this.filtrosUI.categoria) {
      filtradas = filtradas.filter(mov => 
        mov.NomeCategoriaFinanceira === this.filtrosUI.categoria
      );
    }

    // Filtro por texto de pesquisa
    if (this.filtrosUI.textoPesquisa) {
      const texto = this.filtrosUI.textoPesquisa.toLowerCase();
      filtradas = filtradas.filter(mov => 
        (mov.Nome && mov.Nome.toLowerCase().includes(texto)) ||
        (mov.NomeClienteFornecedor && mov.NomeClienteFornecedor.toLowerCase().includes(texto)) ||
        (mov.Observacao && mov.Observacao.toLowerCase().includes(texto))
      );
    }

    this.movimentacoesFiltradas = filtradas;
  }

  onFonteDadosChange(): void {
    this.paginaAtual = 1;
    this.carregarMovimentacoes();
  }

  // ===== Filtros =====
  // Os filtros agora são aplicados no backend, então quando mudarem, recarrega os dados
  onFiltroChange(): void {
    this.paginaAtual = 1; // Volta para primeira página ao mudar filtro
    this.carregarMovimentacoes();
  }

  onTextoPesquisaChange(texto: string): void {
    // Atualiza o filtro e recarrega (com debounce já aplicado pelo subject)
    this.filtrosUI.textoPesquisa = texto;
    this.paginaAtual = 1; // Volta para primeira página ao pesquisar
    this.textoPesquisaSubject.next(texto);
  }

  limparFiltros(): void {
    this.filtrosUI = {
      categoria: '',
      tipo: '',
      textoPesquisa: ''
    };
    this.dataInicial = '';
    this.dataFinal = '';
    this.paginaAtual = 1;
    this.carregarMovimentacoes();
  }

  extrairCategorias(): void {
    const categoriasSet = new Set<string>();
    categoriasSet.add('');

    this.movimentacoes.forEach(mov => {
      const categoriaRoot = this.extrairCategoriaRoot(mov);
      if (categoriaRoot) {
        categoriasSet.add(categoriaRoot);
      }
    });

    this.categorias = [
      { value: '', label: 'Todas as Categorias' },
      ...Array.from(categoriasSet)
        .filter(c => c !== '')
        .sort()
        .map(c => ({ value: c, label: c }))
    ];
  }

  extrairCategoriaRoot(mov: MovimentacaoFinanceira): string {
    if (mov.Valores && mov.Valores.length > 0) {
      return mov.Valores[0].NomeCategoriaRoot || mov.NomeCategoriaFinanceira || '';
    }
    return mov.NomeCategoriaFinanceira || '';
  }

  // ===== Paginação =====
  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.filtros.numeroDaPagina = pagina;
      this.carregarMovimentacoes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.irParaPagina(this.paginaAtual + 1);
    }
  }

  getPaginasVisiveis(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginas / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fim - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fim - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  get Math() {
    return Math;
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.irParaPagina(this.paginaAtual - 1);
    }
  }

  // ===== Date Range Picker =====
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
      const a = this.tempRangeStart <= this.tempRangeEnd ? this.tempRangeStart : this.tempRangeEnd;
      const b = this.tempRangeStart <= this.tempRangeEnd ? this.tempRangeEnd : this.tempRangeStart;
      
      this.dataInicial = a;
      this.dataFinal = b;
      
      this.paginaAtual = 1;
      this.carregarMovimentacoes();
    }
    this.mostrarRangePicker = false;
  }

  clearRange(): void {
    this.tempRangeStart = null;
    this.tempRangeEnd = null;
    this.hoverRangeDate = null;
    this.dataInicial = '';
    this.dataFinal = '';
    this.paginaAtual = 1;
    this.carregarMovimentacoes();
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
    const startWeekDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days: Array<{ day: number, inCurrentMonth: boolean, dateStr: string }> = [];

    for (let i = startWeekDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(year, month - 1, day);
      days.push({ day, inCurrentMonth: false, dateStr: this.dateToStr(date) });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      days.push({ day: d, inCurrentMonth: true, dateStr: this.dateToStr(date) });
    }

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
    if (this.tempRangeStart && !this.tempRangeEnd) {
      this.tempRangeEnd = dateStr;
    }
  }

  onHoverDate(dateStr: string | null): void {
    this.hoverRangeDate = dateStr;
  }

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

  // ===== Cálculos =====
  getTotalReceitas(): number {
    // Retorna o total geral de receitas (de todas as movimentações, não apenas da página atual)
    // Se não houver total geral disponível, calcula apenas da página atual como fallback
    if (this.totalReceitasGeral !== null && this.totalReceitasGeral !== undefined) {
      return this.totalReceitasGeral;
    }
    // Fallback: calcula apenas da página atual se não houver total geral
    return this.movimentacoesFiltradas
      .filter(mov => !mov.Debito)
      .reduce((total, mov) => total + (mov.Valor || 0), 0);
  }

  getTotalDespesas(): number {
    // Retorna o total geral de despesas (de todas as movimentações, não apenas da página atual)
    // Se não houver total geral disponível, calcula apenas da página atual como fallback
    if (this.totalDespesasGeral !== null && this.totalDespesasGeral !== undefined) {
      return this.totalDespesasGeral;
    }
    // Fallback: calcula apenas da página atual se não houver total geral
    return this.movimentacoesFiltradas
      .filter(mov => mov.Debito)
      .reduce((total, mov) => total + (mov.Valor || 0), 0);
  }

  getSaldoLiquido(): number {
    // Retorna o saldo líquido geral (de todas as movimentações)
    if (this.saldoLiquidoGeral !== null && this.saldoLiquidoGeral !== undefined) {
      return this.saldoLiquidoGeral;
    }
    // Fallback: calcula a partir dos totais gerais ou da página atual
    return this.getTotalReceitas() - this.getTotalDespesas();
  }

  // ===== Formatação =====
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  }

  formatExtrato(value: number, isDebito: boolean): string {
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(value));
    
    return isDebito ? `-${formatted}` : `+${formatted}`;
  }

  getParcelaLabel(mov: MovimentacaoFinanceira): string {
    if (mov.NumeroParcela && mov.QuantidadeParcela) {
      return `${mov.NumeroParcela}/${mov.QuantidadeParcela}`;
    }
    return mov.NumeroParcela ? `${mov.NumeroParcela}` : '∞';
  }

  // Labels para os filtros
  getCategoriaLabel(value: string): string {
    const categoria = this.categorias.find(c => c.value === value);
    return categoria ? categoria.label : value;
  }

  getTipoLabel(value: string): string {
    const tipo = this.tipos.find(t => t.value === value);
    return tipo ? tipo.label : value;
  }

  // ===== Exportação =====
  exportarExcel(): void {
    this.loading = true;
    const filtros: FiltrosMovimentacoes = {
      ...this.filtros,
      dataInicio: this.dataInicial || undefined,
      dataTermino: this.dataFinal || undefined
    };

    this.bomControleService.exportarExcel(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao exportar Excel:', err);
          this.error = 'Erro ao exportar Excel';
          this.loading = false;
        }
      });
  }

  exportarPDF(): void {
    this.loading = true;
    const filtros: FiltrosMovimentacoes = {
      ...this.filtros,
      dataInicio: this.dataInicial || undefined,
      dataTermino: this.dataFinal || undefined
    };

    this.bomControleService.exportarPDF(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao exportar PDF:', err);
          this.error = 'Erro ao exportar PDF';
          this.loading = false;
        }
      });
  }
}
