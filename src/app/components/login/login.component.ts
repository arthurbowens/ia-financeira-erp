import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Dados do formulário
  loginForm = {
    email: '',
    password: ''
  };

  // Estados da UI
  isLoading = false;
  showPassword = false;
  rememberMe = false;
  errorMessage = '';

  // Validação
  isFormValid = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar se já está logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Toggle de visibilidade da senha
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Validação do formulário
  validateForm(): void {
    this.isFormValid = this.loginForm.email.length > 0 && 
                      this.loginForm.password.length > 0 &&
                      this.isValidEmail(this.loginForm.email);
  }

  // Validação de email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  // Submissão do formulário
  async onSubmit(): Promise<void> {
    if (!this.isFormValid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Usar o serviço de autenticação
      const success = await this.authService.login(this.loginForm.email, this.loginForm.password);
      
      if (success) {
        // Redirecionar para dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Email ou senha incorretos. Tente novamente.';
      }
      
    } catch (error) {
      this.errorMessage = 'Erro interno. Tente novamente mais tarde.';
    } finally {
      this.isLoading = false;
    }
  }


  // Esqueci minha senha
  onForgotPassword(): void {
    // Implementar lógica de recuperação de senha
    alert('Funcionalidade de recuperação de senha será implementada em breve.');
  }

  // Limpar mensagens de erro
  clearError(): void {
    this.errorMessage = '';
  }

  // Navegar para página de registro (se existir)
  onRegister(): void {
    // Implementar navegação para registro
    alert('Funcionalidade de registro será implementada em breve.');
  }
}
