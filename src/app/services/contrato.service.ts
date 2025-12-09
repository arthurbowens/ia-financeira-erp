import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

// Interfaces baseadas no backend
export interface ClienteDTO {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  emailFinanceiro?: string;
  celularFinanceiro?: string;
}

export interface CobrancaDTO {
  id: number;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH_UNDONE' | 
          'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' |
          'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';
  linkPagamento?: string;
  codigoBarras?: string;
  numeroParcela?: number;
  asaasPaymentId?: string;
}

export interface ContratoDTO {
  id: number;
  titulo: string;
  descricao?: string;
  conteudo?: string;
  cliente: ClienteDTO;
  valorContrato: number;
  valorRecorrencia?: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'ASSINADO' | 'VENCIDO' | 'PAGO' | 'CANCELADO';
  tipoPagamento: 'UNICO' | 'RECORRENTE';
  servico?: string;
  inicioContrato?: string;
  inicioRecorrencia?: string;
  whatsapp?: string;
  asaasSubscriptionId?: string;
  cobrancas?: CobrancaDTO[];
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface CriarContratoRequest {
  titulo: string;
  descricao?: string;
  conteudo?: string;
  dadosCliente: {
    clienteId?: number;
    razaoSocial: string;
    nomeFantasia?: string;
    cpfCnpj: string;
    enderecoCompleto?: string;
    cep?: string;
    celularFinanceiro?: string;
    emailFinanceiro?: string;
    responsavel?: string;
    cpf?: string;
  };
  valorContrato: number;
  valorRecorrencia?: number;
  dataVencimento: string;
  tipoPagamento: 'UNICO' | 'RECORRENTE';
  servico?: string;
  inicioContrato?: string;
  inicioRecorrencia?: string;
  whatsapp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContratoService {
  private baseUrl = `${API_CONFIG.BACKEND_API_URL}/api/contratos`;
  private contratosSubject = new BehaviorSubject<ContratoDTO[]>([]);
  public contratos$ = this.contratosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Lista todos os contratos com paginação
   */
  listarTodos(page: number = 0, size: number = 10, sort: string = 'dataCriacao,desc'): Observable<PageResponse<ContratoDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PageResponse<ContratoDTO>>(this.baseUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        this.contratosSubject.next(response.content);
        return response;
      }),
      catchError(error => {
        console.error('Erro ao listar contratos:', error);
        throw error;
      })
    );
  }

  /**
   * Busca contrato por ID
   */
  buscarPorId(id: number): Observable<ContratoDTO> {
    return this.http.get<ContratoDTO>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Erro ao buscar contrato:', error);
        throw error;
      })
    );
  }

  /**
   * Busca contratos por cliente
   */
  buscarPorCliente(clienteId: number, page: number = 0, size: number = 10): Observable<PageResponse<ContratoDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<ContratoDTO>>(`${this.baseUrl}/cliente/${clienteId}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        this.contratosSubject.next(response.content);
        return response;
      }),
      catchError(error => {
        console.error('Erro ao buscar contratos por cliente:', error);
        throw error;
      })
    );
  }

  /**
   * Busca contratos por status
   */
  buscarPorStatus(status: string, page: number = 0, size: number = 10): Observable<PageResponse<ContratoDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<ContratoDTO>>(`${this.baseUrl}/status/${status}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        this.contratosSubject.next(response.content);
        return response;
      }),
      catchError(error => {
        console.error('Erro ao buscar contratos por status:', error);
        throw error;
      })
    );
  }

  /**
   * Busca contratos com filtros
   */
  buscarComFiltros(
    clienteId?: number,
    status?: string,
    termo?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<ContratoDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }
    if (termo) {
      params = params.set('termo', termo);
    }

    return this.http.get<PageResponse<ContratoDTO>>(`${this.baseUrl}/filtros`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        this.contratosSubject.next(response.content);
        return response;
      }),
      catchError(error => {
        console.error('Erro ao buscar contratos com filtros:', error);
        throw error;
      })
    );
  }

  /**
   * Cria um novo contrato
   */
  criarContrato(request: CriarContratoRequest): Observable<ContratoDTO> {
    return this.http.post<ContratoDTO>(this.baseUrl, request, {
      headers: this.getHeaders()
    }).pipe(
      map(contrato => {
        // Atualiza a lista local
        const current = this.contratosSubject.value;
        this.contratosSubject.next([contrato, ...current]);
        return contrato;
      }),
      catchError(error => {
        console.error('Erro ao criar contrato:', error);
        throw error;
      })
    );
  }

  /**
   * Remove contrato (soft delete)
   */
  removerContrato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => {
        // Remove da lista local
        const current = this.contratosSubject.value;
        this.contratosSubject.next(current.filter(c => c.id !== id));
      }),
      catchError(error => {
        console.error('Erro ao remover contrato:', error);
        throw error;
      })
    );
  }

  /**
   * Sincroniza status de um contrato com o Asaas
   */
  sincronizarStatusComAsaas(id: number): Observable<ContratoDTO> {
    return this.http.post<ContratoDTO>(`${this.baseUrl}/${id}/sincronizar`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(contrato => {
        // Atualiza na lista local
        const current = this.contratosSubject.value;
        const index = current.findIndex(c => c.id === contrato.id);
        if (index !== -1) {
          current[index] = contrato;
          this.contratosSubject.next([...current]);
        }
        return contrato;
      }),
      catchError(error => {
        console.error('Erro ao sincronizar contrato com Asaas:', error);
        throw error;
      })
    );
  }

  /**
   * Converte ContratoDTO para formato usado no componente (compatibilidade)
   */
  converterParaFormatoComponente(contrato: ContratoDTO): any {
    return {
      id: contrato.id.toString(),
      titulo: contrato.titulo,
      cliente: contrato.cliente.razaoSocial || contrato.cliente.nomeFantasia || 'Cliente',
      valor: contrato.valorContrato,
      dataVencimento: contrato.dataVencimento,
      status: this.mapearStatus(contrato.status),
      descricao: contrato.descricao || '',
      conteudo: contrato.conteudo || '',
      whatsapp: contrato.whatsapp || '',
      servico: contrato.servico,
      inicioContrato: contrato.inicioContrato,
      inicioRecorrencia: contrato.inicioRecorrencia,
      valorContrato: contrato.valorContrato,
      valorRecorrencia: contrato.valorRecorrencia,
      tipoPagamento: contrato.tipoPagamento,
      cobrancas: contrato.cobrancas || [], // Incluir cobranças para uso no Kanban
      dadosCliente: {
        razaoSocial: contrato.cliente.razaoSocial,
        nomeFantasia: contrato.cliente.nomeFantasia,
        cnpj: contrato.cliente.cpfCnpj,
        emailFinanceiro: contrato.cliente.emailFinanceiro,
        celularFinanceiro: contrato.cliente.celularFinanceiro
      }
    };
  }

  /**
   * Mapeia status do backend para formato do componente
   */
  mapearStatus(status: string): 'pendente' | 'assinado' | 'vencido' | 'pago' | 'cancelado' {
    const statusMap: Record<string, 'pendente' | 'assinado' | 'vencido' | 'pago' | 'cancelado'> = {
      'PENDENTE': 'pendente',
      'ASSINADO': 'assinado',
      'VENCIDO': 'vencido',
      'PAGO': 'pago',
      'CANCELADO': 'cancelado'
    };
    return statusMap[status] || 'pendente';
  }
}

