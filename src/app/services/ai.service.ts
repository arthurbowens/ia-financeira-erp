import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey = 'sk-your-openai-api-key-here'; // Configure sua chave aqui
  
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente financeiro especializado em análise de contratos, gestão financeira e ERP. Responda de forma clara e profissional, sempre focando em aspectos financeiros e legais.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    return new Observable(observer => {
      this.http.post(this.apiUrl, body, { headers: this.headers }).subscribe({
        next: (response: any) => {
          const aiMessage = response.choices[0].message.content;
          observer.next({
            message: aiMessage,
            timestamp: new Date()
          });
          observer.complete();
        },
        error: (error) => {
          console.error('Erro na API do ChatGPT:', error);
          observer.next({
            message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se a chave da API está configurada corretamente.',
            timestamp: new Date()
          });
          observer.complete();
        }
      });
    });
  }

  // Método para simular assinatura digital usando IA
  simulateDigitalSignature(contractText: string): Observable<ChatResponse> {
    const prompt = `Analise o seguinte contrato e simule uma assinatura digital segura. 
    Forneça um resumo dos pontos principais e confirme se o contrato está pronto para assinatura:
    
    ${contractText}
    
    Responda como um especialista em assinatura digital e análise contratual.`;

    return this.sendMessage(prompt);
  }

  // Método para análise financeira
  analyzeFinancialData(data: any): Observable<ChatResponse> {
    const prompt = `Analise os seguintes dados financeiros e forneça insights e recomendações:
    
    ${JSON.stringify(data, null, 2)}
    
    Foque em tendências, riscos e oportunidades de melhoria.`;

    return this.sendMessage(prompt);
  }
}
