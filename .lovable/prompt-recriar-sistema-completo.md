# PROMPT ÚNICO — Recrie o Sistema Agilliza Crédito do Zero

> **Como usar**: copie TODO o conteúdo deste arquivo e cole em um **novo projeto Lovable em branco**. Envie como uma única mensagem. O agente seguirá a sequência completa, do bootstrap ao Go-Live, com integração real HomeFin, IAs configuráveis e segurança por papel de usuário.

---

## CONTEXTO

Recrie do zero a plataforma **Agilliza Crédito** — sistema completo para correspondentes bancários no Brasil, com 4 portais (Correspondente, Corretor, Cliente e Auth), CRM, Operacional (simulações/propostas/kanban), Financeiro completo, Relatórios Gerenciais, módulos de IA (Scan IA e Flash IA) e integração oficial com a **API HomeFin**.

**Stack obrigatória**: TanStack Start + React 19 + TypeScript strict + Tailwind v4 + shadcn/ui + Lovable Cloud (Supabase: Postgres, RLS, Auth, Edge Functions, Storage) + Lovable AI Gateway.

**Idioma da UI**: Português Brasil. **Moeda**: BRL. **Datas**: DD/MM/AAAA.

---

## REGRAS GLOBAIS (NÃO QUEBRE NENHUMA)

1. **ZERO dados mockados em produção**. Toda tela lê do Supabase via `createServerFn` ou hooks. Empty states reais quando não houver dados.
2. **Chaves de API e secrets NUNCA em plaintext** no banco — sempre criptografados (AES-256-GCM) via Edge Function.
3. **RLS habilitado em TODAS as tabelas** com policies escopadas a `auth.uid()` e `correspondente_id`.
4. **Papéis (`app_role`)**: `master`, `admin`, `analista`, `backoffice`, `comercial`, `corretor`, `cliente`. Roles em tabela separada `user_roles` + função `has_role` SECURITY DEFINER.
5. **Apenas `master`** acessa configurações de integração (chaves de IA, HomeFin, etc.).
6. **Design system**: tokens HSL semânticos em `src/styles.css`. Proibido cores hardcoded (`bg-white`, `text-[#xxx]`) em componentes.
7. **Filtros REATIVOS** em todos os dashboards (período, banco, produto, corretor, analista, status, **período personalizado de–até**).
8. **Toda mudança em `integration_configs` e `user_roles` gera linha em `audit_log`**.

---

## IDENTIDADE VISUAL

- **Nome do produto**: Agilliza Crédito
- **Paleta** (HSL em `src/styles.css`):
  - `--brand`: 235 100% 37% (azul institucional #001BBF)
  - `--brand-2`: 202 89% 45% (azul claro #0A8FDC)
  - `--success`: 147 100% 35% (#00B35A)
  - `--warning`: 32 100% 50% (#FF8A00)
  - `--destructive`: 0 75% 51% (#E02323)
  - `--ai`: 240 78% 71% (roxo IA #7A7AF1)
  - `--graphite`: 232 31% 14% (#1A1A2E)
  - `--surface`: 0 0% 100%
  - `--background`: 228 27% 97% (#F6F7FB)
- **Tipografia**: Inter (corpo) + Inter Display (títulos), 400/600/700
- **Cards**: borda 1px, radius 8–12px, sombras suaves
- **KPIs**: barra superior 4px na cor da métrica
- **Eyebrows**: UPPERCASE com tracking amplo
- **Logo**: placeholder "Agilliza" em peso 700 sobre badge brand

---

## ESTRUTURA DE PORTAIS

### `/auth` (público)
- Split-screen: branding à esquerda, formulário à direita
- Tabs "Entrar" / "Criar conta"
- "Esqueci minha senha" → dialog com `resetPasswordForEmail` redirecionando para `/auth/reset-password`
- Após login: redireciona por papel → master/admin → `/correspondente`, corretor → `/corretor`, cliente → `/cliente`

### `/auth/reset-password` (público)
- Detecta `type=recovery`, formulário de nova senha, chama `supabase.auth.updateUser({ password })`

### `/_authenticated` (layout pathless, `ssr:false`)
- `beforeLoad` chama `supabase.auth.getUser()`; redireciona para `/auth` se sem sessão
- Todas as rotas autenticadas ficam abaixo dele

### `/correspondente/*` — portal master
Menu agrupado (Sidebar):
- **Visão Geral**: Painel
- **CRM**: Scan IA · Flash IA · Dashboard · Cadastro · Consultas · Relatórios
- **Operacional**: Painel · Consultas · Simulações · Minhas Simulações · Propostas (Kanban) · Demandas & SLA · Tarefas · Atualização de Proposta · Relatórios
- **Financeiro**: Painel · Contas a Pagar · Contas a Receber · Comissões · Categorias · Recorrências · Conciliação · Fluxo de Caixa · Lançamentos · Relatórios Financeiros · **Relatórios Gerenciais**
- **Gestão Administrativa**: Cadastros Gerais (bancos, imobiliárias, produtos, equipe)
- **Configurações**: Sistema · **Integrações** (somente master)
- **Backup**: Backup do Sistema (somente master)

### `/corretor/*` — portal do corretor parceiro
Menu reduzido focado em pipeline pessoal, simulações, comissões e Scan/Flash IA.

### `/cliente/*` — portal do cliente final
- Acompanhamento da proposta
- Upload de documentos pendentes
- Notificações

---

## SCHEMA DE BANCO (executar via migration)

### Bloco 1 — Auth, Perfis, Papéis

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  correspondente_id UUID,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self read"   ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROLES
CREATE TYPE public.app_role AS ENUM
  ('master','admin','analista','backoffice','comercial','corretor','cliente');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "master manages" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'master')) WITH CHECK (public.has_role(auth.uid(),'master'));

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;
```

### Bloco 2 — Integrações criptografadas (NÚCLEO DA SEGURANÇA)

```sql
CREATE TYPE public.integration_provider AS ENUM
  ('homefin','openai','anthropic','google_gemini','mistral','deepseek','xai_grok','lovable_ai');

CREATE TABLE public.integration_providers_catalog (
  provider public.integration_provider PRIMARY KEY,
  display_name TEXT NOT NULL,
  default_base_url TEXT NOT NULL,
  default_models TEXT[] DEFAULT '{}',
  docs_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('ia','core','outros'))
);
GRANT SELECT ON public.integration_providers_catalog TO authenticated;
GRANT ALL ON public.integration_providers_catalog TO service_role;

INSERT INTO public.integration_providers_catalog VALUES
('google_gemini','Google Gemini','https://generativelanguage.googleapis.com/v1beta',
  ARRAY['gemini-2.5-pro','gemini-2.5-flash','gemini-2.0-flash'],'https://aistudio.google.com/apikey','ia'),
('openai','OpenAI GPT','https://api.openai.com/v1',
  ARRAY['gpt-5','gpt-5-mini','gpt-5-nano','gpt-4o'],'https://platform.openai.com/api-keys','ia'),
('anthropic','Anthropic Claude','https://api.anthropic.com/v1',
  ARRAY['claude-sonnet-4-5','claude-opus-4','claude-haiku-4'],'https://console.anthropic.com/','ia'),
('mistral','Mistral AI','https://api.mistral.ai/v1',
  ARRAY['mistral-large-latest','mistral-small-latest'],'https://console.mistral.ai/','ia'),
('deepseek','DeepSeek','https://api.deepseek.com/v1',
  ARRAY['deepseek-chat','deepseek-reasoner'],'https://platform.deepseek.com/','ia'),
('xai_grok','xAI Grok','https://api.x.ai/v1',
  ARRAY['grok-4','grok-3'],'https://console.x.ai/','ia'),
('lovable_ai','Lovable AI Gateway','https://ai.gateway.lovable.dev/v1',
  ARRAY['google/gemini-2.5-pro','openai/gpt-5','anthropic/claude-sonnet-4-5'],'https://docs.lovable.dev','ia'),
('homefin','HomeFin API','https://api.homefin.com.br/v1',
  ARRAY[]::TEXT[],'https://docs.homefin.com.br','core');

CREATE TABLE public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correspondente_id UUID NOT NULL,
  provider public.integration_provider NOT NULL,
  display_name TEXT NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  encrypted_api_secret TEXT,
  encrypted_webhook_secret TEXT,
  base_url TEXT,
  model_default TEXT,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('production','sandbox')),
  extra_config JSONB DEFAULT '{}'::jsonb,
  used_for TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT,
  key_last4 TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (correspondente_id, provider, display_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_configs TO authenticated;
GRANT ALL ON public.integration_configs TO service_role;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "master reads"  ON public.integration_configs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'master'));
CREATE POLICY "master writes" ON public.integration_configs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'master')) WITH CHECK (public.has_role(auth.uid(),'master'));

-- AUDIT
CREATE TABLE public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before JSONB, after JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "master reads audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'master'));

CREATE OR REPLACE FUNCTION public.fn_audit_integration_configs()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.audit_log(entity, entity_id, action, before, after, user_id)
  VALUES ('integration_configs', COALESCE(NEW.id, OLD.id), TG_OP,
    CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) - 'encrypted_api_key' - 'encrypted_api_secret' - 'encrypted_webhook_secret' END,
    CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) - 'encrypted_api_key' - 'encrypted_api_secret' - 'encrypted_webhook_secret' END,
    auth.uid());
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_audit_integration_configs
AFTER INSERT OR UPDATE OR DELETE ON public.integration_configs
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_integration_configs();
```

### Bloco 3 — Cadastros administrativos
Tabelas (todas com `correspondente_id`, RLS, GRANTs):
- `bancos` (sigla, nome, ativo, taxas_padrao jsonb)
- `imobiliarias` (nome, cnpj, contato, comissao_padrao)
- `corretores_parceiros` (nome, cpf, creci, imobiliaria_id, ativo)
- `produtos_financeiros` (codigo FI/HE, nome, prazos, ltv_max, regras jsonb)
- `equipe_interna` (user_id, papel, especialidade)

Seed: Caixa, Bradesco, Itaú, Santander, BB, Inter; produtos FI e HE.

### Bloco 4 — CRM
- `clientes` (cpf, nome, rg, estado_civil, regime_casamento, tipo_renda, renda_bruta, usa_fgts, saldo_fgts, telefone, email, corretor_id, correspondente_id)
- `conjuges` (cliente_id, cpf, nome, ...)
- `compositores_renda` (cliente_id, cpf, nome, parentesco, renda)
- `enderecos_cliente`
- `documentos_cliente` (cliente_id, tipo, storage_path, ocr_json, status, confianca)

RLS: corretor vê apenas seus; master/admin vê todos do correspondente.

### Bloco 5 — Operacional
- `simulacoes` (cliente_id, produto, prazo_meses, valor_imovel, valor_solicitado, sistema_amortizacao, status, external_id)
- `propostas` (simulacao_id, banco_id, status, valor_aprovado, valor_liberado, external_id, taxa, parcela)
- `propostas_bancos` (proposta_id, banco_id, taxa, parcela, valor, prazo, situacao)
- `status_proposta_log` (proposta_id, status, observacao, user_id, created_at)
- `demandas` (proposta_id, descricao, prazo, status)
- `tarefas` (responsavel_id, titulo, descricao, vencimento, prioridade, status)
- `sla_configs` (etapa, prazo_horas)

Status alinhados ao HomeFin: SIMULACAO → ANALISE → APROVADA → CONTRATACAO → ASSINATURA → LIBERADA → CANCELADA.

### Bloco 6 — Financeiro
- `categorias_financeiras` (nome, tipo receita/despesa, cor)
- `lancamentos` (data, tipo, categoria_id, descricao, valor, status, conta_id, proposta_id)
- `contas_pagar` / `contas_receber` (vinculadas a lancamentos)
- `comissoes` (proposta_id, beneficiario_id, beneficiario_tipo, percentual, valor, status, data_pagamento)
- `recorrencias` (descricao, valor, periodicidade, proxima_data, categoria_id)
- `conciliacao_bancaria` (lancamento_id, extrato_id, status)
- View `fluxo_caixa_view`

---

## EDGE FUNCTIONS A CRIAR

| Nome | Propósito |
|------|-----------|
| `config-crypto` | encrypt/decrypt AES-256-GCM com `CONFIG_VAULT_KEY`. Valida master via JWT. |
| `homefin-auth` | OAuth client_credentials, cache em `homefin_tokens`, refresh automático |
| `homefin-simulacao` | POST /simulacoes; persiste em `propostas_bancos` |
| `homefin-proposta` | criar / atualizar_status / enviar_documentos |
| `homefin-webhook` (rota pública `/api/public/webhooks/homefin`) | valida HMAC SHA256, atualiza propostas |
| `homefin-sync` (cron 15min) | sincroniza propostas em ANALISE/CONTRATACAO |
| `scan-ia` | OCR multi-provedor (Gemini/OpenAI/Claude) com chave do tenant |
| `flash-ia` | chat conversacional streaming com function calling |
| `test-provider-connection` | testa conexão de cada provedor (Master) |

**Secret obrigatório**: `CONFIG_VAULT_KEY` = saída de `openssl rand -base64 32`.

---

## TELA-CHAVE: `/correspondente/configuracoes/integracoes` (somente master)

Layout com 3 abas (`<Tabs>`):

### Aba 1 — Inteligências Artificiais
Grid de cards (1 por provedor do catálogo categoria='ia'):
```
┌─ [logo] Google Gemini                  [● Conectado] ┐
│ Modelo padrão: [select: gemini-2.5-pro ▾]            │
│ API Key:       ••••••••••3F2A  [Editar]              │
│ Usar para:     [x] Scan IA   [x] Flash IA            │
│ Último teste:  21/06/2026 14:32 — OK                 │
│                          [Testar conexão] [Salvar]   │
└──────────────────────────────────────────────────────┘
```
Repete para: OpenAI, Anthropic, Mistral, DeepSeek, xAI Grok, Lovable AI.

### Aba 2 — HomeFin API
```
Ambiente:       (•) Produção   ( ) Sandbox
Base URL:       [https://api.homefin.com.br/v1]
Client ID:      [input]
Client Secret:  [password — criptografado]
Webhook Secret: [password — criptografado]
Webhook URL:    https://{project}.lovable.app/api/public/webhooks/homefin  [copiar]
                          [Testar autenticação] [Salvar]
```

### Aba 3 — Outras Integrações
Espaço futuro (Bacen, Score, e-CPF, assinatura eletrônica).

**Comportamento obrigatório**:
- Campos de chave NUNCA mostram plaintext após salvar (apenas `••••` + últimos 4 chars).
- "Editar" abre dialog que exige reconfirmar senha do usuário antes de revelar/atualizar.
- "Salvar" chama Edge `config-crypto` action=encrypt, depois UPSERT em `integration_configs`.
- "Testar conexão" chama Edge `test-provider-connection` que decripta server-side e faz request real ao provedor.
- Item de menu "Integrações" só aparece se `useHasRole('master') === true`.
- Rota envolvida em `<RequireMaster>` que redireciona não-masters.

---

## MÓDULOS A IMPLEMENTAR (resumo funcional)

### Dashboards (Correspondente, Corretor, Cliente)
- KPIs reativos a `<FilterBar>` controlada
- Filtros: período (7/30/90d/Ano/**Personalizado de–até**), banco, produto FI/HE, corretor, **analista**, status, imobiliária
- Drill-down em cada KPI abre `<DetailDialog>` com lista filtrada
- Hook centralizado `useDashboardFilters`

### CRM
- Cadastro de cliente com **Scan IA** integrado (upload doc → preenche campos)
- Consultas com busca avançada e filtros funcionais
- Relatórios por origem, corretor, conversão

### Operacional
- Simulações: wizard 4 etapas (Imóvel → Proponente → Renda → Resultado multi-banco)
- Propostas: Kanban arrastável por status
- Demandas & SLA, Tarefas com prioridade
- Atualização de proposta (sync HomeFin)

### Financeiro
- Painel com KPIs (receita, despesa, saldo, inadimplência)
- Contas a Pagar/Receber, Lançamentos
- Comissões auto-calculadas a partir de `proposta.valor_liberado × percentual`
- Categorias, Recorrências, Conciliação Bancária
- Fluxo de Caixa (gráfico + tabela)

### Relatórios Gerenciais (exigência específica)
**A — Processos em andamento**: por valor/banco, tipo (FI/HE), analista adm, analista comercial (split por banco), imobiliária/corretor, fase atual.
**B — Propostas aprovadas**: por data, banco, analistas, imobiliária/corretor, tipo.
**C — Contratos emitidos**: por data emissão, analistas, imobiliária/corretor, tipo, valor/banco.
Exportação PDF e CSV.

### Módulos de IA
- **Scan IA**: upload drag-and-drop (PDF/JPG/PNG até 10MB) → Edge `scan-ia` → JSON estruturado → preenche cliente. Mostra provedor usado + confiança.
- **Flash IA**: chat full-screen estilo Claude com markdown, function calling (buscar_cliente, buscar_proposta, calcular_simulacao, listar_pendencias). Histórico em `flash_ia_conversations`.
- Hook `useAiProvider('scan_ia' | 'flash_ia')` resolve provedor dinamicamente do `integration_configs.used_for`. Fallback automático se primário falhar 2x.

### Portal do Cliente
- Login, timeline da proposta, upload de pendências, notificações

### Backup
- Export JSON via Edge Function (master apenas)

---

## ORDEM DE EXECUÇÃO RECOMENDADA

1. Bootstrap visual + tokens (`src/styles.css`)
2. Shell de portais + login + reset password + `_authenticated`
3. Migration Bloco 1 (auth, profiles, roles, has_role)
4. Migration Bloco 2 (integrações + audit) + Edge `config-crypto`
5. Tela `/configuracoes/integracoes` + `<RequireMaster>` + cards de provedor
6. Migrations Blocos 3–6 (admin, CRM, operacional, financeiro)
7. Edge Functions HomeFin (`homefin-auth`, `homefin-simulacao`, `homefin-proposta`, `homefin-webhook`, `homefin-sync`)
8. Mappers HomeFin em `src/lib/operacional/homefin-mappers.ts`
9. Módulos: Dashboards → CRM → Operacional → Financeiro → Relatórios Gerenciais → Portal Cliente → Backup
10. Edge `scan-ia` e `flash-ia` + UIs reaproveitando provedores
11. Realtime nas tabelas dinâmicas (propostas, demandas, tarefas, notificacoes)
12. Remoção de qualquer resquício de mock + SEO + security scan
13. Checklist Go-Live (ver final)

---

## CHECKLIST DE GO-LIVE (não publique sem todos ✅)

- [ ] Todas as tabelas com GRANTs + RLS + policies testadas com usuário não-master
- [ ] Auth: signup, login, reset password funcionando
- [ ] Pelo menos 1 usuário com papel `master` ativo
- [ ] `/configuracoes/integracoes` redireciona não-masters
- [ ] Chaves de IA cadastradas e botão "Testar conexão" retorna OK
- [ ] HomeFin: token obtido, `homefin-simulacao` retorna ≥1 banco real
- [ ] Webhook HomeFin: sem HMAC → 401; com HMAC válido → 200
- [ ] Scan IA extrai campos reais de RG/CNH/Holerite com confiança alta
- [ ] Flash IA responde usando contexto real do banco
- [ ] Filtros funcionais em todos os dashboards (incluindo de–até e por analista)
- [ ] Relatórios Gerenciais A/B/C exportando PDF e CSV
- [ ] Nenhuma tela com dado mockado — empty states adequados
- [ ] `audit_log` registrando alterações em `integration_configs` e `user_roles`
- [ ] `security--run_security_scan` sem findings críticos
- [ ] SEO básico nas rotas públicas (title, meta, OG)
- [ ] CORS restrito em Edge Functions públicas
- [ ] `LOVABLE_API_KEY` e `CONFIG_VAULT_KEY` presentes nos secrets
- [ ] Publicado em domínio definitivo

---

## SECRETS NECESSÁRIOS (criar no início)

| Secret | Como obter |
|--------|-----------|
| `CONFIG_VAULT_KEY` | `openssl rand -base64 32` (32 bytes em base64) |
| `LOVABLE_API_KEY` | auto-provisionado |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | auto-provisionados |

Chaves dos provedores de IA e da HomeFin **NÃO** são secrets do Supabase — vão criptografadas em `integration_configs`, configuradas pelo master via UI.

---

**COMECE AGORA**: execute em ordem, peça aprovação ao usuário antes de cada migration, e siga TODAS as regras globais acima. Não pule etapas.
