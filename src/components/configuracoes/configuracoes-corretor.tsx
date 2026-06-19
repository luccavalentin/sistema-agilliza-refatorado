import {
  User,
  Link2,
  Users,
  Workflow,
  RefreshCw,
  Wallet,
  FileText,
  Bell,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { ConfigShell, type ConfigSection } from "./config-primitives";

const sections: ConfigSection[] = [
  {
    id: "minha-conta",
    label: "Minha Conta",
    icon: User,
    description: "Seus dados pessoais, segurança e tela inicial.",
    groups: [
      {
        title: "Identificação",
        fields: [
          { kind: "text", label: "Nome completo", defaultValue: "Juliana Pires" },
          { kind: "text", label: "E-mail", type: "email", defaultValue: "juliana@imobhorizonte.com" },
          { kind: "mask", label: "Telefone", mask: "phone", defaultValue: "11988881234" },
          { kind: "text", label: "Foto de perfil (URL)", placeholder: "https://…" },
          { kind: "select", label: "Página inicial padrão", options: ["Painel", "CRM", "Operacional", "Financeiro"] },
        ],
      },
      {
        title: "Segurança",
        fields: [
          { kind: "text", label: "Nova senha", type: "password", placeholder: "••••••••" },
          { kind: "text", label: "Confirmar senha", type: "password", placeholder: "••••••••" },
          {
            kind: "list",
            label: "Sessões ativas",
            items: [
              { primary: "Chrome — Android", secondary: "Em uso agora", right: "Atual" },
              { primary: "Edge — Notebook", secondary: "Há 1 dia", right: "Encerrar" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "vinculos",
    label: "Meus Vínculos",
    icon: Link2,
    description: "Vínculos recebidos do correspondente e imobiliária. Somente leitura.",
    groups: [
      {
        title: "Ecossistema",
        fields: [
          { kind: "info", label: "Correspondente", value: "Correspondente Horizonte", tone: "brand" },
          { kind: "info", label: "Imobiliária", value: "Imob. Horizonte", tone: "default" },
          { kind: "info", label: "Status", value: "Ativo", tone: "success" },
        ],
      },
      {
        title: "Carteira",
        fields: [
          {
            kind: "list",
            label: "Clientes vinculados",
            items: [
              { primary: "João da Silva", secondary: "CPF 111.***.***-22", right: "Em proposta" },
              { primary: "Maria Oliveira", secondary: "CPF 222.***.***-33", right: "Simulação" },
              { primary: "Carlos Pereira", secondary: "CPF 333.***.***-44", right: "Aprovado" },
            ],
          },
          {
            kind: "list",
            label: "Propostas vinculadas",
            items: [
              { primary: "PROP-1042 · João da Silva", secondary: "Caixa · Financiamento", right: "Backoffice" },
              { primary: "PROP-1051 · Maria Oliveira", secondary: "Itaú · Financiamento", right: "Simulação" },
            ],
          },
        ],
      },
      {
        title: "Permissões recebidas",
        fields: [
          { kind: "chips", label: "Permissões", options: ["Visualizar clientes", "Criar cliente", "Editar cliente", "Criar simulação", "Criar proposta", "Atualizar proposta", "Ver financeiro próprio", "Ver comissões"], defaultValues: ["Visualizar clientes", "Criar cliente", "Editar cliente", "Criar simulação", "Criar proposta", "Atualizar proposta", "Ver financeiro próprio", "Ver comissões"] },
        ],
      },
    ],
  },
  {
    id: "crm",
    label: "Preferências do CRM",
    icon: Users,
    description: "Como você prefere visualizar e cadastrar seus clientes.",
    groups: [
      {
        fields: [
          { kind: "select", label: "Visualização padrão", options: ["Lista", "Cards", "Kanban"], defaultValue: "Lista" },
          { kind: "select", label: "Origem padrão do cliente", options: ["Indicação", "Imobiliária", "Site", "WhatsApp"] },
          { kind: "chips", label: "Campos favoritos na lista", options: ["Nome", "CPF/CNPJ", "Telefone", "E-mail", "Status", "Origem", "Última interação"], defaultValues: ["Nome", "Telefone", "Status", "Última interação"] },
          { kind: "chips", label: "Filtros salvos", options: ["Meus leads", "Aguardando contato", "Em simulação", "Em proposta", "Aprovados"], defaultValues: ["Meus leads", "Em simulação", "Em proposta"] },
          { kind: "toggle", label: "Alerta de cadastro incompleto", defaultValue: true },
          { kind: "chips", label: "Checklist favorito", options: ["Documentos básicos", "Renda", "Imóvel", "Vendedor"], defaultValues: ["Documentos básicos", "Renda"] },
        ],
      },
    ],
  },
  {
    id: "operacional",
    label: "Preferências Operacionais",
    icon: Workflow,
    description: "Bancos, prazos, produtos e tabelas favoritas para simulações e propostas.",
    groups: [
      {
        title: "Favoritos",
        fields: [
          { kind: "chips", label: "Bancos favoritos", options: ["Caixa", "Itaú", "Bradesco", "Santander", "Banco do Brasil", "Inter"], defaultValues: ["Caixa", "Itaú", "Bradesco"] },
          { kind: "chips", label: "Prazos favoritos (meses)", options: ["120", "180", "240", "300", "360"], defaultValues: ["240", "360"] },
          { kind: "select", label: "Produto padrão", options: ["Financiamento Imobiliário", "Home Equity"], defaultValue: "Financiamento Imobiliário" },
          { kind: "chips", label: "Tabelas favoritas", options: ["SAC", "PRICE"], defaultValues: ["SAC"] },
        ],
      },
      {
        title: "Visualização",
        fields: [
          { kind: "select", label: "Visualização padrão de simulações", options: ["Lista", "Cards"], defaultValue: "Lista" },
          { kind: "select", label: "Visualização padrão de propostas", options: ["Lista", "Kanban"], defaultValue: "Kanban" },
          { kind: "chips", label: "Filtros salvos", options: ["Minhas em andamento", "Aguardando cliente", "Aguardando banco", "Aprovadas"], defaultValues: ["Minhas em andamento", "Aguardando cliente"] },
        ],
      },
    ],
  },
  {
    id: "atualizacao",
    label: "Atualização de Propostas",
    icon: RefreshCw,
    description: "Cadência e modelos de comunicação que você usa para manter o cliente atualizado.",
    groups: [
      {
        title: "SLA e cadência",
        fields: [
          { kind: "select", label: "SLA de atualização ao cliente", options: ["A cada 24h", "A cada 48h", "A cada 3 dias", "Semanal"], defaultValue: "A cada 48h" },
          { kind: "select", label: "Frequência de atualização padrão", options: ["Diária", "Em dias úteis", "Semanal"], defaultValue: "Em dias úteis" },
          { kind: "toggle", label: "Lembrete de follow-up", defaultValue: true },
          { kind: "toggle", label: "Notificar cliente ao atualizar proposta", defaultValue: true },
          { kind: "toggle", label: "Separar observação interna e atualização externa", defaultValue: true },
        ],
      },
      {
        title: "Modelos de mensagem",
        fields: [
          { kind: "textarea", label: "Mensagem padrão (atualização)", defaultValue: "Olá {{cliente}}, sua proposta avançou para {{etapa}}. Próximo passo: {{proximo}}." },
          { kind: "textarea", label: "Mensagem padrão (pendência)", defaultValue: "Olá {{cliente}}, precisamos do(a) {{documento}} para seguir." },
          { kind: "textarea", label: "Mensagem padrão (aprovação)", defaultValue: "Ótima notícia! Sua proposta foi aprovada pelo {{banco}}." },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    label: "Preferências Financeiras",
    icon: Wallet,
    description: "Visualizações padrão e alertas das suas comissões, recebíveis e despesas.",
    groups: [
      {
        fields: [
          { kind: "select", label: "Visualização padrão dos recebíveis", options: ["Lista", "Cards", "Calendário"], defaultValue: "Lista" },
          { kind: "select", label: "Visualização padrão das comissões", options: ["Lista", "Cards"], defaultValue: "Lista" },
          { kind: "toggle", label: "Alertas de comissão liberada", defaultValue: true },
          { kind: "toggle", label: "Alertas de comissão paga", defaultValue: true },
          { kind: "toggle", label: "Alertas de despesas próximas do vencimento", defaultValue: true },
          { kind: "toggle", label: "Alertas de contas recorrentes", defaultValue: true },
          { kind: "chips", label: "Categorias pessoais", options: ["Combustível", "Marketing pessoal", "Brindes", "Assinaturas", "Cursos"], defaultValues: ["Combustível", "Marketing pessoal"] },
        ],
      },
    ],
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    description: "Checklists favoritos e modelos para solicitar documentos ao cliente.",
    groups: [
      {
        fields: [
          { kind: "chips", label: "Checklist favorito", options: ["RG/CNH", "Comprovante renda", "Comprovante residência", "Certidão estado civil", "IPTU", "Matrícula", "Certidão imóvel"], defaultValues: ["RG/CNH", "Comprovante renda", "Comprovante residência", "Matrícula"] },
          { kind: "chips", label: "Documentos mais usados", options: ["RG", "CNH", "Holerite", "IR", "Extrato bancário", "Contrato social"], defaultValues: ["RG", "CNH", "Holerite", "IR"] },
          { kind: "textarea", label: "Modelo de solicitação ao cliente", defaultValue: "Olá {{cliente}}, para seguir com sua proposta no {{banco}}, envie por aqui: {{lista_documentos}}." },
          { kind: "toggle", label: "Alerta de documento pendente", defaultValue: true },
          { kind: "toggle", label: "Alerta de documento reprovado", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "notificacoes",
    label: "Notificações",
    icon: Bell,
    description: "Eventos que você deseja receber.",
    groups: [
      {
        fields: [
          { kind: "chips", label: "Eventos ativos", options: ["Novo cliente vinculado", "Nova proposta", "Atualização de proposta", "Mensagem do cliente", "Mensagem do correspondente", "Documento enviado", "Documento pendente", "Demanda recebida", "SLA vencendo", "Comissão liberada", "Comissão paga"], defaultValues: ["Novo cliente vinculado", "Nova proposta", "Mensagem do cliente", "Documento pendente", "SLA vencendo", "Comissão paga"] },
          { kind: "text", label: "Horário inicial permitido", defaultValue: "08:00" },
          { kind: "text", label: "Horário final permitido", defaultValue: "20:00" },
        ],
      },
    ],
  },
  {
    id: "seguranca",
    label: "Segurança",
    icon: ShieldCheck,
    description: "Senha, 2FA, sessões e histórico de acesso.",
    groups: [
      {
        fields: [
          { kind: "text", label: "Nova senha", type: "password", placeholder: "••••••••" },
          { kind: "text", label: "Confirmar senha", type: "password", placeholder: "••••••••" },
          { kind: "toggle", label: "Autenticação em duas etapas", defaultValue: true },
          { kind: "toggle", label: "Logout automático ao fechar o navegador", defaultValue: false },
          {
            kind: "list",
            label: "Histórico de acesso recente",
            items: [
              { primary: "Hoje, 09:14", secondary: "Chrome · São Paulo, BR", right: "Sucesso" },
              { primary: "Ontem, 18:42", secondary: "Edge · São Paulo, BR", right: "Sucesso" },
              { primary: "10/06, 22:10", secondary: "Tentativa falha · IP desconhecido", right: "Bloqueado" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "preferencias",
    label: "Preferências Visuais",
    icon: Sliders,
    description: "Aparência, densidade e padrões da sua interface.",
    groups: [
      {
        fields: [
          { kind: "select", label: "Página inicial padrão", options: ["Painel", "CRM", "Operacional", "Financeiro"] },
          { kind: "select", label: "Sidebar padrão", options: ["Expandida", "Recolhida"] },
          { kind: "select", label: "Densidade da interface", options: ["Compacta", "Confortável", "Espaçosa"], defaultValue: "Confortável" },
          { kind: "chips", label: "Colunas favoritas (propostas)", options: ["Cliente", "Banco", "Produto", "Etapa", "SLA", "Responsável", "Valor"], defaultValues: ["Cliente", "Banco", "Etapa", "SLA", "Valor"] },
          { kind: "select", label: "Dashboard padrão", options: ["Pessoal", "Carteira", "Comissões"] },
        ],
      },
    ],
  },
];

export function ConfiguracoesCorretor() {
  return (
    <ConfigShell
      title="Configurações do Corretor"
      subtitle="Personalize suas preferências, vínculos, comunicação com o cliente e visualizações da sua operação."
      sections={sections}
    />
  );
}
