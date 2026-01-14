// Configuração da API - Opções gratuitas
// Escolha uma das opções abaixo:

export const API_CONFIG = {
  // OPÇÃO 1: Hugging Face (GRATUITA)
  HUGGINGFACE_API_KEY: 'hf_your_token_here', // Configure seu token aqui
  HUGGINGFACE_API_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  
  // OPÇÃO 2: OpenAI (Pode ter créditos gratuitos)
  OPENAI_API_KEY: 'sk-your-openai-api-key-here', // Configure sua chave aqui
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  
  // OPÇÃO 3: API Local/Simulada (SEMPRE GRATUITA)
  USE_MOCK_API: true, // Mude para false para usar APIs reais de IA
  
  // Configurações gerais de IA
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,

  // ===========================
  // BACKEND FINNZA / AUTENTICAÇÃO
  // ===========================

  // URL base do backend Spring Boot
  // Detecta automaticamente: localhost em dev, Render em produção
  // Você pode forçar uma URL específica definindo a variável de ambiente BACKEND_API_URL
  BACKEND_API_URL: (() => {
    // Se tiver variável de ambiente definida (útil para builds de produção), usa ela
    if (typeof process !== 'undefined' && process.env['BACKEND_API_URL']) {
      return process.env['BACKEND_API_URL'];
    }
    
    // Detecta se está rodando localmente (desenvolvimento)
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '');
    
    // Em desenvolvimento: usa localhost
    // Em produção (deploy): usa a URL do Render
    return isLocalhost 
      ? 'http://localhost:8080'  // Desenvolvimento local
      : 'https://finnza-backend-2l9v.onrender.com';  // Produção (Render)
  })(),

  // Flag para usar login mockado no front (false = usar backend real)
  USE_BACKEND_MOCK_AUTH: false
};

// INSTRUÇÕES PARA APIs GRATUITAS:

// 1. HUGGING FACE (RECOMENDADO - GRATUITO):
//    - Acesse: https://huggingface.co/settings/tokens
//    - Crie um token gratuito
//    - Substitua 'hf_your_token_here' pelo seu token
//    - Mude USE_MOCK_API para false

// 2. OPENAI (CRÉDITOS GRATUITOS):
//    - Acesse: https://platform.openai.com/api-keys
//    - Use os créditos gratuitos iniciais
//    - Substitua 'sk-your-openai-api-key-here' pela sua chave

// 3. MOCK API (SEMPRE FUNCIONA):
//    - Mantenha USE_MOCK_API: true
//    - Respostas simuladas inteligentes
//    - Perfeito para demonstração