import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClintService } from '../../services/clint.service';

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
    telefone: '',
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

  // Estado de envio
  enviandoClint = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clintService: ClintService
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


  /**
   * Envia o formulário para a Clint
   */
  enviarFormulario(event?: Event): void {
    // Prevenir comportamento padrão do formulário
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Enviando formulário...', this.formData);

    // Validação básica
    if (!this.formData.nome || !this.formData.email) {
      alert('Por favor, preencha pelo menos o nome e email.');
      return;
    }

    // Enviar para a Clint
    this.enviarParaClint();
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

    // Por enquanto, apenas enviar por WhatsApp
    // TODO: Reativar integração com Clint quando necessário
    // this.enviarParaClint();

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
• Telefone: ${this.formData.telefone || 'Não informado'}
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

  /**
   * Extrai DDI e número do telefone
   */
  private extrairDDIeTelefone(telefone: string): { ddi: string; phone: string } {
    if (!telefone) {
      return { ddi: '', phone: '' };
    }

    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');

    // Se começar com 55 (Brasil), extrai DDI
    if (numeros.startsWith('55') && numeros.length >= 12) {
      return {
        ddi: '55',
        phone: numeros.substring(2) // Remove o 55 do início
      };
    }

    // Se começar com 0 e depois 55, remove o 0
    if (numeros.startsWith('055') && numeros.length >= 13) {
      return {
        ddi: '55',
        phone: numeros.substring(3)
      };
    }

    // Se não tiver DDI explícito, assume Brasil (55) e usa o número completo
    if (numeros.length >= 10) {
      return {
        ddi: '55',
        phone: numeros
      };
    }

    // Caso padrão
    return {
      ddi: '55',
      phone: numeros
    };
  }

  /**
   * Envia os dados do formulário para a Clint via webhook
   */
  enviarParaClint(): void {
    this.enviandoClint = true;

    // Extrair DDI e telefone
    const { ddi, phone } = this.extrairDDIeTelefone(this.formData.telefone);

    // Preparar dados para a Clint
    // A Clint espera campos customizados dentro do objeto 'fields'
    // Os nomes dos campos devem corresponder aos campos configurados na Clint
    const contactData: any = {
      name: this.formData.nome,
      email: this.formData.email,
      username: this.formData.email.split('@')[0], // Usa a parte antes do @ como username
      fields: {}
    };

    // Adicionar telefone e DDI apenas se preenchidos
    if (phone) {
      contactData.ddi = ddi;
      contactData.phone = phone;
    }

    // Adicionar campos customizados no objeto fields
    // IMPORTANTE: Os nomes devem corresponder EXATAMENTE aos campos mapeados na Clint
    
    // Segmento → "Segmento" na Clint
    if (this.formData.segmento) {
      contactData.fields['Segmento'] = this.formData.segmento;
    }

    // Faturamento mensal aproximado → "Número de funcionários" na Clint
    if (this.formData.faturamento) {
      contactData.fields['Número de funcionários'] = this.formData.faturamento;
    }

    // Contexto / principal dor → "Notas do contato" na Clint
    if (this.formData.contexto) {
      contactData.fields['Notas do contato'] = this.formData.contexto;
    }

    // Campos adicionais de rastreamento
    contactData.fields['Origem'] = 'Landing Page - Diagnóstico';
    contactData.fields['Data de envio'] = new Date().toISOString();

    this.clintService.createContact(contactData).subscribe({
      next: (response) => {
        console.log('Contato criado na Clint com sucesso:', response);
        this.enviandoClint = false;
        
        // Mostrar mensagem de sucesso
        alert('Formulário enviado com sucesso! Entraremos em contato em breve.');
        
        // Limpar formulário após sucesso
        this.formData = {
          nome: '',
          email: '',
          telefone: '',
          segmento: '',
          faturamento: '',
          contexto: ''
        };
      },
      error: (error) => {
        console.error('Erro ao enviar para a Clint:', error);
        this.enviandoClint = false;
        
        // Mostrar mensagem de erro
        alert('Erro ao enviar formulário. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
      }
    });
  }

  // Método para obter a URL do WhatsApp para o botão flutuante
  getWhatsAppUrl(): string {
    const mensagem = 'Olá! Gostaria de saber mais sobre a Finzzia.';
    const mensagemEncoded = encodeURIComponent(mensagem);
    return `https://wa.me/${this.whatsappNumber}?text=${mensagemEncoded}`;
  }
}

