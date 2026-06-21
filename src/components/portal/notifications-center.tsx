import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Filter,
  AlertCircle,
  Info,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  FileText,
  DollarSign,
  Users,
  Settings as SettingsIcon,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { PortalKind } from "@/components/portal-shell";

export type NotifCategory =
  | "proposta"
  | "financeiro"
  | "crm"
  | "tarefa"
  | "sistema"
  | "mensagem";
export type NotifLevel = "info" | "success" | "warning" | "critical";

export type Notification = {
  id: string;
  title: string;
  description: string;
  time: string; // ISO
  category: NotifCategory;
  level: NotifLevel;
  read: boolean;
  link?: string;
};

const STORAGE_KEY = "portal.notifications";
const PREFS_KEY = "portal.notifications.prefs";

type Prefs = {
  sound: boolean;
  desktop: boolean;
  email: boolean;
  perCategory: Record<NotifCategory, boolean>;
  doNotDisturb: boolean;
};

const defaultPrefs: Prefs = {
  sound: true,
  desktop: false,
  email: true,
  perCategory: {
    proposta: true,
    financeiro: true,
    crm: true,
    tarefa: true,
    sistema: true,
    mensagem: true,
  },
  doNotDisturb: false,
};

function seed(kind: PortalKind): Notification[] {
  const now = Date.now();
  const m = (min: number) => new Date(now - min * 60_000).toISOString();
  const base: Notification[] = [
    {
      id: "n1",
      title: "Nova proposta aprovada",
      description: "Proposta #4821 — Cliente Maria Silva foi aprovada pelo banco Itaú.",
      time: m(4),
      category: "proposta",
      level: "success",
      read: false,
    },
    {
      id: "n2",
      title: "Documento pendente",
      description: "Comprovante de renda do cliente João Souza expira em 2 dias.",
      time: m(35),
      category: "tarefa",
      level: "warning",
      read: false,
    },
    {
      id: "n3",
      title: "Comissão recebida",
      description: "R$ 4.320,00 creditados referentes à proposta #4799.",
      time: m(120),
      category: "financeiro",
      level: "success",
      read: false,
    },
    {
      id: "n4",
      title: "Nova mensagem no chat",
      description: "Banco Santander enviou mensagem na proposta #4815.",
      time: m(240),
      category: "mensagem",
      level: "info",
      read: true,
    },
    {
      id: "n5",
      title: "Atualização do sistema",
      description: "Nova versão 2.4.1 disponível com melhorias no Kanban.",
      time: m(60 * 18),
      category: "sistema",
      level: "info",
      read: true,
    },
  ];
  if (kind === "cliente") {
    return [
      {
        id: "c1",
        title: "Seu processo avançou",
        description: "Sua proposta passou para a etapa Análise de Crédito.",
        time: m(10),
        category: "proposta",
        level: "info",
        read: false,
      },
      {
        id: "c2",
        title: "Documento solicitado",
        description: "Envie o comprovante de residência atualizado.",
        time: m(90),
        category: "tarefa",
        level: "warning",
        read: false,
      },
      ...base.slice(3),
    ];
  }
  return base;
}

function loadList(kind: PortalKind): Notification[] {
  if (typeof window === "undefined") return seed(kind);
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}.${kind}`);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch {}
  const s = seed(kind);
  try {
    localStorage.setItem(`${STORAGE_KEY}.${kind}`, JSON.stringify(s));
  } catch {}
  return s;
}

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {}
  return defaultPrefs;
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {}
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

const categoryMeta: Record<NotifCategory, { label: string; icon: typeof Bell }> = {
  proposta: { label: "Propostas", icon: FileText },
  financeiro: { label: "Financeiro", icon: DollarSign },
  crm: { label: "CRM", icon: Users },
  tarefa: { label: "Tarefas", icon: CheckCircle2 },
  sistema: { label: "Sistema", icon: SettingsIcon },
  mensagem: { label: "Mensagens", icon: MessageSquare },
};

const levelMeta: Record<NotifLevel, { icon: typeof Info; cls: string }> = {
  info: { icon: Info, cls: "text-brand bg-brand/10" },
  success: { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50" },
  warning: { icon: AlertTriangle, cls: "text-amber-600 bg-amber-50" },
  critical: { icon: AlertCircle, cls: "text-red-600 bg-red-50" },
};

export function NotificationsCenter({ kind }: { kind: PortalKind }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(() => loadList(kind));
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [tab, setTab] = useState<"todas" | "nao-lidas" | "config">("todas");
  const [filter, setFilter] = useState<NotifCategory | "all">("all");

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}.${kind}`, JSON.stringify(items));
    } catch {}
  }, [items, kind]);

  useEffect(() => savePrefs(prefs), [prefs]);

  const unread = items.filter((i) => !i.read).length;
  const visible = useMemo(() => {
    let list = items;
    if (tab === "nao-lidas") list = list.filter((i) => !i.read);
    if (filter !== "all") list = list.filter((i) => i.category === filter);
    return list.sort((a, b) => +new Date(b.time) - +new Date(a.time));
  }, [items, tab, filter]);

  const markAll = () => {
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
    toast.success("Todas as notificações marcadas como lidas");
  };
  const markOne = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)));
  const removeOne = (id: string) =>
    setItems((xs) => xs.filter((x) => x.id !== id));
  const clearAll = () => {
    setItems([]);
    toast.success("Notificações limpas");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:border-brand/40 hover:text-brand"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-direction px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 sm:w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-graphite">Notificações</p>
            <p className="text-[11px] text-muted-foreground">
              {unread > 0
                ? `${unread} não ${unread === 1 ? "lida" : "lidas"}`
                : "Tudo em dia"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-brand"
              title={prefs.sound ? "Som ativado" : "Som desativado"}
            >
              {prefs.sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={markAll}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-brand"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <div className="border-b border-border px-3 pt-2">
            <TabsList className="h-8 bg-secondary">
              <TabsTrigger value="todas" className="text-xs">
                Todas
              </TabsTrigger>
              <TabsTrigger value="nao-lidas" className="text-xs">
                Não lidas {unread > 0 && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{unread}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs">
                Preferências
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="todas" className="m-0">
            <FiltersBar filter={filter} setFilter={setFilter} />
            <NotifList items={visible} markOne={markOne} removeOne={removeOne} />
            <Footer onClear={clearAll} />
          </TabsContent>
          <TabsContent value="nao-lidas" className="m-0">
            <FiltersBar filter={filter} setFilter={setFilter} />
            <NotifList items={visible} markOne={markOne} removeOne={removeOne} />
            <Footer onClear={clearAll} />
          </TabsContent>
          <TabsContent value="config" className="m-0 p-4">
            <PrefsPanel prefs={prefs} setPrefs={setPrefs} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

function FiltersBar({
  filter,
  setFilter,
}: {
  filter: NotifCategory | "all";
  setFilter: (f: NotifCategory | "all") => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
      <Filter className="h-3 w-3 shrink-0 text-muted-foreground" />
      <button
        onClick={() => setFilter("all")}
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${filter === "all" ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground hover:text-brand"}`}
      >
        Todas
      </button>
      {(Object.keys(categoryMeta) as NotifCategory[]).map((c) => (
        <button
          key={c}
          onClick={() => setFilter(c)}
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${filter === c ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground hover:text-brand"}`}
        >
          {categoryMeta[c].label}
        </button>
      ))}
    </div>
  );
}

function NotifList({
  items,
  markOne,
  removeOne,
}: {
  items: Notification[];
  markOne: (id: string) => void;
  removeOne: (id: string) => void;
}) {
  if (!items.length) {
    return (
      <div className="grid place-items-center px-6 py-12 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm font-medium text-graphite">Nada por aqui</p>
        <p className="text-[11px] text-muted-foreground">
          Você verá novas notificações neste painel.
        </p>
      </div>
    );
  }
  return (
    <ScrollArea className="h-[360px]">
      <ul className="divide-y divide-border">
        {items.map((n) => {
          const LIcon = levelMeta[n.level].icon;
          const CIcon = categoryMeta[n.category].icon;
          return (
            <li
              key={n.id}
              className={`group relative px-4 py-3 transition-colors hover:bg-secondary/60 ${!n.read ? "bg-brand/5" : ""}`}
            >
              <div className="flex gap-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${levelMeta[n.level].cls}`}>
                  <LIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-graphite">
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {timeAgo(n.time)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {n.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <CIcon className="h-2.5 w-2.5" />
                      {categoryMeta[n.category].label}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => markOne(n.id)}
                        className="text-[10px] font-medium text-brand hover:underline"
                      >
                        Marcar como lida
                      </button>
                    )}
                    <button
                      onClick={() => removeOne(n.id)}
                      className="ml-auto text-muted-foreground opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                      title="Remover"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {!n.read && (
                  <span className="absolute right-2 top-3 h-1.5 w-1.5 rounded-full bg-direction" />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}

function Footer({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2">
      <button className="text-[11px] font-medium text-brand hover:underline">
        Ver todas
      </button>
      <button
        onClick={onClear}
        className="text-[11px] font-medium text-muted-foreground hover:text-red-600"
      >
        Limpar tudo
      </button>
    </div>
  );
}

function PrefsRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-graphite">{label}</p>
        {desc && <p className="text-[10px] text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PrefsPanel({
  prefs,
  setPrefs,
}: {
  prefs: Prefs;
  setPrefs: (p: Prefs | ((p: Prefs) => Prefs)) => void;
}) {
  const upd = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));
  const updCat = (c: NotifCategory, v: boolean) =>
    setPrefs((p) => ({ ...p, perCategory: { ...p.perCategory, [c]: v } }));
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Geral
        </p>
        <PrefsRow
          label="Som de notificação"
          desc="Tocar um alerta sonoro ao receber"
          checked={prefs.sound}
          onChange={(v) => upd({ sound: v })}
        />
        <PrefsRow
          label="Notificações no navegador"
          desc="Mostrar pop-ups mesmo com outra aba aberta"
          checked={prefs.desktop}
          onChange={(v) => {
            if (v && typeof Notification !== "undefined" && Notification.permission !== "granted") {
              Notification.requestPermission();
            }
            upd({ desktop: v });
          }}
        />
        <PrefsRow
          label="Resumo por e-mail"
          desc="Envio diário às 8h com pendências e novidades"
          checked={prefs.email}
          onChange={(v) => upd({ email: v })}
        />
        <PrefsRow
          label="Não perturbe"
          desc="Silenciar notificações temporariamente"
          checked={prefs.doNotDisturb}
          onChange={(v) => upd({ doNotDisturb: v })}
        />
      </div>
      <Separator />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categorias
        </p>
        {(Object.keys(categoryMeta) as NotifCategory[]).map((c) => (
          <PrefsRow
            key={c}
            label={categoryMeta[c].label}
            checked={prefs.perCategory[c]}
            onChange={(v) => updCat(c, v)}
          />
        ))}
      </div>
      <Separator />
      <Button
        size="sm"
        className="w-full"
        onClick={() => toast.success("Preferências salvas")}
      >
        Salvar preferências
      </Button>
    </div>
  );
}
