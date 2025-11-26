import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario, CriarUsuarioRequest, AtualizarUsuarioRequest, AtualizarPermissoesRequest, PageResponse } from '../../services/usuario.service';

@Component({
  selector: 'app-gerenciar-acessos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-acessos.component.html',
  styleUrls: ['./gerenciar-acessos.component.scss']
})
export class GerenciarAcessosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  
  // Paginação
  paginaAtual: number = 0;
  tamanhoPagina: number = 10;
  totalElementos: number = 0;
  totalPaginas: number = 0;
  carregando: boolean = false;
  erro: string | null = null;
  
  // Expor Math para o template
  Math = Math;
  
  // Filtros
  filtroTexto: string = '';
  filtroRole: string = 'todos';
  filtroStatus: string = 'todos';
  usarFiltrosAvancados: boolean = false;
  
  // Modal de edição
  usuarioEditando: Usuario | null = null;
  isModalAberto: boolean = false;
  formEdicao: AtualizarUsuarioRequest = {};
  
  // Modal de permissões
  usuarioPermissoes: Usuario | null = null;
  isPermissoesAberto: boolean = false;
  permissoesEditando: { [key: string]: boolean } = {};
  
  // Formulário de novo usuário
  novoUsuario: CriarUsuarioRequest = {
    nome: '',
    email: '',
    senha: '',
    role: 'CLIENTE'
  };
  isModalNovoAberto: boolean = false;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.carregarUsuarios();
  }

  /**
   * Carrega usuários do backend com paginação
   */
  carregarUsuarios() {
    this.carregando = true;
    this.erro = null;

    if (this.usarFiltrosAvancados && (this.filtroTexto || this.filtroRole !== 'todos' || this.filtroStatus !== 'todos')) {
      // Usar filtros avançados do backend
      const filtros: any = {
        page: this.paginaAtual,
        size: this.tamanhoPagina,
        sort: 'nome'
      };

      if (this.filtroTexto) {
        filtros.nome = this.filtroTexto;
        filtros.email = this.filtroTexto;
      }
      if (this.filtroRole !== 'todos') {
        filtros.role = this.filtroRole.toUpperCase();
      }
      if (this.filtroStatus !== 'todos') {
        filtros.status = this.filtroStatus.toUpperCase();
      }

      this.usuarioService.listarComFiltros(filtros).subscribe({
        next: (response: PageResponse<Usuario>) => {
          this.processarResposta(response);
        },
        error: (error) => {
          this.erro = 'Erro ao carregar usuários. Tente novamente.';
          console.error('Erro ao carregar usuários:', error);
          this.carregando = false;
        }
      });
    } else {
      // Listagem simples com paginação
      this.usuarioService.listarUsuarios(this.paginaAtual, this.tamanhoPagina, 'nome').subscribe({
        next: (response: PageResponse<Usuario>) => {
          this.processarResposta(response);
        },
        error: (error) => {
          this.erro = 'Erro ao carregar usuários. Tente novamente.';
          console.error('Erro ao carregar usuários:', error);
          this.carregando = false;
        }
      });
    }
  }

  /**
   * Processa a resposta paginada do backend
   */
  private processarResposta(response: PageResponse<Usuario>) {
    this.usuarios = response.content || [];
    this.usuariosFiltrados = [...this.usuarios];
    this.totalElementos = response.totalElements || 0;
    this.totalPaginas = response.totalPages || 0;
    this.paginaAtual = response.number || 0;
    this.carregando = false;
  }

  /**
   * Aplica filtros localmente (para busca rápida enquanto digita)
   */
  aplicarFiltros() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const matchTexto = !this.filtroTexto || 
        usuario.name.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      const matchRole = this.filtroRole === 'todos' || usuario.role === this.filtroRole;
      const matchStatus = this.filtroStatus === 'todos' || usuario.status === this.filtroStatus;
      
      return matchTexto && matchRole && matchStatus;
    });
  }

  /**
   * Quando filtros mudam, recarrega do backend
   */
  onFiltroChange() {
    this.paginaAtual = 0; // Reset para primeira página
    this.carregarUsuarios();
  }

  /**
   * Navegação de páginas
   */
  irParaPagina(pagina: number) {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaAtual = pagina;
      this.carregarUsuarios();
    }
  }

  /**
   * Abre modal de edição
   */
  abrirModalEdicao(usuario: Usuario) {
    this.usuarioEditando = usuario;
    this.formEdicao = {
      nome: usuario.name,
      email: usuario.email,
      role: usuario.role.toUpperCase() as 'ADMIN' | 'CLIENTE',
      status: usuario.status.toUpperCase() as 'ATIVO' | 'INATIVO'
    };
    this.isModalAberto = true;
  }

  fecharModal() {
    this.isModalAberto = false;
    this.usuarioEditando = null;
    this.formEdicao = {};
  }

  /**
   * Salva alterações do usuário
   */
  salvarUsuario() {
    if (!this.usuarioEditando) return;

    this.carregando = true;
    this.usuarioService.atualizarUsuario(this.usuarioEditando.id, this.formEdicao).subscribe({
      next: (usuarioAtualizado) => {
        this.carregarUsuarios(); // Recarrega lista
        this.fecharModal();
      },
      error: (error) => {
        this.erro = 'Erro ao atualizar usuário. Tente novamente.';
        console.error('Erro ao atualizar usuário:', error);
        this.carregando = false;
      }
    });
  }

  /**
   * Abre modal de permissões
   */
  abrirModalPermissoes(usuario: Usuario) {
    this.usuarioPermissoes = usuario;
    this.permissoesEditando = usuario.permissions ? { ...usuario.permissions } : {
      dashboard: false,
      relatorio: false,
      movimentacoes: false,
      fluxoCaixa: false,
      contratos: false,
      chat: false,
      assinatura: false,
      gerenciarAcessos: false
    };
    this.isPermissoesAberto = true;
  }

  fecharModalPermissoes() {
    this.isPermissoesAberto = false;
    this.usuarioPermissoes = null;
    this.permissoesEditando = {};
  }

  /**
   * Salva permissões do usuário
   */
  salvarPermissoes() {
    if (!this.usuarioPermissoes) return;

    this.carregando = true;
    const request: AtualizarPermissoesRequest = {
      permissions: this.permissoesEditando
    };

    this.usuarioService.atualizarPermissoes(this.usuarioPermissoes.id, request).subscribe({
      next: (usuarioAtualizado) => {
        this.carregarUsuarios(); // Recarrega lista
        this.fecharModalPermissoes();
      },
      error: (error) => {
        this.erro = 'Erro ao atualizar permissões. Tente novamente.';
        console.error('Erro ao atualizar permissões:', error);
        this.carregando = false;
      }
    });
  }

  /**
   * Abre modal de novo usuário
   */
  abrirModalNovo() {
    this.novoUsuario = {
      nome: '',
      email: '',
      senha: '',
      role: 'CLIENTE'
    };
    this.isModalNovoAberto = true;
  }

  fecharModalNovo() {
    this.isModalNovoAberto = false;
  }

  /**
   * Cria novo usuário
   */
  criarUsuario() {
    if (!this.novoUsuario.nome || !this.novoUsuario.email || !this.novoUsuario.senha) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    this.carregando = true;
    this.usuarioService.criarUsuario(this.novoUsuario).subscribe({
      next: (novoUsuario) => {
        this.carregarUsuarios(); // Recarrega lista
        this.fecharModalNovo();
      },
      error: (error) => {
        this.erro = error.error?.message || 'Erro ao criar usuário. Tente novamente.';
        console.error('Erro ao criar usuário:', error);
        this.carregando = false;
      }
    });
  }

  /**
   * Alterna status do usuário (ativo/inativo)
   */
  alternarStatus(usuario: Usuario) {
    const novoStatus = usuario.status === 'ativo' ? 'INATIVO' : 'ATIVO';
    
    this.carregando = true;
    this.usuarioService.atualizarUsuario(usuario.id, { status: novoStatus }).subscribe({
      next: () => {
        this.carregarUsuarios(); // Recarrega lista
      },
      error: (error) => {
        this.erro = 'Erro ao alterar status. Tente novamente.';
        console.error('Erro ao alterar status:', error);
        this.carregando = false;
      }
    });
  }

  /**
   * Exclui usuário (soft delete)
   */
  excluirUsuario(usuario: Usuario) {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.name}?`)) {
      this.carregando = true;
      this.usuarioService.deletarUsuario(usuario.id).subscribe({
        next: () => {
          this.carregarUsuarios(); // Recarrega lista
        },
        error: (error) => {
          this.erro = 'Erro ao excluir usuário. Tente novamente.';
          console.error('Erro ao excluir usuário:', error);
          this.carregando = false;
        }
      });
    }
  }

  /**
   * Formata data para exibição
   */
  formatarData(data?: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Classes CSS para badges de status
   */
  getStatusBadgeClass(status: string): string {
    return status === 'ativo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  /**
   * Classes CSS para badges de role
   */
  getRoleBadgeClass(role: string): string {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  }

  /**
   * Gera array de números para paginação
   */
  getPaginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(0, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas - 1, this.paginaAtual + 2);
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}
