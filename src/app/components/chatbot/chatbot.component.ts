import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, ChatMessage } from '../../services/ai.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chatbot.component.html',
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  
  quickSuggestions: string[] = [
    'Análise de fluxo de caixa',
    'Gestão de contratos',
    'Relatórios financeiros',
    'Planejamento orçamentário',
    'Análise de inadimplência',
    'Estratégias de crescimento'
  ];

  constructor(private aiService: AiService) {}

  ngOnInit() {
    this.addWelcomeMessage();
  }

  addWelcomeMessage() {
    this.messages.push({
      role: 'assistant',
      content: `# 👋 Bem-vindo ao Assistente Financeiro IA

Sou sua consultora especializada em **gestão empresarial e financeira**. Estou aqui para ajudá-lo com:

## 🎯 **Principais Serviços:**
- **Análise de Contratos** - Revisão e insights jurídicos
- **Gestão Financeira** - Fluxo de caixa e orçamento
- **Relatórios Inteligentes** - Dashboards e métricas
- **Estratégias Empresariais** - Crescimento e otimização

## 💡 **Como posso ajudar hoje?**
Use as sugestões abaixo ou descreva sua consulta específica.`,
      timestamp: new Date()
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.newMessage,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.isLoading = true;
    this.newMessage = '';

    this.aiService.sendMessage(userMessage.content).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.message,
          timestamp: response.timestamp
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao enviar mensagem:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Tente novamente.',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  selectSuggestion(suggestion: string) {
    this.newMessage = suggestion;
  }

  clearChat() {
    this.messages = [];
    this.addWelcomeMessage();
  }
}
