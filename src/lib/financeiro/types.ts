// Tipos do módulo Gestão Financeira
// Estrutura preparada para futura integração bancária / persistência Supabase.

export type StatusReceber =
  | "Em aberto"
  | "Recebido"
  | "Recebido parcialmente"
  | "Vencido"
  | "Cancelado"
  | "Em negociação"
  | "Estornado";

export type StatusPagar =
  | "Em aberto"
  | "Pago"
  | "Pago parcialmente"
  | "Vencido"
  | "Cancelado"
  | "Agendado"
  | "Em aprovação";

export type StatusComissao =
  | "Prevista"
  | "Aguardando aprovação"
  | "Liberada"
  | "Pendente"
  | "Bloqueada"
  | "Paga"
  | "Cancelada"
  | "Estornada";

export type FormaPagamento =
  | "Pix"
  | "Boleto"
  | "Transferência"
  | "Cartão"
  | "Dinheiro"
  | "TED/DOC"
  | "Débito automático"
  | "Outro";

export type Frequencia =
  | "Semanal"
  | "Quinzenal"
  | "Mensal"
  | "Bimestral"
  | "Trimestral"
  | "Semestral"
  | "Anual"
  | "Personalizada";

export type TipoCategoria =
  | "Receita"
  | "Despesa"
  | "Comissão"
  | "Imposto"
  | "Taxa"
  | "Operacional"
  | "Administrativo"
  | "Comercial"
  | "Marketing"
  | "Tecnologia"
  | "Bancário"
  | "Outros";

export type Categoria = {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  cor: string;
  ativa: boolean;
  descricao?: string;
  pai?: string;
  centroCustoId?: string;
};

export type CentroCusto = {
  id: string;
  nome: string;
  descricao?: string;
};

export type ContaFinanceira = {
  id: string;
  nome: string;
  banco: string;
  agencia?: string;
  conta?: string;
  saldoAtual: number;
};

export type Lancamento = {
  id: string;
  descricao: string;
  tipo: "receber" | "pagar";
  clienteId?: string;
  propostaId?: string;
  simulacaoId?: string;
  corretorId?: string;
  imobiliariaId?: string;
  fornecedor?: string;
  beneficiario?: string;
  produto?: string;
  categoriaId: string;
  centroCustoId?: string;
  valor: number;
  valorPago?: number;
  emissao: string;
  vencimento: string;
  liquidacao?: string;
  status: StatusReceber | StatusPagar;
  forma: FormaPagamento;
  contaId: string;
  observacoes?: string;
  anexos?: string[];
  recorrenciaId?: string;
  criadoPor: string;
  criadoEm: string;
  alteradoPor?: string;
  alteradoEm?: string;
};

export type Comissao = {
  id: string;
  corretorId: string;
  clienteId: string;
  propostaId: string;
  produto: string;
  bancoId: string;
  baseCalculo: number;
  percentual: number;
  valor: number;
  status: StatusComissao;
  dataPrevista: string;
  dataLiberacao?: string;
  dataPagamento?: string;
  forma?: FormaPagamento;
  observacoes?: string;
  bloqueada: boolean;
  motivoBloqueio?: string;
};

export type Recorrencia = {
  id: string;
  descricao: string;
  tipo: "receber" | "pagar";
  frequencia: Frequencia;
  diaVencimento: number;
  dataInicial: string;
  dataFinal?: string;
  parcelas?: number;
  indefinido: boolean;
  valor: number;
  valorVariavel: boolean;
  status: "Ativa" | "Pausada" | "Cancelada" | "Encerrada";
  proximaGeracao: string;
  ultimaGeracao?: string;
  categoriaId: string;
  contaId: string;
};

export type ItemConciliacao = {
  id: string;
  contaId: string;
  data: string;
  valor: number;
  descricao: string;
  categoriaId?: string;
  status: "Não conciliado" | "Conciliado" | "Divergente" | "Em revisão";
  lancamentoId?: string;
  origem: "Extrato" | "Sistema";
};
