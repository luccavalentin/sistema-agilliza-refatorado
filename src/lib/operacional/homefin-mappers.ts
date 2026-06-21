/**
 * homefin-mappers.ts
 * Mapeamento entre os valores internos do Agilliza e os códigos da API HomeFin.
 * Fonte: MIGRATION_PROMPT.md — seção de tipagens da API.
 *
 * TODO: quando a integração real for feita, estes mappers serão usados
 *       pelas Edge Functions para montar o payload das chamadas HomeFin.
 */

// ========================== Tipo de imóvel ==========================
/** AP, CS, GA, TE, TC */
export type TipoImovelHomeFin = "AP" | "CS" | "GA" | "TE" | "TC";

export const TIPOS_IMOVEL_OPTIONS = [
  { value: "AP" as TipoImovelHomeFin, label: "Apartamento" },
  { value: "CS" as TipoImovelHomeFin, label: "Casa" },
  { value: "GA" as TipoImovelHomeFin, label: "Galpão / Industrial" },
  { value: "TE" as TipoImovelHomeFin, label: "Terreno" },
  { value: "TC" as TipoImovelHomeFin, label: "Terreno em Condomínio" },
] as const;

// ========================== Uso do imóvel ==========================
/** R = Residencial, C = Comercial */
export type UsoImovelHomeFin = "R" | "C";

export const USOS_IMOVEL_OPTIONS = [
  { value: "R" as UsoImovelHomeFin, label: "Residencial" },
  { value: "C" as UsoImovelHomeFin, label: "Comercial" },
] as const;

// ========================== Situação do imóvel ==========================
/** N = Novo, U = Usado */
export type SituacaoImovelHomeFin = "N" | "U";

export const SITUACOES_IMOVEL_OPTIONS = [
  { value: "N" as SituacaoImovelHomeFin, label: "Novo" },
  { value: "U" as SituacaoImovelHomeFin, label: "Usado" },
] as const;

// ========================== Estado civil ==========================
/** S, CA, UE, DI, VI */
export type EstadoCivilHomeFin = "S" | "CA" | "UE" | "DI" | "VI";

export const ESTADOS_CIVIS_OPTIONS = [
  { value: "S" as EstadoCivilHomeFin, label: "Solteiro(a)" },
  { value: "CA" as EstadoCivilHomeFin, label: "Casado(a)" },
  { value: "UE" as EstadoCivilHomeFin, label: "União estável" },
  { value: "DI" as EstadoCivilHomeFin, label: "Divorciado(a)" },
  { value: "VI" as EstadoCivilHomeFin, label: "Viúvo(a)" },
] as const;

// ========================== Regime de casamento ==========================
export type RegimeCasamentoHomeFin = "CP" | "CU" | "ST" | "PF";

export const REGIMES_CASAMENTO_OPTIONS = [
  { value: "CP" as RegimeCasamentoHomeFin, label: "Comunhão parcial de bens" },
  { value: "CU" as RegimeCasamentoHomeFin, label: "Comunhão universal de bens" },
  { value: "ST" as RegimeCasamentoHomeFin, label: "Separação total de bens" },
  { value: "PF" as RegimeCasamentoHomeFin, label: "Participação final nos aquestos" },
] as const;

// ========================== Tipo de renda ==========================
export type TipoRendaHomeFin = "F" | "I" | "FI";

export const TIPOS_RENDA_OPTIONS = [
  { value: "F" as TipoRendaHomeFin, label: "Formal (CLT / Servidor)" },
  { value: "I" as TipoRendaHomeFin, label: "Informal / Autônomo" },
  { value: "FI" as TipoRendaHomeFin, label: "Formal + Informal" },
] as const;

// ========================== Produto ==========================
/** FI = Financiamento Imobiliário, HE = Home Equity */
export type ProdutoHomeFin = "FI" | "HE";

export const mapProdutoToHomeFin = (produto: string): ProdutoHomeFin => {
  return produto === "Home Equity" ? "HE" : "FI";
};

// ========================== Sistema de amortização ==========================
export type SistemaAmortizacaoHomeFin = "SAC" | "PRICE";

// ========================== Campos do proponente para a API ==========================
export interface ProponenteHomeFin {
  tipoEstadoCivil: EstadoCivilHomeFin;
  regimeCasamento?: RegimeCasamentoHomeFin;
  tipoRenda: TipoRendaHomeFin;
  rendaBruta: number;
  usarFGTS: boolean;
  saldoFGTS?: number;
  possuiCompositor: boolean;
}

// ========================== Campos do imóvel para a API ==========================
export interface ImovelHomeFin {
  tipoImovel: TipoImovelHomeFin;
  usoImovel: UsoImovelHomeFin;
  situacaoImovel: SituacaoImovelHomeFin;
  valorImovel?: number;
  valorSolicitado?: number;
}

// ========================== Payload completo de simulação ==========================
export interface SimulacaoPayloadHomeFin {
  produto: ProdutoHomeFin;
  proponente: ProponenteHomeFin;
  imovel: ImovelHomeFin;
  prazoMeses: number;
  sistemaAmortizacao: SistemaAmortizacaoHomeFin;
  bancos: string[]; // siglas dos bancos a consultar
}

/**
 * Monta o payload para a Edge Function `homefin-simulacao`.
 * TODO: chamar via supabase.functions.invoke('homefin-simulacao', { body: payload })
 */
export function buildSimulacaoPayload(dados: {
  produto: string;
  tipoEstadoCivil: EstadoCivilHomeFin;
  regimeCasamento?: RegimeCasamentoHomeFin;
  tipoRenda: TipoRendaHomeFin;
  rendaBruta: number;
  usarFGTS: boolean;
  saldoFGTS?: number;
  possuiCompositor: boolean;
  tipoImovel: TipoImovelHomeFin;
  usoImovel: UsoImovelHomeFin;
  situacaoImovel: SituacaoImovelHomeFin;
  valorImovel?: number;
  valorSolicitado?: number;
  prazoMeses: number;
  sistemaAmortizacao: SistemaAmortizacaoHomeFin;
  bancos: string[];
}): SimulacaoPayloadHomeFin {
  return {
    produto: mapProdutoToHomeFin(dados.produto),
    proponente: {
      tipoEstadoCivil: dados.tipoEstadoCivil,
      regimeCasamento: dados.regimeCasamento,
      tipoRenda: dados.tipoRenda,
      rendaBruta: dados.rendaBruta,
      usarFGTS: dados.usarFGTS,
      saldoFGTS: dados.saldoFGTS,
      possuiCompositor: dados.possuiCompositor,
    },
    imovel: {
      tipoImovel: dados.tipoImovel,
      usoImovel: dados.usoImovel,
      situacaoImovel: dados.situacaoImovel,
      valorImovel: dados.valorImovel,
      valorSolicitado: dados.valorSolicitado,
    },
    prazoMeses: dados.prazoMeses,
    sistemaAmortizacao: dados.sistemaAmortizacao,
    bancos: dados.bancos,
  };
}
