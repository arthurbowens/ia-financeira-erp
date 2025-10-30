import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'cliente';
  status: 'ativo' | 'inativo';
  ultimoAcesso: string;
  dataCriacao: string;
  permissions: {
    dashboard: boolean;
    relatorio: boolean;
    movimentacoes: boolean;
    fluxoCaixa: boolean;
    contratos: boolean;
    chat: boolean;
    assinatura: boolean;
    gerenciarAcessos: boolean;
  };
}

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
  filtroTexto: string = '';
  filtroRole: string = 'todos';
  filtroStatus: string = 'todos';
  
  // Modal de edição
  usuarioEditando: Usuario | null = null;
  isModalAberto: boolean = false;
  
  // Modal de permissões
  usuarioPermissoes: Usuario | null = null;
  isPermissoesAberto: boolean = false;
  
  // Formulário de novo usuário
  novoUsuario = {
    nome: '',
    email: '',
    role: 'cliente' as 'admin' | 'cliente',
    senha: ''
  };
  isModalNovoAberto: boolean = false;

  ngOnInit() {
    this.carregarUsuarios();
    this.aplicarFiltros();
  }

  carregarUsuarios() {
    // Mock de usuários - apenas clientes
    this.usuarios = [
      {
        id: '1',
        nome: 'Cliente',
        email: 'cliente@startarget.com',
        role: 'cliente',
        status: 'ativo',
        ultimoAcesso: '2024-01-14T15:45:00Z',
        dataCriacao: '2024-01-02T00:00:00Z',
        permissions: {
          dashboard: true,
          relatorio: true,
          movimentacoes: true,
          fluxoCaixa: true,
          contratos: true,
          chat: true,
          assinatura: true,
          gerenciarAcessos: true
        }
      }
    ];
  }

  aplicarFiltros() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const matchTexto = !this.filtroTexto || 
        usuario.nome.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      const matchRole = this.filtroRole === 'todos' || usuario.role === this.filtroRole;
      const matchStatus = this.filtroStatus === 'todos' || usuario.status === this.filtroStatus;
      
      return matchTexto && matchRole && matchStatus;
    });
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  abrirModalEdicao(usuario: Usuario) {
    this.usuarioEditando = { ...usuario };
    this.isModalAberto = true;
  }

  fecharModal() {
    this.isModalAberto = false;
    this.usuarioEditando = null;
  }

  salvarUsuario() {
    if (this.usuarioEditando) {
      const index = this.usuarios.findIndex(u => u.id === this.usuarioEditando!.id);
      if (index !== -1) {
        this.usuarios[index] = { ...this.usuarioEditando };
        this.aplicarFiltros();
      }
      this.fecharModal();
    }
  }

  abrirModalPermissoes(usuario: Usuario) {
    // clonar para edição sem afetar lista até salvar
    this.usuarioPermissoes = JSON.parse(JSON.stringify(usuario));
    this.isPermissoesAberto = true;
  }

  fecharModalPermissoes() {
    this.isPermissoesAberto = false;
    this.usuarioPermissoes = null;
  }

  salvarPermissoes() {
    if (!this.usuarioPermissoes) return;
    const idx = this.usuarios.findIndex(u => u.id === this.usuarioPermissoes!.id);
    if (idx !== -1) {
      this.usuarios[idx] = { ...this.usuarios[idx], permissions: { ...this.usuarioPermissoes.permissions } };
      this.aplicarFiltros();
    }
    this.fecharModalPermissoes();
  }

  abrirModalNovo() {
    this.novoUsuario = {
      nome: '',
      email: '',
      role: 'cliente',
      senha: ''
    };
    this.isModalNovoAberto = true;
  }

  fecharModalNovo() {
    this.isModalNovoAberto = false;
  }

  criarUsuario() {
    if (this.novoUsuario.nome && this.novoUsuario.email && this.novoUsuario.senha) {
      const novoUsuario: Usuario = {
        id: (this.usuarios.length + 1).toString(),
        nome: this.novoUsuario.nome,
        email: this.novoUsuario.email,
        role: this.novoUsuario.role,
        status: 'ativo',
        ultimoAcesso: new Date().toISOString(),
        dataCriacao: new Date().toISOString(),
        permissions: {
          dashboard: true,
          relatorio: true,
          movimentacoes: true,
          fluxoCaixa: true,
          contratos: true,
          chat: true,
          assinatura: true,
          gerenciarAcessos: true
        }
      };
      
      this.usuarios.push(novoUsuario);
      this.aplicarFiltros();
      this.fecharModalNovo();
    }
  }

  alternarStatus(usuario: Usuario) {
    usuario.status = usuario.status === 'ativo' ? 'inativo' : 'ativo';
    this.aplicarFiltros();
  }

  excluirUsuario(usuario: Usuario) {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
      this.aplicarFiltros();
    }
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ativo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  }
}
