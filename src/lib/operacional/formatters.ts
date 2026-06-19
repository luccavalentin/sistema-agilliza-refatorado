// Máscaras e formatadores para o módulo Operacional.
// Foco em formatação visual + helpers; validação fica em validators.ts.

export const onlyDigits = (v: string) => v.replace(/\D+/g, "");

export const formatCpf = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
};

export const formatCnpj = (v: string) => {
  const d = onlyDigits(v).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const formatCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
};

export const formatTelefone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatBRL = (n: number) => brl.format(Number.isFinite(n) ? n : 0);

export const formatPercent = (n: number, digits = 2) =>
  `${(Number.isFinite(n) ? n : 0).toFixed(digits).replace(".", ",")}%`;

export const formatPrazoMeses = (n: number) =>
  `${n} ${n === 1 ? "mês" : "meses"}`;

export const formatData = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

export const formatDataHora = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export const parseBRLToNumber = (v: string): number => {
  const digits = v.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
};
