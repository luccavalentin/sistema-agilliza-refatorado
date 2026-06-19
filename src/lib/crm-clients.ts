// Base mock de clientes vinculados ao CRM.
// Em produção, esta consulta deve ir ao backend (Supabase) e validar
// CPF do titular + data de nascimento como senha do portal do cliente.

export type CrmClient = {
  cpf: string; // apenas dígitos
  nome: string;
  nascimento: string; // formato YYYY-MM-DD
};

export const crmClients: CrmClient[] = [
  { cpf: "12345678900", nome: "João da Silva", nascimento: "1985-04-12" },
  { cpf: "98765432100", nome: "Maria Oliveira", nascimento: "1990-09-23" },
  { cpf: "11122233344", nome: "Carlos Pereira", nascimento: "1978-12-01" },
];

export function onlyDigits(v: string): string {
  return v.replace(/\D+/g, "");
}

export function formatCpf(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function isValidCpfFormat(v: string): boolean {
  return onlyDigits(v).length === 11;
}

export function findCrmClientByLogin(
  cpf: string,
  nascimento: string,
): CrmClient | null {
  const cpfDigits = onlyDigits(cpf);
  const match = crmClients.find(
    (c) => c.cpf === cpfDigits && c.nascimento === nascimento,
  );
  return match ?? null;
}
