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
  // Em desenvolvimento: backend rodando em localhost:8080
  BACKEND_API_URL: 'http://localhost:8080',

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