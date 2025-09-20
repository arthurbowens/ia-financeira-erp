# 🤖 IA Financeira & ERP

Sistema Angular moderno que simula uma IA Financeira conversacional integrada com um mini ERP para gestão de contratos e análise financeira.

## ✨ Funcionalidades

### 🧠 IA Financeira Conversacional
- Chat integrado com API do ChatGPT (GPT-4o-mini)
- Análise inteligente de dados financeiros
- Respostas especializadas em gestão financeira e contratos
- Interface de chat moderna e responsiva

### 📊 Dashboard Financeiro
- Gráficos interativos com Chart.js
- Métricas de receitas, despesas e lucro
- Análise de contratos ativos e pendentes
- Visualização de tendências mensais
- Análise de despesas por categoria

### 📋 Gestão de Contratos
- Lista de contratos com filtros por status
- Visualização detalhada de cada contrato
- Simulação de assinatura digital
- Integração com WhatsApp para comunicação
- Status: Pendente, Assinado, Vencido

### ✍️ Assinatura Digital
- Visualização completa do contrato
- Análise de IA para validação
- Simulação de processo de assinatura
- Geração de hash de segurança
- Confirmação de assinatura

## 🚀 Tecnologias Utilizadas

- **Angular 17+** - Framework principal
- **TypeScript** - Linguagem de programação
- **Chart.js** - Gráficos interativos
- **SCSS** - Estilização avançada
- **RxJS** - Programação reativa
- **Angular Router** - Navegação
- **Angular Forms** - Formulários
- **Angular HttpClient** - Comunicação HTTP

## 📦 Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd ia-financeira-erp
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure a API do ChatGPT:**
   - Abra o arquivo `src/app/services/ai.service.ts`
   - Substitua `sk-your-openai-api-key-here` pela sua chave da API OpenAI
   - Obtenha sua chave em: https://platform.openai.com/api-keys

4. **Execute o projeto:**
```bash
npm start
```

5. **Acesse no navegador:**
```
http://localhost:4200
```

## 🔧 Configuração da API

Para usar a funcionalidade de IA, você precisa configurar sua chave da API do OpenAI:

1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma nova chave de API
3. Abra `src/app/services/ai.service.ts`
4. Substitua `sk-your-openai-api-key-here` pela sua chave real

```typescript
private readonly apiKey = 'sk-sua-chave-aqui';
```

## 📱 Funcionalidades por Rota

### `/dashboard` - Dashboard Principal
- Visão geral das métricas financeiras
- Gráficos de receita mensal
- Distribuição de despesas
- Análise inteligente da IA

### `/chat` - Chat com IA
- Interface de conversação
- Respostas especializadas em finanças
- Análise de contratos
- Suporte a múltiplas conversas

### `/contratos` - Gestão de Contratos
- Lista de todos os contratos
- Filtros por status e texto
- Ações: Assinar, Enviar WhatsApp
- Estatísticas em tempo real

### `/assinatura` - Assinatura Digital
- Visualização do contrato selecionado
- Análise de IA do conteúdo
- Processo de assinatura simulado
- Confirmação e hash de segurança

## 🎨 Design e UX

- **Interface Moderna**: Design limpo e profissional
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Acessibilidade**: Navegação por teclado e leitores de tela
- **Animações**: Transições suaves e feedback visual
- **Tema Consistente**: Paleta de cores harmoniosa

## 📊 Dados Mockados

O sistema inclui dados de exemplo para demonstração:

- **3 Contratos** com diferentes status
- **Dados Financeiros** com receitas e despesas
- **Métricas Mensais** para gráficos
- **Categorias de Despesas** para análise

## 🔒 Segurança

- Validação de formulários
- Sanitização de dados
- Verificação de plataforma (browser)
- Tratamento de erros robusto

## 🚀 Deploy

Para fazer deploy em produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/ia-financeira-erp/`

## 📝 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── chatbot/          # Chat com IA
│   │   ├── contratos/        # Gestão de contratos
│   │   ├── assinatura/       # Assinatura digital
│   │   └── dashboard/        # Dashboard principal
│   ├── services/
│   │   └── ai.service.ts     # Serviço da IA
│   ├── data/
│   │   └── mock-data.ts      # Dados de exemplo
│   └── app.component.*       # Componente principal
├── styles.scss               # Estilos globais
└── index.html               # Página principal
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido como demonstração de habilidades em:
- Angular moderno (v17+)
- TypeScript avançado
- Integração com APIs externas
- Design de interfaces responsivas
- Arquitetura de componentes standalone
- Gestão de estado e roteamento

---

**Nota**: Este é um projeto de demonstração. Para uso em produção, implemente validações adicionais, autenticação e integração com backend real.# ia-financeira-erp
