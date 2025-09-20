export interface Contrato {
  id: string;
  titulo: string;
  cliente: string;
  valor: number;
  dataVencimento: string;
  status: 'pendente' | 'assinado' | 'vencido';
  descricao: string;
  conteudo: string;
  whatsapp: string;
}

export interface DadosFinanceiros {
  receitas: number;
  despesas: number;
  lucro: number;
  contratosAtivos: number;
  contratosPendentes: number;
  receitaMensal: Array<{mes: string, valor: number}>;
  despesasPorCategoria: Array<{categoria: string, valor: number}>;
}

export const CONTRATOS_MOCK: Contrato[] = [
  {
    id: '1',
    titulo: 'Contrato de Prestação de Serviços - Consultoria Financeira',
    cliente: 'Empresa ABC Ltda',
    valor: 15000,
    dataVencimento: '2024-02-15',
    status: 'pendente',
    descricao: 'Consultoria em gestão financeira e implementação de ERP',
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSULTORIA FINANCEIRA

CONTRATANTE: Empresa ABC Ltda
CONTRATADO: Star Target Consultoria Financeira

CLÁUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestação de serviços de consultoria financeira, incluindo análise de processos, implementação de sistemas ERP e treinamento de equipe.

CLÁUSULA 2 - DO VALOR E FORMA DE PAGAMENTO
O valor total dos serviços é de R$ 15.000,00 (quinze mil reais), a ser pago em 3 parcelas de R$ 5.000,00.

CLÁUSULA 3 - DO PRAZO
O prazo para execução dos serviços é de 90 dias, contados a partir da assinatura do contrato.

CLÁUSULA 4 - DAS OBRIGAÇÕES
O contratado se compromete a entregar relatórios mensais de progresso e capacitar a equipe do contratante.

CLÁUSULA 5 - DA CONFIDENCIALIDADE
As partes se comprometem a manter sigilo sobre informações confidenciais trocadas durante a execução do contrato.`,
    whatsapp: '5548988281035'
  },
  {
    id: '2',
    titulo: 'Contrato de Desenvolvimento de Sistema ERP',
    cliente: 'Tech Solutions S.A.',
    valor: 45000,
    dataVencimento: '2024-03-20',
    status: 'assinado',
    descricao: 'Desenvolvimento completo de sistema ERP customizado',
    conteudo: `CONTRATO DE DESENVOLVIMENTO DE SOFTWARE ERP

CONTRATANTE: Tech Solutions S.A.
CONTRATADO: Star Target Consultoria Financeira

CLÁUSULA 1 - DO OBJETO
Desenvolvimento de sistema ERP completo para gestão empresarial, incluindo módulos de vendas, compras, estoque e financeiro.

CLÁUSULA 2 - DO VALOR E FORMA DE PAGAMENTO
Valor total de R$ 45.000,00 (quarenta e cinco mil reais), dividido em 6 parcelas de R$ 7.500,00.

CLÁUSULA 3 - DO PRAZO
Prazo de desenvolvimento: 6 meses, com entregas parciais a cada 30 dias.

CLÁUSULA 4 - DAS ESPECIFICAÇÕES TÉCNICAS
Sistema web responsivo, compatível com principais navegadores, integração com APIs de terceiros.

CLÁUSULA 5 - DO SUPORTE
Suporte técnico por 12 meses após a entrega final.`,
    whatsapp: '5548988281035'
  },
  {
    id: '3',
    titulo: 'Contrato de Auditoria Financeira',
    cliente: 'Indústria XYZ Ltda',
    valor: 25000,
    dataVencimento: '2024-01-30',
    status: 'vencido',
    descricao: 'Auditoria completa dos processos financeiros e contábeis',
    conteudo: `CONTRATO DE AUDITORIA FINANCEIRA

CONTRATANTE: Indústria XYZ Ltda
CONTRATADO: Star Target Consultoria Financeira

CLÁUSULA 1 - DO OBJETO
Realização de auditoria completa dos processos financeiros, contábeis e de compliance da empresa.

CLÁUSULA 2 - DO VALOR E FORMA DE PAGAMENTO
Valor de R$ 25.000,00 (vinte e cinco mil reais), pagamento à vista.

CLÁUSULA 3 - DO PRAZO
Prazo de execução: 60 dias úteis.

CLÁUSULA 4 - DO RELATÓRIO
Entrega de relatório detalhado com recomendações e plano de ação.

CLÁUSULA 5 - DA CONFIDENCIALIDADE
Todas as informações obtidas durante a auditoria serão mantidas em sigilo absoluto.`,
    whatsapp: '5548988281035'
  }
];

export const DADOS_FINANCEIROS_MOCK: DadosFinanceiros = {
  receitas: 85000,
  despesas: 35000,
  lucro: 50000,
  contratosAtivos: 2,
  contratosPendentes: 1,
  receitaMensal: [
    { mes: 'Jan', valor: 15000 },
    { mes: 'Fev', valor: 22000 },
    { mes: 'Mar', valor: 18000 },
    { mes: 'Abr', valor: 30000 }
  ],
  despesasPorCategoria: [
    { categoria: 'Salários', valor: 20000 },
    { categoria: 'Tecnologia', valor: 8000 },
    { categoria: 'Marketing', valor: 4000 },
    { categoria: 'Outros', valor: 3000 }
  ]
};
