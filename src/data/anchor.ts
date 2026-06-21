// Data-âncora determinística usada por TODO o seed de dados.
// Crítico: usar Date.now() no escopo de módulo causa mismatch de hidratação
// entre SSR e cliente. Aqui fixamos a "hoje" do sistema demo.
export const ANCHOR_NOW = new Date("2026-06-21T12:00:00.000Z").getTime();
export const DAY_MS = 86400000;

export const daysAgo = (n: number) => new Date(ANCHOR_NOW - n * DAY_MS).toISOString();
export const daysAhead = (n: number) => new Date(ANCHOR_NOW + n * DAY_MS).toISOString();
