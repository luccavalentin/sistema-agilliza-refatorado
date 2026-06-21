# ANEXOS TÉCNICOS — Prompt Master HomeFin

> Complemento ao arquivo `prompt-replicacao-homefin-completo.md`.
> Contém **snippets prontos para colar**, schemas SQL completos, exemplos de Edge Functions e checklist de testes.

---

## ANEXO A — SQL completo do bloco de segurança (cole no SQL Editor)

```sql
-- =========================================================
-- A.1 Extensões
-- =========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- A.2 Papéis (roles)
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM
    ('master','admin','analista','backoffice','comercial','corretor','cliente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
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

CREATE POLICY "user reads own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "master manages roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'master'))
  WITH CHECK (public.has_role(auth.uid(),'master'));

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================================================
-- A.3 Integration configs (criptografadas)
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.integration_provider AS ENUM
    ('homefin','openai','anthropic','google_gemini','mistral','deepseek','xai_grok','lovable_ai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.integration_providers_catalog (
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
   ARRAY[]::TEXT[],'https://docs.homefin.com.br','core')
ON CONFLICT (provider) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correspondente_id UUID NOT NULL,
  provider public.integration_provider NOT NULL,
  display_name TEXT NOT NULL,
  encrypted_api_key TEXT NOT NULL,        -- AES-256-GCM ciphertext (base64)
  encrypted_api_secret TEXT,
  encrypted_webhook_secret TEXT,
  base_url TEXT,
  model_default TEXT,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('production','sandbox')),
  extra_config JSONB DEFAULT '{}'::jsonb,
  used_for TEXT[] DEFAULT '{}',           -- ['scan_ia','flash_ia','homefin']
  enabled BOOLEAN DEFAULT TRUE,
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (correspondente_id, provider, display_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_configs TO authenticated;
GRANT ALL ON public.integration_configs TO service_role;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "only master reads configs"
  ON public.integration_configs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'master'));

CREATE POLICY "only master writes configs"
  ON public.integration_configs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'master'))
  WITH CHECK (public.has_role(auth.uid(),'master'));

-- =========================================================
-- A.4 Auditoria
-- =========================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
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
  VALUES ('integration_configs',
          COALESCE(NEW.id, OLD.id),
          TG_OP,
          CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) - 'encrypted_api_key' - 'encrypted_api_secret' - 'encrypted_webhook_secret' END,
          CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) - 'encrypted_api_key' - 'encrypted_api_secret' - 'encrypted_webhook_secret' END,
          auth.uid());
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_audit_integration_configs
AFTER INSERT OR UPDATE OR DELETE ON public.integration_configs
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_integration_configs();
```

---

## ANEXO B — Edge Function `config-crypto` (encrypt + decrypt)

```ts
// supabase/functions/config-crypto/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAULT_KEY_B64 = Deno.env.get("CONFIG_VAULT_KEY")!; // 32 bytes em base64
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getKey() {
  const raw = Uint8Array.from(atob(VAULT_KEY_B64), c => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt","decrypt"]);
}

async function encrypt(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name:"AES-GCM", iv },
    key,
    new TextEncoder().encode(plain)
  ));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv); out.set(ct, iv.length);
  return btoa(String.fromCharCode(...out));
}

async function decrypt(b64: string): Promise<string> {
  const key = await getKey();
  const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = buf.slice(0,12), ct = buf.slice(12);
  const pt = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

async function assertMaster(authHeader: string | null) {
  if (!authHeader) throw new Error("unauthenticated");
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data: { user }, error } = await supa.auth.getUser();
  if (error || !user) throw new Error("invalid token");
  const { data, error: rerr } = await supa.rpc("has_role", { _user_id: user.id, _role: "master" });
  if (rerr || !data) throw new Error("forbidden");
  return user.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });
  try {
    await assertMaster(req.headers.get("Authorization"));
    const { action, value } = await req.json();
    if (action === "encrypt") return json({ ciphertext: await encrypt(value) });
    if (action === "decrypt") return json({ plaintext: await decrypt(value) });
    return json({ error: "invalid action" }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 401);
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { ...cors(), "Content-Type":"application/json" }});
}
```

**Geração do `CONFIG_VAULT_KEY`** (rode no terminal e salve como secret no Supabase):
```bash
openssl rand -base64 32
```

---

## ANEXO C — Edge Function `homefin-auth` (token + refresh)

```ts
// supabase/functions/homefin-auth/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export async function getHomefinToken(correspondente_id: string): Promise<string> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1. Token cache válido?
  const { data: cached } = await admin
    .from("homefin_tokens")
    .select("access_token, expires_at")
    .eq("correspondente_id", correspondente_id)
    .maybeSingle();

  if (cached && new Date(cached.expires_at) > new Date(Date.now() + 60_000)) {
    return cached.access_token;
  }

  // 2. Buscar config
  const { data: cfg } = await admin
    .from("integration_configs")
    .select("base_url, encrypted_api_key, encrypted_api_secret, environment")
    .eq("correspondente_id", correspondente_id)
    .eq("provider", "homefin")
    .eq("enabled", true)
    .single();
  if (!cfg) throw new Error("HomeFin não configurado");

  // 3. Decifrar via config-crypto (server-side, com service role bypassa master check — refatorar para função interna se preferir)
  const client_id = await internalDecrypt(cfg.encrypted_api_key);
  const client_secret = await internalDecrypt(cfg.encrypted_api_secret!);

  // 4. POST /oauth/token
  const res = await fetch(`${cfg.base_url}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id, client_secret,
    }),
  });
  if (!res.ok) throw new Error(`HomeFin auth ${res.status}: ${await res.text()}`);
  const { access_token, expires_in } = await res.json();

  // 5. Cachear
  await admin.from("homefin_tokens").upsert({
    correspondente_id,
    access_token,
    expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
  });
  return access_token;
}

// implementar internalDecrypt usando a mesma lógica AES-GCM com CONFIG_VAULT_KEY
```

---

## ANEXO D — UI: card de provedor (componente reutilizável)

```tsx
// src/components/configuracoes/provider-card.tsx
export function ProviderCard({ provider, config, onSave, onTest }: Props) {
  const [editing, setEditing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(config?.model_default ?? provider.default_models[0]);
  const [usedFor, setUsedFor] = useState<string[]>(config?.used_for ?? []);

  const masked = config ? "••••••••••••" + config.last4 : "Não configurado";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{provider.display_name}</CardTitle>
          <CardDescription>
            <a href={provider.docs_url} target="_blank" className="text-brand text-xs">
              Obter chave →
            </a>
          </CardDescription>
        </div>
        <Badge variant={config?.enabled ? "default" : "outline"}>
          {config?.enabled ? "● Conectado" : "○ Desconectado"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>API Key</Label>
          {editing ? (
            <Input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)}
              placeholder="cole a chave (será criptografada)" autoComplete="off" />
          ) : (
            <div className="flex items-center gap-2">
              <code className="text-xs">{masked}</code>
              <Button size="sm" variant="ghost" onClick={()=>setEditing(true)}>Editar</Button>
            </div>
          )}
        </div>

        <div>
          <Label>Modelo padrão</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              {provider.default_models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Usar em</Label>
          <div className="flex gap-3 text-xs">
            <Checkbox checked={usedFor.includes("scan_ia")}
              onCheckedChange={v=>toggle(usedFor,setUsedFor,"scan_ia",!!v)} /> Scan IA
            <Checkbox checked={usedFor.includes("flash_ia")}
              onCheckedChange={v=>toggle(usedFor,setUsedFor,"flash_ia",!!v)} /> Flash IA
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={()=>onTest(config?.id)} variant="outline" size="sm">Testar conexão</Button>
          <Button onClick={()=>onSave({ apiKey, model, usedFor })} size="sm">Salvar</Button>
        </div>
        {config?.last_tested_at && (
          <p className="text-[11px] text-muted-foreground">
            Último teste: {new Date(config.last_tested_at).toLocaleString("pt-BR")} — {config.last_test_status}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## ANEXO E — Hook `useHasRole` e guarda `<RequireMaster>`

```tsx
// src/hooks/use-role.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHasRole(role: "master"|"admin"|"analista"|"backoffice"|"comercial"|"corretor"|"cliente") {
  return useQuery({
    queryKey: ["has-role", role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: role });
      if (error) throw error;
      return !!data;
    },
    staleTime: 5 * 60_000,
  });
}
```

```tsx
// src/components/auth/require-master.tsx
export function RequireMaster({ children }: { children: ReactNode }) {
  const { data: isMaster, isLoading } = useHasRole("master");
  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Verificando permissões…</div>;
  if (!isMaster) return <Navigate to="/correspondente" replace />;
  return <>{children}</>;
}
```

---

## ANEXO F — Roteiro de testes manuais (QA)

| # | Caso | Esperado |
|---|------|---------|
| 1 | Login com usuário sem papel `master` → acessar `/correspondente/configuracoes/integracoes` | Redireciona para `/correspondente` |
| 2 | Login como master → mesma rota | Carrega tela com 3 abas |
| 3 | Salvar chave Gemini → consultar tabela | `encrypted_api_key` em base64, jamais plaintext |
| 4 | Botão "Testar conexão" Gemini | Toast "Conexão OK" em <3s |
| 5 | Botão "Testar conexão" HomeFin | Retorna `access_token` da API real |
| 6 | Scan IA com RG | OCR retorna campos preenchidos com `confianca: alta` |
| 7 | Simulação operacional | `homefin-simulacao` grava ≥1 linha em `propostas_bancos` |
| 8 | Webhook HomeFin (curl simulando) | Sem HMAC → 401; com HMAC válido → 200 + status atualizado |
| 9 | Logs Supabase Edge Functions | Nenhum log contém chave/secret em plaintext |
| 10 | Audit log após salvar config | Linha registrada SEM os campos criptografados |

---

## ANEXO G — Secrets necessários no Supabase Edge Functions

| Secret | Origem | Uso |
|--------|--------|-----|
| `SUPABASE_URL` | auto | clients |
| `SUPABASE_SERVICE_ROLE_KEY` | auto | admin client |
| `CONFIG_VAULT_KEY` | `openssl rand -base64 32` | criptografia AES-GCM |
| `HOMEFIN_WEBHOOK_DEFAULT_SECRET` (opcional) | gerado | fallback se config faltar |
| `LOVABLE_API_KEY` | auto | Lovable AI Gateway (provedor default) |

---

## ANEXO H — Próximos passos sugeridos (pós Go-Live)

1. **Multi-correspondente** — habilitar onboarding self-service com isolamento por `correspondente_id`.
2. **2FA obrigatório para master** via Supabase Auth (TOTP).
3. **Rotação automática de chaves** — cron mensal lembrando masters.
4. **Logs centralizados** em ferramenta externa (Logflare, Datadog) com PII redaction.
5. **Penetration test** focado em escalonamento de privilégios e leakage de chaves.

---

**FIM DOS ANEXOS TÉCNICOS.**
