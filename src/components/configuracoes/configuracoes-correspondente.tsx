import {
  User,
  Users,
  UserCog,
  Building2,
  Briefcase,
  ContactRound,
  Workflow,
  Kanban,
  Clock,
  Wallet,
  FileText,
  Banknote,
  Globe,
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
    description: "Dados do administrador do correspondente, segurança da conta e preferências pessoais.",
    groups: [
      {
        title: "Identificação",
        fields: [
          { kind: "text", label: "Nome completo", defaultValue: "Marcos Andrade" },
          { kind: "text", label: "Cargo/função", defaultValue: "Diretor Operacional" },
          { kind: "text", label: "E-mail", type: "email", defaultValue: "marcos@correspondente.com.br" },
          { kind: "mask", label: "Telefone", mask: "phone", defaultValue: "11999990000" },
          { kind: "text", label: "Foto de perfil (URL)", placeholder: "https://…" },
          { kind: "select", label: "Tela inicial padrão", options: ["Painel de Monitoramento", "CRM", "Operacional", "Financeiro"] },
        ],
      },
      {
        title: "Segurança da conta",
        fields: [
          { kind: "text", label: "Nova senha", type: "password", placeholder: "••••••••" },
          { kind: "text", label: "Confirmar senha", type: "password", placeholder: "••••••••" },
          {
            kind: "list",
            label: "Sessões ativas",
            items: [
              { primary: "Chrome — MacOS", secondary: "São Paulo · agora", right: "Atual" },
              { primary: "Safari — iPhone", secondary: "São Paulo · há 2h", right: "Encerrar" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "usuarios",
    label: "Usuários e Permissões",
    icon: UserCog,
    description: "Cadastro de usuários internos, perfis de acesso e permissões por módulo e ação.",
    groups: [
      {
        title: "Perfis disponíveis",
        fields: [
          {
            kind: "chips",
            label: "Perfis habilitados",
            options: ["Administrador", "Analista Administrativo", "Analista Comercial", "Backoffice", "Financeiro", "Comercial", "Operacional"],
            defaultValues: ["Administrador", "Analista Administrativo", "Backoffice", "Financeiro", "Operacional"],
          },
        ],
      },
      {
        title: "Usuários ativos",
        fields: [
          {
            kind: "list",
            label: "Equipe",
            items: [
              { primary: "Ana Beatriz Lima", secondary: "Analista Administrativo · ana@…", right: "Ativo" },
              { primary: "Carlos Mendes", secondary: "Backoffice · carlos@…", right: "Ativo" },
              { primary: "Patrícia Souza", secondary: "Financeiro · patricia@…", right: "Ativo" },
              { primary: "Rafael Torres", secondary: "Analista Comercial · rafael@…", right: "Inativo" },
            ],
          },
        ],
      },
      {
        title: "Permissões por módulo",
        hint: "Defina o que cada perfil pode acessar dentro de cada módulo do sistema.",
        fields: [
          { kind: "chips", label: "Módulos habilitados", options: ["Visão Geral", "CRM", "Operacional", "Simulações", "Propostas", "Demandas & SLA", "Minhas Tarefas", "Financeiro", "Relatórios", "Configurações", "Documentos"], defaultValues: ["Visão Geral", "CRM", "Operacional", "Simulações", "Propostas", "Financeiro", "Relatórios"] },
          { kind: "chips", label: "Ações permitidas", options: ["Visualizar", "Criar", "Editar", "Excluir", "Transferir", "Baixar", "Compartilhar", "Exportar", "Ver dados sensíveis", "Ver financeiro", "Gerenciar permissões"], defaultValues: ["Visualizar", "Criar", "Editar"] },
        ],
      },
    ],
  },
  {
    id: "corretores",
    label: "Corretores",
    icon: ContactRound,
    description: "Corretores vinculados ao ecossistema, carteiras, comissões e status.",
    groups: [
      {
        title: "Cadastro padrão",
        fields: [
          { kind: "select", label: "Comissão padrão (%)", options: ["0,5%", "1,0%", "1,5%", "2,0%"], defaultValue: "1,0%" },
          { kind: "toggle", label: "Exigir vínculo com imobiliária", description: "Bloqueia o cadastro de corretores sem imobiliária associada.", defaultValue: false },
          { kind: "toggle", label: "Permitir transferência de carteira", defaultValue: true },
          { kind: "toggle", label: "Registrar histórico de transferência", defaultValue: true },
        ],
      },
      {
        title: "Corretores ativos",
        fields: [
          {
            kind: "list",
            label: "Lista",
            items: [
              { primary: "Juliana Pires", secondary: "CPF 123.***.***-09 · Imob. Horizonte", right: "Ativo" },
              { primary: "Marcelo Tavares", secondary: "CPF 987.***.***-22 · Imob. Atlântica", right: "Ativo" },
              { primary: "Renata Aguiar", secondary: "CPF 456.***.***-71 · Sem imobiliária", right: "Inativo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "imobiliarias",
    label: "Imobiliárias e Parceiros",
    icon: Building2,
    description: "Imobiliárias, construtoras e parceiros comerciais vinculados ao correspondente.",
    groups: [
      {
        fields: [
          { kind: "text", label: "Razão social", placeholder: "Imobiliária Exemplo Ltda." },
          { kind: "mask", label: "CNPJ", mask: "cnpj", placeholder: "00.000.000/0001-00", validate: "cnpj" },
          { kind: "text", label: "Responsável", placeholder: "Nome do responsável" },
          { kind: "text", label: "E-mail", type: "email" },
          { kind: "mask", label: "Telefone", mask: "phone", placeholder: "(11) 99999-9999" },
          { kind: "mask", label: "CEP", mask: "cep", placeholder: "00000-000" },
          { kind: "text", label: "Endereço" },
          { kind: "textarea", label: "Observações" },
        ],
      },
      {
        title: "Parceiros cadastrados",
        fields: [
          {
            kind: "list",
            label: "Imobiliárias",
            items: [
              { primary: "Imob. Horizonte", secondary: "12 corretores · 88 clientes", right: "Ativo" },
              { primary: "Imob. Atlântica", secondary: "7 corretores · 41 clientes", right: "Ativo" },
              { primary: "Construtora Verde", secondary: "Parceiro · 3 empreendimentos", right: "Ativo" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "equipe-interna",
    label: "Equipe Interna",
    icon: Briefcase,
    description: "Responsáveis internos por etapas do CRM e operacional, regras de vínculo e transferência.",
    groups: [
      {
        title: "Grupos da equipe",
        fields: [
          { kind: "chips", label: "Grupos ativos", options: ["Comercial", "Analista Administrativo", "Analista Comercial", "Backoffice", "Financeiro", "Operacional"], defaultValues: ["Comercial", "Analista Administrativo", "Backoffice", "Financeiro", "Operacional"] },
        ],
      },
      {
        title: "Responsáveis padrão",
        fields: [
          { kind: "select", label: "Responsável padrão (Comercial)", options: ["Patrícia Souza", "Carlos Mendes", "Ana Beatriz Lima"] },
          { kind: "select", label: "Responsável padrão (Backoffice)", options: ["Carlos Mendes", "Rafael Torres"] },
          { kind: "select", label: "Responsável padrão (Financeiro)", options: ["Patrícia Souza"] },
          { kind: "select", label: "Equipe padrão", options: ["Backoffice", "Comercial", "Operacional"] },
        ],
      },
      {
        title: "Regras de vínculo e transferência",
        fields: [
          { kind: "toggle", label: "Obrigar responsável ao criar cliente", defaultValue: true },
          { kind: "toggle", label: "Obrigar responsável ao criar proposta", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo ao transferir", defaultValue: true },
          { kind: "toggle", label: "Registrar histórico de transferência", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "crm",
    label: "CRM de Clientes",
    icon: Users,
    description: "Regras de cadastro, validações, vínculos e checklist do CRM de clientes.",
    groups: [
      {
        title: "Validações de cadastro",
        fields: [
          { kind: "toggle", label: "Cliente único por CPF/CNPJ", defaultValue: true },
          { kind: "toggle", label: "Validação obrigatória de CPF/CNPJ", defaultValue: true },
          { kind: "toggle", label: "Validação de telefone", defaultValue: true },
          { kind: "toggle", label: "Validação de e-mail", defaultValue: true },
          { kind: "toggle", label: "Validação de CEP", defaultValue: true },
          { kind: "toggle", label: "Preencher endereço automaticamente pelo CEP", defaultValue: true },
        ],
      },
      {
        title: "Campos obrigatórios por etapa",
        fields: [
          { kind: "chips", label: "Cadastro básico", options: ["Nome", "CPF/CNPJ", "Telefone", "E-mail", "Data nascimento", "Origem"], defaultValues: ["Nome", "CPF/CNPJ", "Telefone"] },
          { kind: "chips", label: "Simulação", options: ["Renda", "Profissão", "Estado civil", "Cônjuge", "FGTS"], defaultValues: ["Renda", "Profissão"] },
          { kind: "chips", label: "Proposta", options: ["Endereço completo", "RG/CNH", "Comprovante renda", "Imóvel"], defaultValues: ["Endereço completo", "Comprovante renda", "Imóvel"] },
          { kind: "chips", label: "Aprovação", options: ["Composição renda", "Cônjuge completo", "Vendedor completo", "Documentos imóvel"], defaultValues: ["Composição renda", "Documentos imóvel"] },
        ],
      },
      {
        title: "Vínculos e responsáveis",
        fields: [
          { kind: "toggle", label: "Permitir múltiplos corretores por cliente", defaultValue: false },
          { kind: "toggle", label: "Permitir múltiplas imobiliárias por cliente", defaultValue: false },
          { kind: "toggle", label: "Permitir múltiplos analistas por cliente", defaultValue: true },
          { kind: "toggle", label: "Marcar criador do cliente automaticamente", defaultValue: true },
        ],
      },
      {
        title: "Origens e status",
        fields: [
          { kind: "chips", label: "Origens disponíveis", options: ["Indicação", "Imobiliária", "Site", "Instagram", "WhatsApp", "Evento", "Outro"], defaultValues: ["Indicação", "Imobiliária", "Site", "WhatsApp"] },
          { kind: "chips", label: "Status do cliente", options: ["Lead", "Qualificado", "Em simulação", "Em proposta", "Aprovado", "Inativo"], defaultValues: ["Lead", "Qualificado", "Em simulação", "Em proposta", "Aprovado"] },
        ],
      },
    ],
  },
  {
    id: "operacional",
    label: "Operacional",
    icon: Workflow,
    description: "Etapas operacionais, regras de simulação, transferência e cenários.",
    groups: [
      {
        title: "Etapas",
        fields: [
          {
            kind: "list",
            label: "Etapas operacionais",
            items: [
              { primary: "1. Cadastro básico", right: "Ativa" },
              { primary: "2. Simulação", right: "Ativa" },
              { primary: "3. Aprovação", right: "Ativa" },
              { primary: "4. Cadastro completo", right: "Ativa" },
              { primary: "5. Documentação", right: "Ativa" },
              { primary: "6. Formulários", right: "Ativa" },
              { primary: "7. Enviado ao banco", right: "Ativa" },
              { primary: "8. Vistoria", right: "Ativa" },
              { primary: "9. Jurídico / Emissão", right: "Ativa" },
              { primary: "10. Contrato emitido", right: "Ativa" },
            ],
          },
        ],
      },
      {
        title: "Regras de simulação",
        fields: [
          { kind: "toggle", label: "Permitir simulação rápida sem cliente", defaultValue: true },
          { kind: "toggle", label: "Permitir simulação vinculada a cliente", defaultValue: true },
          { kind: "toggle", label: "Permitir simulação para Financiamento", defaultValue: true },
          { kind: "toggle", label: "Permitir simulação para Home Equity", defaultValue: true },
          { kind: "toggle", label: "Permitir simulação em todos os bancos", defaultValue: true },
          { kind: "toggle", label: "Permitir SAC e PRICE simultaneamente", defaultValue: true },
          { kind: "toggle", label: "Permitir múltiplos prazos", defaultValue: true },
          { kind: "text", label: "Limite máximo de cenários por simulação", type: "number", defaultValue: "20" },
          { kind: "toggle", label: "Confirmar antes de processar muitos cenários", defaultValue: true },
        ],
      },
      {
        title: "Transferências",
        fields: [
          { kind: "toggle", label: "Permitir transferência de simulação", defaultValue: true },
          { kind: "toggle", label: "Permitir transferência de proposta", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo ao transferir", defaultValue: true },
          { kind: "toggle", label: "Registrar histórico de transferência", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "propostas",
    label: "Propostas e Backlog",
    icon: Kanban,
    description: "Configuração das etapas do backlog, SLAs, checklist e exibição do card.",
    groups: [
      {
        title: "SLAs e checklist",
        fields: [
          { kind: "text", label: "SLA padrão por etapa (dias)", type: "number", defaultValue: "3" },
          { kind: "toggle", label: "Exibir checklist lateral", defaultValue: true },
          { kind: "toggle", label: "Permitir mover card entre etapas", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo ao reprovar", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo ao cancelar", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo ao transferir", defaultValue: true },
        ],
      },
      {
        title: "Exibição no card",
        fields: [
          { kind: "toggle", label: "Mostrar responsável", defaultValue: true },
          { kind: "toggle", label: "Mostrar corretor", defaultValue: true },
          { kind: "toggle", label: "Mostrar pendências", defaultValue: true },
          { kind: "toggle", label: "Mostrar indicador de chat", defaultValue: true },
          { kind: "toggle", label: "Mostrar indicador de documentos", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "demandas",
    label: "Demandas e SLA",
    icon: Clock,
    description: "Tipos de demanda, prioridades, SLAs, etapas do kanban e comportamento do chat.",
    groups: [
      {
        title: "Tipos e prioridades",
        fields: [
          { kind: "chips", label: "Tipos de demanda", options: ["Cadastro de cliente", "Correção de cadastro", "Cadastro de vendedor", "Cadastro de imóvel", "Revisão de documentos", "Pendência documental", "Solicitação de simulação", "Revisão de simulação", "Envio para proposta", "Atualização de proposta", "Análise de crédito", "Backoffice", "Comercial", "Financeiro", "Suporte ao corretor", "Suporte ao cliente", "Formulários", "Vistoria", "Contrato", "Outro"], defaultValues: ["Cadastro de cliente", "Pendência documental", "Análise de crédito", "Suporte ao corretor", "Contrato"] },
          { kind: "chips", label: "Prioridades", options: ["Baixa", "Normal", "Alta", "Crítica"], defaultValues: ["Baixa", "Normal", "Alta", "Crítica"] },
        ],
      },
      {
        title: "SLA",
        fields: [
          { kind: "text", label: "SLA Baixa (h)", type: "number", defaultValue: "48" },
          { kind: "text", label: "SLA Normal (h)", type: "number", defaultValue: "24" },
          { kind: "text", label: "SLA Alta (h)", type: "number", defaultValue: "8" },
          { kind: "text", label: "SLA Crítica (h)", type: "number", defaultValue: "2" },
          { kind: "toggle", label: "Resetar SLA ao mudar etapa", defaultValue: false },
          { kind: "toggle", label: "Registrar histórico de SLA", defaultValue: true },
        ],
      },
      {
        title: "Chat e participantes",
        fields: [
          { kind: "toggle", label: "Permitir demanda compartilhada", defaultValue: true },
          { kind: "toggle", label: "Permitir adicionar participantes", defaultValue: true },
          { kind: "toggle", label: "Permitir chat na demanda", defaultValue: true },
          { kind: "toggle", label: "Notificar nova mensagem", defaultValue: true },
          { kind: "toggle", label: "Piscar card com mensagem não lida", defaultValue: true },
          { kind: "toggle", label: "Permitir transferência de demanda", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo ao transferir demanda", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    label: "Gestão Financeira",
    icon: Wallet,
    description: "Categorias, centros de custo, contas, formas de pagamento, recorrências e comissões.",
    groups: [
      {
        title: "Estrutura financeira",
        fields: [
          { kind: "chips", label: "Categorias", options: ["Comissões", "Serviços", "Marketing", "Folha", "Infraestrutura", "Impostos", "Receita operacional", "Outros"], defaultValues: ["Comissões", "Serviços", "Folha", "Receita operacional"] },
          { kind: "chips", label: "Centros de custo", options: ["Matriz", "Comercial", "Backoffice", "Financeiro", "TI"], defaultValues: ["Matriz", "Comercial", "Backoffice"] },
          { kind: "chips", label: "Contas financeiras", options: ["Conta Bradesco PJ", "Conta Itaú PJ", "Caixa Interno", "Cartão Corporativo"], defaultValues: ["Conta Bradesco PJ", "Caixa Interno"] },
          { kind: "chips", label: "Formas de pagamento", options: ["PIX", "Boleto", "TED", "Cartão Crédito", "Cartão Débito", "Dinheiro"], defaultValues: ["PIX", "Boleto", "TED"] },
          { kind: "chips", label: "Formas de recebimento", options: ["PIX", "Boleto", "TED", "Cartão Crédito", "Cartão Débito"], defaultValues: ["PIX", "Boleto", "TED"] },
        ],
      },
      {
        title: "Lançamentos",
        fields: [
          { kind: "chips", label: "Tipos de lançamento permitidos", options: ["Esporádico", "Recorrente", "Parcelado"], defaultValues: ["Esporádico", "Recorrente", "Parcelado"] },
          { kind: "chips", label: "Frequências de recorrência", options: ["Mensal", "Bimestral", "Trimestral", "Semestral", "Anual"], defaultValues: ["Mensal", "Trimestral", "Anual"] },
          { kind: "text", label: "Quantidade padrão de meses a gerar", type: "number", defaultValue: "12" },
          { kind: "toggle", label: "Permitir pagamento parcial", defaultValue: true },
          { kind: "toggle", label: "Permitir recebimento parcial", defaultValue: true },
          { kind: "toggle", label: "Exigir comprovante", defaultValue: true },
          { kind: "toggle", label: "Permitir estorno", defaultValue: true },
          { kind: "toggle", label: "Permitir conciliação", defaultValue: true },
        ],
      },
      {
        title: "Comissões",
        fields: [
          { kind: "toggle", label: "Comissão por corretor", defaultValue: true },
          { kind: "toggle", label: "Comissão por imobiliária", defaultValue: true },
          { kind: "toggle", label: "Comissão por produto", defaultValue: true },
          { kind: "select", label: "Liberação padrão da comissão", options: ["Na assinatura do contrato", "No pagamento ao correspondente", "Em data fixa"] },
        ],
      },
    ],
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: FileText,
    description: "Checklists documentais por produto, etapa e perfil. Regras de aprovação e reprovação.",
    groups: [
      {
        title: "Categorias documentais",
        fields: [
          { kind: "chips", label: "Categorias ativas", options: ["Cliente", "Cônjuge", "Composição de renda", "Vendedor", "Imóvel", "Home Equity", "Adicionais"], defaultValues: ["Cliente", "Cônjuge", "Vendedor", "Imóvel", "Home Equity"] },
        ],
      },
      {
        title: "Regras",
        fields: [
          { kind: "toggle", label: "Documento obrigatório por produto", defaultValue: true },
          { kind: "toggle", label: "Documento obrigatório por etapa", defaultValue: true },
          { kind: "toggle", label: "Documento obrigatório por perfil", defaultValue: false },
          { kind: "toggle", label: "Exigir aprovação de documento", defaultValue: true },
          { kind: "toggle", label: "Permitir reprovar documento", defaultValue: true },
          { kind: "toggle", label: "Exigir motivo na reprovação", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "bancos",
    label: "Bancos e Produtos",
    icon: Banknote,
    description: "Bancos, produtos, prazos, tabelas e regras por produto (Financiamento e Home Equity).",
    groups: [
      {
        title: "Bancos parceiros",
        fields: [
          {
            kind: "list",
            label: "Bancos",
            items: [
              { primary: "Caixa Econômica Federal", secondary: "SAC, PRICE · Financiamento + Home Equity", right: "Ativo" },
              { primary: "Itaú", secondary: "SAC · Financiamento", right: "Ativo" },
              { primary: "Bradesco", secondary: "SAC, PRICE · Financiamento", right: "Ativo" },
              { primary: "Santander", secondary: "SAC · Financiamento + Home Equity", right: "Ativo" },
            ],
          },
        ],
      },
      {
        title: "Financiamento Imobiliário",
        fields: [
          { kind: "chips", label: "Prazos disponíveis (meses)", options: ["120", "180", "240", "300", "360", "420"], defaultValues: ["180", "240", "360"] },
          { kind: "text", label: "Entrada mínima sugerida (%)", type: "number", defaultValue: "20" },
          { kind: "toggle", label: "Permitir FGTS", defaultValue: true },
          { kind: "toggle", label: "Permitir financiar despesas", defaultValue: true },
          { kind: "chips", label: "Tipos de imóvel", options: ["Residencial", "Comercial", "Rural"], defaultValues: ["Residencial", "Comercial"] },
          { kind: "chips", label: "Uso do imóvel", options: ["Próprio", "Renda", "Veraneio"], defaultValues: ["Próprio", "Renda"] },
          { kind: "chips", label: "Situação do imóvel", options: ["Novo", "Usado", "Em construção"], defaultValues: ["Novo", "Usado"] },
        ],
      },
      {
        title: "Home Equity",
        fields: [
          { kind: "chips", label: "Prazos disponíveis (meses)", options: ["60", "120", "180", "240"], defaultValues: ["120", "180", "240"] },
          { kind: "text", label: "LTV máximo (%)", type: "number", defaultValue: "60" },
          { kind: "text", label: "Valor mínimo solicitado (R$)", type: "number", defaultValue: "50000" },
          { kind: "text", label: "Valor máximo solicitado (R$)", type: "number", defaultValue: "5000000" },
          { kind: "chips", label: "Finalidades aceitas", options: ["Capital de giro", "Reforma", "Quitação dívidas", "Investimento", "Outro"], defaultValues: ["Capital de giro", "Reforma", "Quitação dívidas"] },
          { kind: "chips", label: "Situação do imóvel em garantia", options: ["Quitado", "Financiado", "Alienado"], defaultValues: ["Quitado"] },
        ],
      },
    ],
  },
  {
    id: "portal-cliente",
    label: "Portal do Cliente",
    icon: Globe,
    description: "O que o cliente final vê e pode fazer dentro do portal de acompanhamento.",
    groups: [
      {
        title: "Visualização",
        fields: [
          { kind: "toggle", label: "Mostrar status da proposta", defaultValue: true },
          { kind: "toggle", label: "Mostrar etapa atual", defaultValue: true },
          { kind: "toggle", label: "Mostrar próxima etapa", defaultValue: true },
          { kind: "toggle", label: "Mostrar documentos pendentes", defaultValue: true },
          { kind: "toggle", label: "Mostrar documentos aprovados", defaultValue: true },
          { kind: "toggle", label: "Mostrar mensagens externas", defaultValue: true },
          { kind: "toggle", label: "Mostrar atualizações do corretor", defaultValue: true },
          { kind: "toggle", label: "Mostrar atualizações do correspondente", defaultValue: true },
          { kind: "toggle", label: "Ocultar observações internas", defaultValue: true },
          { kind: "toggle", label: "Separar mensagem interna e externa", defaultValue: true },
        ],
      },
      {
        title: "Interações",
        fields: [
          { kind: "toggle", label: "Permitir envio de documento pelo cliente", defaultValue: true },
          { kind: "toggle", label: "Permitir chat com corretor", defaultValue: true },
          { kind: "toggle", label: "Notificar cliente sobre atualização", defaultValue: true },
        ],
      },
    ],
  },
  {
    id: "notificacoes",
    label: "Notificações e Comunicação",
    icon: Bell,
    description: "Eventos que geram notificações, destinatários e modelos de mensagem.",
    groups: [
      {
        title: "Eventos monitorados",
        fields: [
          { kind: "chips", label: "Eventos ativos", options: ["Novo cliente", "Nova simulação", "Nova proposta", "Proposta transferida", "Demanda recebida", "Demanda compartilhada", "Nova mensagem no chat", "SLA próximo de vencer", "SLA vencido", "Documento enviado", "Documento reprovado", "Proposta atualizada", "Cliente recebeu atualização", "Conta a pagar vencendo", "Conta a receber vencendo", "Comissão liberada", "Comissão paga"], defaultValues: ["Nova proposta", "Demanda recebida", "Nova mensagem no chat", "SLA vencido", "Documento reprovado", "Comissão paga"] },
        ],
      },
      {
        title: "Destinatários",
        fields: [
          { kind: "toggle", label: "Notificar responsável", defaultValue: true },
          { kind: "toggle", label: "Notificar criador", defaultValue: true },
          { kind: "toggle", label: "Notificar corretor", defaultValue: true },
          { kind: "toggle", label: "Notificar cliente", defaultValue: true },
          { kind: "toggle", label: "Notificar participantes da demanda", defaultValue: true },
        ],
      },
      {
        title: "Janelas e modelos",
        fields: [
          { kind: "text", label: "Horário inicial permitido", defaultValue: "08:00" },
          { kind: "text", label: "Horário final permitido", defaultValue: "20:00" },
          { kind: "textarea", label: "Modelo padrão (WhatsApp)", defaultValue: "Olá {{cliente}}, sua proposta está em {{etapa}}. Próximo passo: {{proximo}}." },
          { kind: "textarea", label: "Modelo padrão (E-mail)", defaultValue: "Atualização sobre sua proposta #{{numero}}…" },
        ],
      },
    ],
  },
  {
    id: "seguranca",
    label: "Segurança e Auditoria",
    icon: ShieldCheck,
    description: "Política de senha, sessões, autenticação em duas etapas e registros auditáveis.",
    groups: [
      {
        title: "Política de acesso",
        fields: [
          { kind: "select", label: "Tamanho mínimo da senha", options: ["8 caracteres", "10 caracteres", "12 caracteres"], defaultValue: "10 caracteres" },
          { kind: "toggle", label: "Exigir letras, números e símbolos", defaultValue: true },
          { kind: "select", label: "Expiração da sessão", options: ["30 min", "1 hora", "4 horas", "8 horas", "24 horas"], defaultValue: "4 horas" },
          { kind: "text", label: "Tentativas até bloqueio", type: "number", defaultValue: "5" },
          { kind: "toggle", label: "Autenticação em duas etapas", defaultValue: true },
          { kind: "toggle", label: "Controle de sessões ativas", defaultValue: true },
        ],
      },
      {
        title: "Auditoria",
        fields: [
          { kind: "toggle", label: "Histórico de login", defaultValue: true },
          { kind: "toggle", label: "Histórico de alterações", defaultValue: true },
          { kind: "toggle", label: "Auditoria de ações críticas", defaultValue: true },
          { kind: "toggle", label: "Registro de transferência", defaultValue: true },
          { kind: "toggle", label: "Registro de exclusão", defaultValue: true },
          { kind: "toggle", label: "Registro de alteração financeira", defaultValue: true },
          { kind: "toggle", label: "Registro de alteração de permissão", defaultValue: true },
          { kind: "toggle", label: "Registro de upload e reprovação de documento", defaultValue: true },
        ],
      },
      {
        title: "Confirmações obrigatórias",
        fields: [
          { kind: "chips", label: "Ações que exigem confirmação", options: ["Excluir", "Transferir", "Cancelar proposta", "Reprovar proposta", "Estornar lançamento", "Pagar comissão", "Alterar permissão", "Inativar usuário"], defaultValues: ["Excluir", "Transferir", "Cancelar proposta", "Reprovar proposta", "Estornar lançamento", "Pagar comissão", "Alterar permissão", "Inativar usuário"] },
        ],
      },
    ],
  },
  {
    id: "integracao-homefin",
    label: "Integração HomeFin",
    icon: Sliders, // reaproveitando icon — será substituído por Plug2 se disponível
    description: "Credenciais de acesso à API HomeFin para simulação e envio de propostas aos bancos. As credenciais são armazenadas com segurança e nunca expostas no frontend.",
    groups: [
      {
        title: "Credenciais da API",
        hint: "Obtidas no painel do HomeFin (homefin.com.br). Cada correspondente possui credenciais únicas.",
        fields: [
          { kind: "text", label: "Secret ID", placeholder: "hf_id_xxxxxxxxxxxxxxxxxxxx" },
          { kind: "text", label: "Secret Key", type: "password", placeholder: "hf_sk_xxxxxxxxxxxxxxxxxxxx" },
          {
            kind: "list",
            label: "Status da integração",
            items: [
              { primary: "Servidor HomeFin", secondary: "Edge Function: homefin-auth", right: "Não configurado" },
              { primary: "Última verificação", secondary: "Nunca verificado", right: "—" },
            ],
          },
        ],
      },
      {
        title: "Comportamento da integração",
        fields: [
          { kind: "toggle", label: "Enviar simulação automaticamente ao HomeFin", description: "Ao finalizar uma simulação, envia os dados ao HomeFin para pré-aprovação.", defaultValue: false },
          { kind: "toggle", label: "Registrar log de chamadas à API", defaultValue: true },
          { kind: "toggle", label: "Notificar em caso de erro na integração", defaultValue: true },
          { kind: "select", label: "Ambiente", options: ["Produção", "Homologação", "Sandbox"], defaultValue: "Sandbox" },
        ],
      },
      {
        title: "Bancos habilitados via HomeFin",
        fields: [
          { kind: "chips", label: "Bancos ativos na integração", options: ["Caixa Econômica Federal", "Itaú", "Bradesco", "Santander", "Banco do Brasil", "Banco Inter"], defaultValues: ["Caixa Econômica Federal", "Itaú", "Santander"] },
        ],
      },
    ],
  },
  {
    id: "preferencias",
    label: "Preferências do Sistema",
    icon: Sliders,
    description: "Padrões visuais e operacionais aplicados a toda a operação do correspondente.",
    groups: [
      {
        fields: [
          { kind: "select", label: "Página inicial padrão", options: ["Painel de Monitoramento", "CRM", "Operacional", "Financeiro"] },
          { kind: "select", label: "Densidade da interface", options: ["Compacta", "Confortável", "Espaçosa"], defaultValue: "Confortável" },
          { kind: "select", label: "Sidebar padrão", options: ["Expandida", "Recolhida"] },
          { kind: "select", label: "Formato de data", options: ["DD/MM/AAAA", "AAAA-MM-DD", "DD-MM-AAAA"], defaultValue: "DD/MM/AAAA" },
          { kind: "select", label: "Formato de moeda", options: ["R$ 0.000,00", "R$ 0,000.00"], defaultValue: "R$ 0.000,00" },
          { kind: "select", label: "Dashboard padrão", options: ["Executivo", "Operacional", "Financeiro"] },
        ],
      },
    ],
  },
];

export function ConfiguracoesCorrespondente() {
  return (
    <ConfigShell
      title="Configurações do Correspondente"
      subtitle="Gerencie o ecossistema completo: usuários, corretores, parceiros, regras operacionais, financeiras, documentos, portal do cliente, segurança e auditoria."
      sections={sections}
    />
  );
}
