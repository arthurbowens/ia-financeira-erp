import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.scss']
})
export class EsqueciSenhaComponent {
  // Etapas do fluxo
  etapa: 'solicitar' | 'resetar' = 'solicitar';
  
  // Formulário de solicitação
  formSolicitar = {
    email: ''
  };
  
  // Formulário de reset
  formReset = {
    token: '',
    novaSenha: '',
    confirmarSenha: ''
  };
  
  // Estados
  mensagemSucesso: string | null = null;
  erro: string | null = null;
  emailEnviado: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private loadingService: LoadingService
  ) {
    // Verificar se há token na URL (vindo do email)
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.formReset.token = params['token'];
        this.etapa = 'resetar';
      }
    });
  }

  /**
   * Solicita recuperação de senha
   */
  async solicitarRecuperacao() {
    if (!this.formSolicitar.email || !this.validarEmail(this.formSolicitar.email)) {
      this.erro = 'Digite um email válido.';
      return;
    }

    this.loadingService.setLoading(true);
    this.erro = null;
    this.mensagemSucesso = null;

    const sucesso = await this.authService.forgotPassword(this.formSolicitar.email);

    this.loadingService.setLoading(false);

    if (sucesso) {
      this.emailEnviado = true;
      this.mensagemSucesso = `Instruções para redefinição de senha foram enviadas para ${this.formSolicitar.email}`;
    } else {
      this.erro = 'Erro ao solicitar recuperação. Verifique se o email está correto.';
    }
  }

  /**
   * Redefine a senha
   */
  async redefinirSenha() {
    // Validações
    if (!this.formReset.token) {
      this.erro = 'Token inválido. Use o link enviado por email.';
      return;
    }

    if (!this.formReset.novaSenha || this.formReset.novaSenha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.formReset.novaSenha !== this.formReset.confirmarSenha) {
      this.erro = 'As senhas não coincidem.';
      return;
    }

    this.loadingService.setLoading(true);
    this.erro = null;
    this.mensagemSucesso = null;

    const sucesso = await this.authService.resetPassword(
      this.formReset.token,
      this.formReset.novaSenha
    );

    this.loadingService.setLoading(false);

    if (sucesso) {
      this.mensagemSucesso = 'Senha redefinida com sucesso! Redirecionando para o login...';
      setTimeout(() => {
        this.router.navigate(['/login'], {
          queryParams: { senhaRedefinida: 'true' }
        });
      }, 2000);
    } else {
      this.erro = 'Erro ao redefinir senha. O token pode estar expirado ou inválido.';
    }
  }

  /**
   * Volta para o login
   */
  voltarParaLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Valida formato de email
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

