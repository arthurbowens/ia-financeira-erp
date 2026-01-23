import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {
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

  // Segmento atual (para mostrar apenas uma seção)
  segmentoAtual: string | null = null;

  // Se deve mostrar apenas o formulário de diagnóstico
  apenasDiagnostico: boolean = false;

  // Estado do menu mobile
  menuMobileAberto = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar se deve mostrar apenas o diagnóstico
    this.apenasDiagnostico = this.route.snapshot.data['apenasDiagnostico'] || false;
    
    // Verificar se há um segmento específico na rota
    this.segmentoAtual = this.route.snapshot.data['segmento'] || null;
    
    // Pré-preencher o segmento no formulário se houver um segmento específico
    if (this.segmentoAtual) {
      const mapeamentoSegmentos: { [key: string]: string } = {
        'restaurantes': 'Restaurante',
        'prestadores': 'Prestador de Serviço',
        'agencias': 'Agência de Marketing'
      };
      this.formData.segmento = mapeamentoSegmentos[this.segmentoAtual] || '';
    }
    
    // Se houver segmento específico, fazer scroll automático após um pequeno delay
    if (this.segmentoAtual && !this.apenasDiagnostico) {
      setTimeout(() => {
        this.scrollToSegmento(this.segmentoAtual!);
      }, 300);
    }
  }

  // Verificar se deve mostrar uma seção específica
  mostrarSecao(secao: string): boolean {
    // Só mostrar seções quando há um segmento específico (não na home)
    if (!this.segmentoAtual) {
      return false; // Não mostrar seções na home
    }
    // Mapear nomes das seções (o que vem na rota vs o ID da seção)
    const mapeamento: { [key: string]: string[] } = {
      'restaurantes': ['restaurantes'],
      'prestadores': ['servicos', 'prestadores'],
      'agencias': ['agencias']
    };
    
    const secoesPermitidas = mapeamento[this.segmentoAtual] || [];
    return secoesPermitidas.includes(secao);
  }

  // Scroll para o segmento específico
  scrollToSegmento(segmento: string): void {
    let elementoId = '';
    switch(segmento) {
      case 'restaurantes':
        elementoId = 'restaurantes';
        break;
      case 'prestadores':
        elementoId = 'servicos';
        break;
      case 'agencias':
        elementoId = 'agencias';
        break;
    }
    
    if (elementoId) {
      const el = document.getElementById(elementoId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleMenuMobile(): void {
    this.menuMobileAberto = !this.menuMobileAberto;
  }

  fecharMenuMobile(): void {
    this.menuMobileAberto = false;
  }

  scrollToDiagnostico(): void {
    // Se estiver na rota de diagnóstico, não precisa fazer nada
    if (this.apenasDiagnostico) {
      return;
    }
    
    // Se estiver na home ou em outra página, redirecionar para /diagnostico
    if (!this.segmentoAtual) {
      this.router.navigate(['/diagnostico']);
      return;
    }
    
    // Se estiver em uma página de segmento, fazer scroll
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

    // Determinar mensagem final baseada no segmento
    let mensagemFinal = '';
    if (this.segmentoAtual === 'restaurantes') {
      mensagemFinal = 'Quero organizar o financeiro do meu restaurante.';
    } else if (this.segmentoAtual === 'prestadores') {
      mensagemFinal = 'Quero clareza do meu financeiro.';
    } else if (this.segmentoAtual === 'agencias') {
      mensagemFinal = 'Quero organizar o financeiro da minha agência.';
    } else {
      mensagemFinal = 'Quero organizar o financeiro da minha empresa.';
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
${mensagemFinal}
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

