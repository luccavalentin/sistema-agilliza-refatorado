// Store central reativa — fonte da verdade única para todos os módulos.
// Persiste em localStorage, mas com `skipHydration` para evitar mismatch SSR/cliente:
// SSR e primeiro paint do cliente usam o seed determinístico (mesma saída),
// depois o efeito em `<DataHydrationGate />` chama rehydrate() e o store
// é substituído pelos dados persistidos do usuário.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";

import {
  bancos as seedBancos,
  clientes as seedClientes,
  demandas as seedDemandas,
  propostas as seedPropostas,
  simulacoes as seedSimulacoes,
  tarefas as seedTarefas,
  usuarios as seedUsuarios,
} from "@/lib/operacional/mock-data";
import {
  categorias as seedCategorias,
  centrosCusto as seedCentros,
  comissoes as seedComissoes,
  contas as seedContas,
  contasPagar as seedPagar,
  contasReceber as seedReceber,
  itensConciliacao as seedConciliacao,
  recorrencias as seedRecorrencias,
} from "@/lib/financeiro/mock-data";
import type {
  Banco, Cliente, Demanda, EtapaProposta, Proposta, Simulacao, Tarefa, Usuario,
} from "@/lib/operacional/types";
import type {
  Categoria, CentroCusto, Comissao, ContaFinanceira, ItemConciliacao,
  Lancamento, Recorrencia,
} from "@/lib/financeiro/types";

import { ANCHOR_NOW, daysAhead } from "./anchor";

// ============================== Notificações ==============================

export type NotifCategoria = "proposta" | "financeiro" | "crm" | "tarefa" | "sistema" | "mensagem";
export type NotifNivel = "info" | "success" | "warning" | "critical";

export type Notificacao = {
  id: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  categoria: NotifCategoria;
  nivel: NotifNivel;
  lida: boolean;
  link?: string;
};

// ============================== State shape ==============================

export type DBState = {
  // Operacional
  usuarios: Usuario[];
  bancos: Banco[];
  clientes: Cliente[];
  simulacoes: Simulacao[];
  propostas: Proposta[];
  demandas: Demanda[];
  tarefas: Tarefa[];
  // Financeiro
  categorias: Categoria[];
  centrosCusto: CentroCusto[];
  contas: ContaFinanceira[];
  lancamentos: Lancamento[]; // receber + pagar unificados
  comissoes: Comissao[];
  recorrencias: Recorrencia[];
  conciliacao: ItemConciliacao[];
  // Cross-cutting
  notificacoes: Notificacao[];
};

function buildSeed(): DBState {
  return {
    usuarios: [...seedUsuarios],
    bancos: [...seedBancos],
    clientes: [...seedClientes],
    simulacoes: [...seedSimulacoes],
    propostas: [...seedPropostas],
    demandas: [...seedDemandas],
    tarefas: [...seedTarefas],
    categorias: [...seedCategorias],
    centrosCusto: [...seedCentros],
    contas: [...seedContas],
    lancamentos: [...seedReceber, ...seedPagar],
    comissoes: [...seedComissoes],
    recorrencias: [...seedRecorrencias],
    conciliacao: [...seedConciliacao],
    notificacoes: buildSeedNotificacoes(),
  };
}

function buildSeedNotificacoes(): Notificacao[] {
  const base: Notificacao[] = [
    {
      id: "seed-n1",
      titulo: "Proposta aprovada",
      descricao: "Proposta P-002005 — Maria Oliveira aprovada pelo Itaú.",
      criadoEm: daysAhead(-0.05),
      categoria: "proposta",
      nivel: "success",
      lida: false,
    },
    {
      id: "seed-n2",
      titulo: "Documento pendente",
      descricao: "Comprovante de renda de João da Silva expira em 2 dias.",
      criadoEm: daysAhead(-0.5),
      categoria: "tarefa",
      nivel: "warning",
      lida: false,
    },
    {
      id: "seed-n3",
      titulo: "Comissão liberada",
      descricao: "R$ 4.320,00 referente à proposta P-002003.",
      criadoEm: daysAhead(-1),
      categoria: "financeiro",
      nivel: "success",
      lida: false,
    },
    {
      id: "seed-n4",
      titulo: "Nova mensagem no chat",
      descricao: "Santander respondeu na proposta P-002007.",
      criadoEm: daysAhead(-2),
      categoria: "mensagem",
      nivel: "info",
      lida: true,
    },
  ];
  return base;
}

// ============================== Store ==============================

type DBActions = {
  /** Atualiza qualquer slice via patch parcial */
  patch: (patch: Partial<DBState>) => void;
  /** Substitui o estado completo (usado por reset/reseed) */
  replace: (next: DBState) => void;
  /** Reseta para o seed inicial */
  reset: () => void;
  /** Zera tudo (sem seed) */
  clear: () => void;
};

export const useDB = create<DBState & DBActions>()(
  persist(
    (set) => ({
      ...buildSeed(),
      patch: (patch) => set(patch as DBState),
      replace: (next) => set(next),
      reset: () => set(buildSeed()),
      clear: () =>
        set({
          ...buildSeed(),
          propostas: [],
          simulacoes: [],
          demandas: [],
          tarefas: [],
          lancamentos: [],
          comissoes: [],
          conciliacao: [],
          notificacoes: [],
        }),
    }),
    {
      name: "gestcred.db.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // evita mismatch SSR — DataHydrationGate dispara após mount
      version: 1,
      partialize: (s) => {
        // Persistimos apenas dados mutáveis pelo usuário; entidades-config recarregam do seed.
        const { patch, replace, reset, clear, ...rest } = s;
        return rest;
      },
    },
  ),
);

// ============================== Snapshots não-reativos ==============================
// Para consumidores que precisam ler "uma vez" fora de componentes React.
export const dbSnapshot = () => useDB.getState();

// ============================== Lookups ==============================
export const findUsuario = (id?: string) => useDB.getState().usuarios.find((u) => u.id === id);
export const findCliente = (id?: string) => useDB.getState().clientes.find((c) => c.id === id);
export const findBanco = (id?: string) => useDB.getState().bancos.find((b) => b.id === id);
export const findCategoria = (id?: string) => useDB.getState().categorias.find((c) => c.id === id);
export const findConta = (id?: string) => useDB.getState().contas.find((c) => c.id === id);

// ============================== Helpers ==============================
export const newId = (prefix: string) => `${prefix}-${nanoid(8)}`;
export const isoNow = () => new Date(ANCHOR_NOW).toISOString();
