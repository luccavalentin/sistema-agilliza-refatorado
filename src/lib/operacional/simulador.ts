// Cálculo SAC / PRICE e geração de cenários para simulações.

import type { Cenario, Tabela } from "./types";

export type CalculoEntrada = {
  principal: number; // valor financiado / solicitado
  prazoMeses: number;
  taxaAaPercent: number; // taxa anual nominal em %
  tabela: Tabela;
};

export type CalculoResultado = {
  parcelaInicial: number;
  parcelaFinal: number;
  totalPago: number;
  totalJuros: number;
};

export function taxaMensalDeAnual(taxaAa: number): number {
  return Math.pow(1 + taxaAa / 100, 1 / 12) - 1;
}

export function calcularPrice(e: CalculoEntrada): CalculoResultado {
  const i = taxaMensalDeAnual(e.taxaAaPercent);
  const n = e.prazoMeses;
  const p = e.principal;
  const parcela = i === 0 ? p / n : (p * i) / (1 - Math.pow(1 + i, -n));
  const totalPago = parcela * n;
  return {
    parcelaInicial: parcela,
    parcelaFinal: parcela,
    totalPago,
    totalJuros: totalPago - p,
  };
}

export function calcularSac(e: CalculoEntrada): CalculoResultado {
  const i = taxaMensalDeAnual(e.taxaAaPercent);
  const n = e.prazoMeses;
  const p = e.principal;
  const amort = p / n;
  let saldo = p;
  let total = 0;
  let primeira = 0;
  let ultima = 0;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * i;
    const parcela = amort + juros;
    if (k === 1) primeira = parcela;
    if (k === n) ultima = parcela;
    total += parcela;
    saldo -= amort;
  }
  return {
    parcelaInicial: primeira,
    parcelaFinal: ultima,
    totalPago: total,
    totalJuros: total - p,
  };
}

export function calcular(e: CalculoEntrada): CalculoResultado {
  return e.tabela === "SAC" ? calcularSac(e) : calcularPrice(e);
}

// Gera cenários combinando bancos × prazos × tabelas.
export type GerarCenariosInput = {
  principal: number;
  bancos: { id: string; taxaAaPercent: number }[];
  prazos: number[];
  tabelas: Tabela[];
  comprometimentoRendaMaxPercent?: number; // p/ renda mínima sugerida
};

export function gerarCenarios(input: GerarCenariosInput): Cenario[] {
  const comprom = input.comprometimentoRendaMaxPercent ?? 30;
  const cenarios: Cenario[] = [];
  let idx = 0;
  for (const banco of input.bancos) {
    for (const prazo of input.prazos) {
      for (const tabela of input.tabelas) {
        const r = calcular({
          principal: input.principal,
          prazoMeses: prazo,
          taxaAaPercent: banco.taxaAaPercent,
          tabela,
        });
        cenarios.push({
          id: `cen-${Date.now()}-${idx++}`,
          bancoId: banco.id,
          prazoMeses: prazo,
          tabela,
          taxaAaPercent: banco.taxaAaPercent,
          parcelaInicial: r.parcelaInicial,
          parcelaFinal: r.parcelaFinal,
          totalPago: r.totalPago,
          totalJuros: r.totalJuros,
          cetPercent: banco.taxaAaPercent + 0.45, // estimativa
          rendaMinima: r.parcelaInicial / (comprom / 100),
        });
      }
    }
  }
  return cenarios;
}
