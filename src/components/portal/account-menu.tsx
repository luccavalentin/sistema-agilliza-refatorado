import { useEffect, useState } from "react";
import {
  User,
  ChevronDown,
  Shield,
  Bell,
  Palette,
  Languages,
  KeyRound,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  Building2,
  Camera,
  Upload,
  Smartphone,
  Activity,
  CreditCard,
  Eye,
  EyeOff,
  Check,
  Database,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { PortalKind } from "@/components/portal-shell";
import { Link } from "@tanstack/react-router";
import { resetDemo, limparTudo } from "@/data/repositories";

const PROFILE_KEY = "portal.profile";

type Profile = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  empresa: string;
  avatar?: string;
  idioma: "pt-BR" | "en-US" | "es-ES";
  tema: "claro" | "escuro" | "sistema";
  twoFA: boolean;
  loginAlerts: boolean;
};

const profilesByKind: Record<PortalKind, Profile> = {
  correspondente: {
    nome: "Administrador",
    email: "admin@correspondente.com.br",
    telefone: "(11) 99999-0000",
    cargo: "Gestor Operacional",
    empresa: "Correspondente Imobiliário Ltda",
    idioma: "pt-BR",
    tema: "claro",
    twoFA: true,
    loginAlerts: true,
  },
  corretor: {
    nome: "Carlos Mendes",
    email: "carlos@corretor.com.br",
    telefone: "(11) 98888-1111",
    cargo: "Corretor de Imóveis",
    empresa: "Mendes Imóveis",
    idioma: "pt-BR",
    tema: "claro",
    twoFA: false,
    loginAlerts: true,
  },
  cliente: {
    nome: "Maria Silva",
    email: "maria.silva@email.com",
    telefone: "(11) 97777-2222",
    cargo: "Cliente",
    empresa: "—",
    idioma: "pt-BR",
    tema: "claro",
    twoFA: false,
    loginAlerts: true,
  },
};

function loadProfile(kind: PortalKind): Profile {
  if (typeof window === "undefined") return profilesByKind[kind];
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}.${kind}`);
    if (raw) return { ...profilesByKind[kind], ...JSON.parse(raw) };
  } catch {}
  return profilesByKind[kind];
}

const sessions = [
  { id: "s1", device: "Chrome • Windows 11", local: "São Paulo, BR", atual: true, ultimo: "agora" },
  { id: "s2", device: "Safari • iPhone 15", local: "São Paulo, BR", atual: false, ultimo: "2h atrás" },
  { id: "s3", device: "Edge • Windows 10", local: "Campinas, BR", atual: false, ultimo: "ontem" },
];

const activity = [
  { id: "a1", acao: "Login realizado", quando: "Hoje, 09:12", ip: "189.43.10.221" },
  { id: "a2", acao: "Senha alterada", quando: "12/06/2026 14:05", ip: "189.43.10.221" },
  { id: "a3", acao: "2FA ativada", quando: "01/05/2026 10:33", ip: "189.43.10.221" },
];

export function AccountMenu({ kind }: { kind: PortalKind }) {
  const [profile, setProfile] = useState<Profile>(() => loadProfile(kind));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("perfil");

  useEffect(() => {
    try {
      localStorage.setItem(`${PROFILE_KEY}.${kind}`, JSON.stringify(profile));
    } catch {}
  }, [profile, kind]);

  const initials = profile.nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-left hover:border-brand/40"
          >
            <div className="grid h-7 w-7 place-items-center rounded bg-brand text-[11px] font-bold text-brand-foreground">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-7 w-7 rounded object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-xs font-semibold text-graphite">{profile.nome}</p>
              <p className="truncate text-[10px] text-muted-foreground">{profile.cargo}</p>
            </div>
            <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-0">
          <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-3 py-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-11 w-11 rounded-md object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-graphite">{profile.nome}</p>
              <p className="truncate text-[11px] text-muted-foreground">{profile.email}</p>
              <Badge variant="secondary" className="mt-1 h-4 px-1.5 text-[9px]">
                {kind === "correspondente"
                  ? "Correspondente"
                  : kind === "corretor"
                    ? "Corretor"
                    : "Cliente"}
              </Badge>
            </div>
          </div>
          <div className="py-1">
            <DropdownMenuItem onClick={() => { setTab("perfil"); setOpen(true); }}>
              <User className="mr-2 h-4 w-4" /> Minha conta
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setTab("seguranca"); setOpen(true); }}>
              <Shield className="mr-2 h-4 w-4" /> Segurança
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setTab("notificacoes"); setOpen(true); }}>
              <Bell className="mr-2 h-4 w-4" /> Notificações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setTab("preferencias"); setOpen(true); }}>
              <Palette className="mr-2 h-4 w-4" /> Preferências
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Atalhos
            </DropdownMenuLabel>
            {kind !== "cliente" && (
              <DropdownMenuItem asChild>
                <Link to={kind === "correspondente" ? "/correspondente/configuracoes" : "/corretor/configuracoes"}>
                  <Building2 className="mr-2 h-4 w-4" /> Configurações da conta
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => toast.info("Central de ajuda em breve")}>
              <HelpCircle className="mr-2 h-4 w-4" /> Ajuda e suporte
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
              <Link to="/">
                <LogOut className="mr-2 h-4 w-4" /> Sair com segurança
              </Link>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl gap-0 p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base">Minha conta</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Gerencie seu perfil, segurança e preferências do sistema.
            </p>
          </DialogHeader>
          <Tabs value={tab} onValueChange={setTab} className="flex">
            <div className="w-48 shrink-0 border-r border-border bg-secondary/30 p-3">
              <TabsList className="flex h-auto w-full flex-col gap-1 bg-transparent p-0">
                <TabsTrigger value="perfil" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <User className="h-3.5 w-3.5" /> Perfil
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <Shield className="h-3.5 w-3.5" /> Segurança
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <Bell className="h-3.5 w-3.5" /> Notificações
                </TabsTrigger>
                <TabsTrigger value="preferencias" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <Palette className="h-3.5 w-3.5" /> Preferências
                </TabsTrigger>
                <TabsTrigger value="sessoes" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <Smartphone className="h-3.5 w-3.5" /> Sessões
                </TabsTrigger>
                <TabsTrigger value="atividade" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <Activity className="h-3.5 w-3.5" /> Atividade
                </TabsTrigger>
                {kind !== "cliente" && (
                  <TabsTrigger value="assinatura" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                    <CreditCard className="h-3.5 w-3.5" /> Plano
                  </TabsTrigger>
                )}
                <TabsTrigger value="dados-demo" className="w-full justify-start gap-2 data-[state=active]:bg-background">
                  <Database className="h-3.5 w-3.5" /> Dados demo
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="max-h-[70vh] flex-1 overflow-y-auto p-5">
              <TabsContent value="perfil" className="mt-0 space-y-4">
                <PerfilForm profile={profile} setProfile={setProfile} initials={initials} />
              </TabsContent>
              <TabsContent value="seguranca" className="mt-0">
                <SegurancaPanel profile={profile} setProfile={setProfile} />
              </TabsContent>
              <TabsContent value="notificacoes" className="mt-0">
                <NotifPanel />
              </TabsContent>
              <TabsContent value="preferencias" className="mt-0">
                <PrefsPanel profile={profile} setProfile={setProfile} />
              </TabsContent>
              <TabsContent value="sessoes" className="mt-0">
                <SessoesPanel />
              </TabsContent>
              <TabsContent value="atividade" className="mt-0">
                <AtividadePanel />
              </TabsContent>
              {kind !== "cliente" && (
                <TabsContent value="assinatura" className="mt-0">
                  <PlanoPanel kind={kind} />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PerfilForm({
  profile,
  setProfile,
  initials,
}: {
  profile: Profile;
  setProfile: (p: Profile | ((p: Profile) => Profile)) => void;
  initials: string;
}) {
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfile((p) => ({ ...p, avatar: String(ev.target?.result) }));
    reader.readAsDataURL(file);
  };
  return (
    <>
      <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-4">
        <div className="relative">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-lg font-bold text-brand-foreground">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-brand text-brand-foreground shadow hover:opacity-90">
            <Camera className="h-3 w-3" />
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </label>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-graphite">{profile.nome}</p>
          <p className="text-xs text-muted-foreground">{profile.cargo}</p>
          <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-brand hover:underline">
            <Upload className="h-3 w-3" /> Alterar foto
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome completo" icon={<User className="h-3.5 w-3.5" />}>
          <Input
            value={profile.nome}
            onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))}
          />
        </Field>
        <Field label="Cargo / função">
          <Input
            value={profile.cargo}
            onChange={(e) => setProfile((p) => ({ ...p, cargo: e.target.value }))}
          />
        </Field>
        <Field label="E-mail" icon={<Mail className="h-3.5 w-3.5" />}>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />
        </Field>
        <Field label="Telefone" icon={<Phone className="h-3.5 w-3.5" />}>
          <Input
            value={profile.telefone}
            onChange={(e) => setProfile((p) => ({ ...p, telefone: e.target.value }))}
          />
        </Field>
        <Field label="Empresa" icon={<Building2 className="h-3.5 w-3.5" />}>
          <Input
            value={profile.empresa}
            onChange={(e) => setProfile((p) => ({ ...p, empresa: e.target.value }))}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm">
          Cancelar
        </Button>
        <Button size="sm" onClick={() => toast.success("Perfil atualizado")}>
          Salvar alterações
        </Button>
      </div>
    </>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

function SegurancaPanel({
  profile,
  setProfile,
}: {
  profile: Profile;
  setProfile: (p: Profile | ((p: Profile) => Profile)) => void;
}) {
  const [show, setShow] = useState(false);
  const [pwd, setPwd] = useState({ atual: "", nova: "", conf: "" });
  const strength = scorePwd(pwd.nova);
  return (
    <div className="space-y-5">
      <section>
        <h4 className="mb-2 text-sm font-semibold text-graphite">Alterar senha</h4>
        <div className="space-y-2">
          <Field label="Senha atual" icon={<KeyRound className="h-3.5 w-3.5" />}>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={pwd.atual}
                onChange={(e) => setPwd({ ...pwd, atual: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </Field>
          <Field label="Nova senha">
            <Input
              type={show ? "text" : "password"}
              value={pwd.nova}
              onChange={(e) => setPwd({ ...pwd, nova: e.target.value })}
            />
            {pwd.nova && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded bg-secondary">
                  <div
                    className={`h-full transition-all ${
                      strength < 2 ? "bg-red-500" : strength < 4 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {strength < 2 ? "Fraca" : strength < 4 ? "Boa" : "Forte"}
                </span>
              </div>
            )}
          </Field>
          <Field label="Confirmar nova senha">
            <Input
              type={show ? "text" : "password"}
              value={pwd.conf}
              onChange={(e) => setPwd({ ...pwd, conf: e.target.value })}
            />
          </Field>
          <Button
            size="sm"
            onClick={() => {
              if (!pwd.nova || pwd.nova !== pwd.conf) {
                toast.error("As senhas não coincidem");
                return;
              }
              toast.success("Senha alterada com sucesso");
              setPwd({ atual: "", nova: "", conf: "" });
            }}
          >
            Atualizar senha
          </Button>
        </div>
      </section>
      <Separator />
      <section>
        <h4 className="mb-2 text-sm font-semibold text-graphite">Autenticação em duas etapas</h4>
        <ToggleRow
          title="Verificação em duas etapas (2FA)"
          desc="Adicione uma camada extra de segurança ao login."
          checked={profile.twoFA}
          onChange={(v) => setProfile((p) => ({ ...p, twoFA: v }))}
        />
        <ToggleRow
          title="Alertas de novos logins"
          desc="Receber e-mail quando uma nova sessão for iniciada."
          checked={profile.loginAlerts}
          onChange={(v) => setProfile((p) => ({ ...p, loginAlerts: v }))}
        />
      </section>
    </div>
  );
}

function scorePwd(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-graphite">{title}</p>
        {desc && <p className="text-[11px] text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function NotifPanel() {
  const [sound, setSound] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [email, setEmail] = useState(true);
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        As preferências detalhadas por categoria estão no ícone de sino, na barra superior.
      </p>
      <ToggleRow title="Som de notificação" checked={sound} onChange={setSound} />
      <ToggleRow title="Pop-ups do navegador" checked={desktop} onChange={setDesktop} />
      <ToggleRow title="Resumo diário por e-mail" checked={email} onChange={setEmail} />
      <div className="pt-2">
        <Button size="sm" onClick={() => toast.success("Preferências salvas")}>Salvar</Button>
      </div>
    </div>
  );
}

function PrefsPanel({
  profile,
  setProfile,
}: {
  profile: Profile;
  setProfile: (p: Profile | ((p: Profile) => Profile)) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Palette className="h-3.5 w-3.5" /> Tema
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(["claro", "escuro", "sistema"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setProfile((p) => ({ ...p, tema: t }))}
              className={`rounded-md border p-3 text-left text-xs capitalize transition-colors ${
                profile.tema === t ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-graphite">{t}</span>
                {profile.tema === t && <Check className="h-3 w-3 text-brand" />}
              </div>
              <div
                className={`h-8 rounded ${
                  t === "claro" ? "bg-white border" : t === "escuro" ? "bg-graphite" : "bg-gradient-to-r from-white to-graphite"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Languages className="h-3.5 w-3.5" /> Idioma
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { v: "pt-BR", l: "Português" },
            { v: "en-US", l: "English" },
            { v: "es-ES", l: "Español" },
          ] as const).map((o) => (
            <button
              key={o.v}
              onClick={() => setProfile((p) => ({ ...p, idioma: o.v }))}
              className={`rounded-md border px-3 py-2 text-xs ${
                profile.idioma === o.v ? "border-brand bg-brand/5 text-brand" : "border-border text-muted-foreground hover:border-brand/40"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <Button size="sm" onClick={() => toast.success("Preferências salvas")}>Salvar</Button>
    </div>
  );
}

function SessoesPanel() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Dispositivos atualmente conectados à sua conta. Encerre qualquer sessão que não reconheça.
      </p>
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-muted-foreground">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-graphite">
                {s.device}
                {s.atual && (
                  <Badge className="ml-2 h-4 px-1.5 text-[9px]">Atual</Badge>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.local} • {s.ultimo}</p>
            </div>
          </div>
          {!s.atual && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Sessão encerrada")}
            >
              Encerrar
            </Button>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => toast.success("Outras sessões encerradas")}
      >
        Encerrar todas as outras sessões
      </Button>
    </div>
  );
}

function AtividadePanel() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Últimas ações de segurança registradas.</p>
      <ul className="divide-y divide-border rounded-md border border-border">
        {activity.map((a) => (
          <li key={a.id} className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-[12px] font-medium text-graphite">{a.acao}</p>
              <p className="text-[10px] text-muted-foreground">IP {a.ip}</p>
            </div>
            <span className="text-[11px] text-muted-foreground">{a.quando}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanoPanel({ kind }: { kind: PortalKind }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-1">Plano atual</Badge>
            <p className="text-lg font-semibold text-graphite">
              {kind === "correspondente" ? "Enterprise" : "Profissional"}
            </p>
            <p className="text-xs text-muted-foreground">
              Próxima renovação em 15/07/2026
            </p>
          </div>
          <Button size="sm" variant="outline">Gerenciar</Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Usuários", v: kind === "correspondente" ? "12 / 25" : "1 / 3" },
          { l: "Propostas/mês", v: kind === "correspondente" ? "420 / ∞" : "38 / 100" },
          { l: "Armazenamento", v: "6,4 GB" },
        ].map((m) => (
          <div key={m.l} className="rounded-md border border-border p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</p>
            <p className="text-sm font-semibold text-graphite">{m.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
