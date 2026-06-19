import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, User, ShieldCheck, Lock, ArrowRight, IdCard, Calendar } from "lucide-react";
import { findCrmClientByLogin, formatCpf, isValidCpfFormat, onlyDigits } from "@/lib/crm-clients";

type Profile = "correspondente" | "corretor" | "cliente";

const profiles: Array<{
  id: Profile;
  title: string;
  description: string;
  icon: typeof Building2;
  route: "/correspondente" | "/corretor" | "/cliente";
}> = [
  {
    id: "correspondente",
    title: "Correspondente",
    description: "Controle operacional completo do ecossistema.",
    icon: Building2,
    route: "/correspondente",
  },
  {
    id: "corretor",
    title: "Corretor",
    description: "Acompanhamento comercial e gestão de clientes.",
    icon: Users,
    route: "/corretor",
  },
  {
    id: "cliente",
    title: "Cliente",
    description: "Acesso seguro ao seu processo de crédito.",
    icon: User,
    route: "/cliente",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acesso à Plataforma — Crédito Imobiliário & Home Equity" },
      { name: "description", content: "Login institucional para correspondentes, corretores e clientes." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Profile>("correspondente");
  const [cpf, setCpf] = useState("");
  const [birth, setBirth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const current = profiles.find((p) => p.id === selected)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selected === "cliente") {
      if (!isValidCpfFormat(cpf)) {
        setError("Informe um CPF válido (11 dígitos).");
        return;
      }
      if (!birth) {
        setError("Informe sua data de nascimento.");
        return;
      }
      const match = findCrmClientByLogin(cpf, birth);
      if (!match) {
        setError("CPF não encontrado no CRM ou data de nascimento incorreta.");
        return;
      }
      try {
        sessionStorage.setItem(
          "cliente_session",
          JSON.stringify({ cpf: onlyDigits(cpf), nome: match.nome }),
        );
      } catch {
        // sessionStorage indisponível — segue sem persistir
      }
      navigate({ to: "/cliente" });
      return;
    }

    navigate({ to: current.route });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Top institutional bar */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-brand text-brand-foreground">
              <Building2 className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-graphite">Plataforma de Crédito</p>
              <p className="text-xs text-muted-foreground">Imobiliário & Home Equity</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span>Ambiente seguro · Conexão criptografada</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* Left — institutional panel */}
          <section className="hidden flex-col justify-between rounded-lg bg-brand p-10 text-brand-foreground lg:flex">
            <div>
              <span className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-direction" />
                Ecossistema integrado
              </span>
              <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight">
                Operação, controle e confiança em uma única plataforma.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
                Correspondentes, corretores e clientes conectados em um único ambiente,
                com permissões segregadas e trilha de auditoria.
              </p>
            </div>

            <ul className="mt-10 grid gap-3 text-sm">
              {[
                "Separação de permissões por perfil",
                "Sessões seguras e auditoria de acessos",
                "Proteção de dados sensíveis e documentos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/85">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-direction" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Right — login form */}
          <section className="rounded-lg border border-border bg-card p-8 shadow-sm sm:p-10">
            <h2 className="text-xl font-bold tracking-tight text-graphite">Acessar a plataforma</h2>
            <p className="mt-1 text-sm text-muted-foreground">Selecione o seu perfil de acesso para continuar.</p>

            {/* Profile selector */}
            <div className="mt-6 grid grid-cols-3 gap-2" role="tablist" aria-label="Perfil de acesso">
              {profiles.map((p) => {
                const Icon = p.icon;
                const active = p.id === selected;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelected(p.id)}
                    className={[
                      "flex flex-col items-center gap-2 rounded-md border px-3 py-3 text-xs font-medium transition-colors",
                      active
                        ? "border-brand bg-accent text-brand"
                        : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-graphite",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                    <span>{p.title}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">{current.description}</p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-graphite">
                  E-mail corporativo
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@empresa.com.br"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-graphite">
                    Senha
                  </label>
                  <button type="button" className="text-xs font-medium text-brand hover:underline">
                    Esqueci minha senha
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-input accent-[color:var(--brand)]" />
                Manter sessão neste dispositivo
              </label>

              <Link
                to={current.route}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
              >
                Entrar como {current.title}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Autenticação protegida · Conformidade com proteção de dados
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Plataforma de Crédito · Todos os direitos reservados</span>
          <span>Suporte institucional · Termos · Privacidade</span>
        </div>
      </footer>
    </div>
  );
}
