import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface ClintContactRequest {
  name: string;
  ddi?: string;
  phone?: string;
  email: string;
  username?: string;
  fields?: {
    [key: string]: any;
  };
}

export interface ClintContactResponse {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClintService {
  // Usa o webhook da Clint configurado no api.config.ts
  private readonly webhookUrl = API_CONFIG.CLINT_WEBHOOK_URL;

  constructor(private http: HttpClient) {}

  /**
   * Envia dados do formulário para a Clint via webhook
   * O webhook já está configurado com o mapeamento de campos na plataforma Clint
   */
  createContact(contact: ClintContactRequest): Observable<ClintContactResponse> {
    console.log('Enviando para webhook:', this.webhookUrl);
    console.log('Dados enviados:', contact);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Webhook da Clint - envia os dados diretamente
    // O webhook processa e cria o contato com o mapeamento configurado
    return this.http.post<ClintContactResponse>(this.webhookUrl, contact, { headers });
  }
}
