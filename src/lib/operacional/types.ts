// Tipos de domínio do módulo Operacional.
// Estrutura pensada para futura persistência em Supabase e integração bancária.

export type UsuarioPapel =
  | "correspondente"
  | "corretor"
  | "analista"
  | "backoffice"
  | "cliente";

export type Usuario = {
  id: string;
  nome: string;
  papel: UsuarioPapel;
  email: string;
};

export type Produto = "Financiamento Imobiliário" | "Home Equity";
export type Tabela = "SAC" | "PRICE";

export type Banco = {
  id: string;
  nome: string;
  sigla: string;
};

export type Prioridade = "Baixa" | "Média" | "Alta" | "Urgente" | "Crítica";

export type StatusSimulacao =
  | "Rascunho"
  | "Em andamento"
  | "Concluída"
  | "Enviada para proposta"
  | "Arquivada";

export type EtapaProposta =
  | "Cadastro básico"
  | "Simulação"
  | "Aprovação"
  | "Cadastro completo"
  | "Documentação completa"
  | "Formulários"
  | "Enviado para o banco"
  | "Vistoria agendada"
  | "Análise jurídica"
  | "Contrato emitido";

export const ETAPAS_PROPOSTA: EtapaProposta[] = [
  "Cadastro básico",
  "Simulação",
  "Aprovação",
  "Cadastro completo",
  "Documentação completa",
  "Formulários",
  "Enviado para o banco",
  "Vistoria agendada",
  "Análise jurídica",
  "Contrato emitido",
];

export type StatusProposta =
  | "Em aprovação"
  | "Sequenciada"
  | "Não sequenciada"
  | "Aprovada"
  | "Reprovada"
  | "Em tratativa"
  | "Documentação pendente"
  | "Aguardando banco"
  | "Análise jurídica"
  | "Contrato emitido"
  | "Finalizada";

export type StatusDemanda =
  | "Nova"
  | "Aguardando aceite"
  | "Em andamento"
  | "Aguardando retorno"
  | "Em revisão"
  | "Concluída"
  | "Reaberta"
  | "Cancelada";

export type StatusTarefa = "A fazer" | "Em andamento" | "Aguardando" | "Concluída";

export type HistoricoEntry = {
  id: string;
  data: string; // ISO
  usuarioId: string;
  acao: string;
  detalhes?: string;
};

export type Transferencia = {
  id: string;
  data: string; // ISO
  transferidoPor: string;
  origemUsuarioId: string;
  destinoUsuarioId: string;
  motivo: string;
};

export type Cliente = {
  id: string;
  nome: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  corretorId?: string;
};

export type Cenario = {
  id: string;
  bancoId: string;
  prazoMeses: number;
  tabela: Tabela;
  taxaAaPercent: number;
  parcelaInicial: number;
  parcelaFinal: number;
  totalPago: number;
  totalJuros: number;
  cetPercent: number;
  rendaMinima: number;
  favorito?: boolean;
};

export type Simulacao = {
  id: string;
  criadaEm: string;
  atualizadaEm: string;
  usuarioId: string;
  corretorId?: string;
  clienteId?: string;
  produto: Produto;
  valorImovel?: number;
  valorEntrada?: number;
  valorFinanciado?: number;
  valorSolicitado?: number;
  ltvPercent?: number;
  prazoMesesBase: number;
  rendaBruta?: number;
  cenarios: Cenario[];
  status: StatusSimulacao;
  origemCopiaDeId?: string;
  observacoes?: string;
  historico: HistoricoEntry[];
};

export type Proposta = {
  id: string;
  numero: string;
  criadaEm: string;
  atualizadaEm: string;
  clienteId: string;
  simulacaoId?: string;
  corretorId?: string;
  responsavelId: string;
  bancoId: string;
  produto: Produto;
  valor: number;
  etapa: EtapaProposta;
  status: StatusProposta;
  prioridade: Prioridade;
  slaPrazo: string; // ISO data limite
  pendencias: number;
  documentos: number;
  mensagensNaoLidas: number;
  transferida?: boolean;
  historico: HistoricoEntry[];
  transferencias: Transferencia[];
};

export type Demanda = {
  id: string;
  titulo: string;
  descricao: string;
  criadaEm: string;
  criadoPorId: string;
  responsavelId: string;
  participantesIds: string[];
  tipo: string;
  prioridade: Prioridade;
  slaPrazo: string; // ISO
  status: StatusDemanda;
  clienteId?: string;
  propostaId?: string;
  simulacaoId?: string;
  mensagensNaoLidas: number;
  transferida?: boolean;
};

export type Tarefa = {
  id: string;
  titulo: string;
  usuarioId: string;
  prazo: string; // ISO
  prioridade: Prioridade;
  status: StatusTarefa;
  clienteId?: string;
  propostaId?: string;
  simulacaoId?: string;
};
