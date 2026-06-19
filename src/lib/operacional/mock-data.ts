// Mock data realista para o módulo Operacional.
// Pensado para refletir o ecossistema Correspondente / Corretor / Cliente.

import type {
  Banco,
  Cliente,
  Demanda,
  EtapaProposta,
  Prioridade,
  Produto,
  Proposta,
  Simulacao,
  StatusDemanda,
  StatusProposta,
  StatusSimulacao,
  Tarefa,
  Usuario,
} from "./types";
import { ETAPAS_PROPOSTA } from "./types";

export const usuarios: Usuario[] = [
  { id: "u-corr-1", nome: "Marina Souza", papel: "correspondente", email: "marina@plataforma.com" },
  { id: "u-corr-2", nome: "Diego Almeida", papel: "correspondente", email: "diego@plataforma.com" },
  { id: "u-cor-1", nome: "Rafael Lima", papel: "corretor", email: "rafael@plataforma.com" },
  { id: "u-cor-2", nome: "Bianca Torres", papel: "corretor", email: "bianca@plataforma.com" },
  { id: "u-cor-3", nome: "Henrique Sá", papel: "corretor", email: "henrique@plataforma.com" },
  { id: "u-ana-1", nome: "Camila Reis", papel: "analista", email: "camila@plataforma.com" },
  { id: "u-ana-2", nome: "Pedro Nogueira", papel: "analista", email: "pedro@plataforma.com" },
  { id: "u-bo-1", nome: "Lara Mendes", papel: "backoffice", email: "lara@plataforma.com" },
  { id: "u-bo-2", nome: "Felipe Castro", papel: "backoffice", email: "felipe@plataforma.com" },
];

export const bancos: Banco[] = [
  { id: "b-itau", nome: "Itaú Unibanco", sigla: "ITAU" },
  { id: "b-bb", nome: "Banco do Brasil", sigla: "BB" },
  { id: "b-cef", nome: "Caixa Econômica Federal", sigla: "CEF" },
  { id: "b-santander", nome: "Santander", sigla: "SANT" },
  { id: "b-bradesco", nome: "Bradesco", sigla: "BRAD" },
  { id: "b-inter", nome: "Banco Inter", sigla: "INTER" },
];

export const clientes: Cliente[] = [
  { id: "c-1", nome: "João da Silva", cpf: "12345678900", email: "joao@email.com", telefone: "11987654321", corretorId: "u-cor-1" },
  { id: "c-2", nome: "Maria Oliveira", cpf: "98765432100", email: "maria@email.com", telefone: "21987651234", corretorId: "u-cor-2" },
  { id: "c-3", nome: "Carlos Pereira", cpf: "11122233344", email: "carlos@email.com", telefone: "31998761234", corretorId: "u-cor-1" },
  { id: "c-4", nome: "Ana Beatriz Costa", cpf: "22233344455", email: "ana@email.com", telefone: "11912345678", corretorId: "u-cor-3" },
  { id: "c-5", nome: "Construtora Norte Ltda.", cnpj: "12345678000190", email: "contato@cnorte.com", telefone: "1133334444", corretorId: "u-cor-2" },
  { id: "c-6", nome: "Fernanda Lopes", cpf: "33344455566", email: "fer@email.com", telefone: "11955554444", corretorId: "u-cor-3" },
  { id: "c-7", nome: "Ricardo Vasconcelos", cpf: "44455566677", email: "ricardo@email.com", telefone: "21999991111", corretorId: "u-cor-1" },
  { id: "c-8", nome: "Patrícia Ramalho", cpf: "55566677788", email: "patricia@email.com", telefone: "31988887777", corretorId: "u-cor-2" },
];

// --- helpers para gerar datas relativas
const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(now + n * 86400000).toISOString();

const produtos: Produto[] = ["Financiamento Imobiliário", "Home Equity"];
const prioridades: Prioridade[] = ["Baixa", "Média", "Alta", "Urgente", "Crítica"];
const statusSim: StatusSimulacao[] = [
  "Rascunho", "Em andamento", "Concluída", "Enviada para proposta", "Arquivada",
];
const statusProp: StatusProposta[] = [
  "Em aprovação", "Sequenciada", "Não sequenciada", "Aprovada", "Reprovada",
  "Em tratativa", "Documentação pendente", "Aguardando banco", "Análise jurídica",
  "Contrato emitido", "Finalizada",
];
const statusDem: StatusDemanda[] = [
  "Nova", "Aguardando aceite", "Em andamento", "Aguardando retorno",
  "Em revisão", "Concluída", "Reaberta",
];

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

// --- Simulações ---
export const simulacoes: Simulacao[] = Array.from({ length: 40 }, (_, i) => {
  const produto = pick(produtos, i);
  const cliente = i % 4 === 0 ? undefined : pick(clientes, i);
  const valorImovel = 350_000 + (i % 10) * 75_000;
  const valorFinanciado = Math.round(valorImovel * 0.7);
  return {
    id: `sim-${1000 + i}`,
    criadaEm: daysAgo(60 - i),
    atualizadaEm: daysAgo(Math.max(1, 60 - i - 1)),
    usuarioId: pick(usuarios.filter((u) => u.papel !== "cliente"), i).id,
    corretorId: cliente?.corretorId,
    clienteId: cliente?.id,
    produto,
    valorImovel: produto === "Financiamento Imobiliário" ? valorImovel : undefined,
    valorEntrada: produto === "Financiamento Imobiliário" ? valorImovel - valorFinanciado : undefined,
    valorFinanciado: produto === "Financiamento Imobiliário" ? valorFinanciado : undefined,
    valorSolicitado: produto === "Home Equity" ? Math.round(valorImovel * 0.5) : undefined,
    ltvPercent: produto === "Home Equity" ? 50 : undefined,
    prazoMesesBase: [180, 240, 300, 360][i % 4],
    rendaBruta: 8_000 + (i % 8) * 2_500,
    cenarios: [],
    status: pick(statusSim, i),
    observacoes: i % 5 === 0 ? "Cliente quer comparar 3 bancos." : undefined,
    historico: [
      { id: `h-${i}-1`, data: daysAgo(60 - i), usuarioId: pick(usuarios, i).id, acao: "Simulação criada" },
    ],
  } satisfies Simulacao;
});

// --- Propostas ---
export const propostas: Proposta[] = Array.from({ length: 32 }, (_, i) => {
  const cliente = pick(clientes, i);
  const etapa: EtapaProposta = pick(ETAPAS_PROPOSTA, i);
  const status = pick(statusProp, i);
  const slaOffset = (i % 11) - 3; // alguns negativos = vencidos
  return {
    id: `prop-${2000 + i}`,
    numero: `P-${(2000 + i).toString().padStart(6, "0")}`,
    criadaEm: daysAgo(45 - i),
    atualizadaEm: daysAgo(Math.max(0, 10 - (i % 10))),
    clienteId: cliente.id,
    simulacaoId: simulacoes[i % simulacoes.length].id,
    corretorId: cliente.corretorId,
    responsavelId: pick(usuarios.filter((u) => u.papel === "analista" || u.papel === "backoffice"), i).id,
    bancoId: pick(bancos, i).id,
    produto: pick(produtos, i),
    valor: 250_000 + (i % 12) * 80_000,
    etapa,
    status,
    prioridade: pick(prioridades, i),
    slaPrazo: daysAhead(slaOffset),
    pendencias: i % 4,
    documentos: 3 + (i % 8),
    mensagensNaoLidas: i % 5 === 0 ? (i % 5) + 1 : 0,
    transferida: i % 7 === 0,
    historico: [
      { id: `ph-${i}-1`, data: daysAgo(45 - i), usuarioId: pick(usuarios, i).id, acao: "Proposta criada" },
      { id: `ph-${i}-2`, data: daysAgo(10), usuarioId: pick(usuarios, i + 1).id, acao: `Etapa: ${etapa}` },
    ],
    transferencias: i % 7 === 0
      ? [{
          id: `tr-${i}`, data: daysAgo(5),
          transferidoPor: usuarios[0].id,
          origemUsuarioId: usuarios[2].id,
          destinoUsuarioId: usuarios[5].id,
          motivo: "Balanceamento de carga",
        }]
      : [],
  } satisfies Proposta;
});

// --- Demandas ---
const tiposDemanda = [
  "Cadastro de cliente", "Correção de cadastro", "Pendência documental",
  "Solicitação de simulação", "Análise de crédito", "Backoffice",
  "Suporte ao corretor", "Vistoria", "Formulários", "Contrato",
];

export const demandas: Demanda[] = Array.from({ length: 26 }, (_, i) => {
  const responsavel = pick(usuarios.filter((u) => u.papel !== "cliente"), i);
  return {
    id: `dem-${3000 + i}`,
    titulo: `${pick(tiposDemanda, i)} — ${pick(clientes, i).nome}`,
    descricao: "Demanda gerada automaticamente para acompanhamento operacional.",
    criadaEm: daysAgo(20 - (i % 20)),
    criadoPorId: pick(usuarios, i + 1).id,
    responsavelId: responsavel.id,
    participantesIds: [pick(usuarios, i + 2).id],
    tipo: pick(tiposDemanda, i),
    prioridade: pick(prioridades, i),
    slaPrazo: daysAhead((i % 9) - 2),
    status: pick(statusDem, i),
    clienteId: pick(clientes, i).id,
    propostaId: i % 2 === 0 ? propostas[i % propostas.length].id : undefined,
    mensagensNaoLidas: i % 4 === 0 ? (i % 3) + 1 : 0,
    transferida: i % 9 === 0,
  } satisfies Demanda;
});

// --- Tarefas pessoais (do usuário logado mockado: u-corr-1) ---
export const tarefas: Tarefa[] = Array.from({ length: 14 }, (_, i) => ({
  id: `tar-${4000 + i}`,
  titulo: `Tarefa ${i + 1} — ${pick(["Follow-up", "Revisão", "Ligação", "Documento"], i)}`,
  usuarioId: "u-corr-1",
  prazo: daysAhead((i % 7) - 1),
  prioridade: pick(prioridades, i),
  status: pick(["A fazer", "Em andamento", "Aguardando", "Concluída"] as const, i),
  clienteId: pick(clientes, i).id,
  propostaId: i % 3 === 0 ? propostas[i % propostas.length].id : undefined,
}));

// --- Lookups ---
export const usuarioById = (id?: string) =>
  usuarios.find((u) => u.id === id);
export const clienteById = (id?: string) =>
  clientes.find((c) => c.id === id);
export const bancoById = (id?: string) =>
  bancos.find((b) => b.id === id);
