import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  // Dados do formulário de diagnóstico
  formData = {
    nome: '',
    email: '',
    segmento: '',
    faturamento: '',
    contexto: ''
  };

  // Número do WhatsApp
  readonly whatsappNumber = '554896626464';

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollToDiagnostico(): void {
    const el = document.getElementById('diagnostico');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  enviarDiagnosticoWhatsApp(event?: Event): void {
    // Prevenir comportamento padrão do formulário
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Enviando diagnóstico...', this.formData);

    // Validação básica
    if (!this.formData.nome || !this.formData.email) {
      alert('Por favor, preencha pelo menos o nome e email.');
      return;
    }

    // Montar mensagem profissional e organizada
    const mensagem = `Olá! Gostaria de agendar um diagnóstico financeiro.

*Dados do Contato:*
• Nome: ${this.formData.nome}
• Email: ${this.formData.email}
• Segmento: ${this.formData.segmento || 'Não informado'}
• Faturamento mensal aproximado: ${this.formData.faturamento || 'Não informado'}

*Contexto / Principal Dor:*
${this.formData.contexto || 'Não informado'}

---
Quero organizar o financeiro da minha agência.
Diagnóstico rápido. Sem compromisso.`;

    // Codificar a mensagem para URL
    const mensagemEncoded = encodeURIComponent(mensagem);
    
    // Criar link do WhatsApp
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${mensagemEncoded}`;
    
    console.log('Abrindo WhatsApp:', whatsappUrl);
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
  }
}

