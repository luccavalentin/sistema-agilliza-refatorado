import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, User, ShieldCheck, Lock, ArrowRight, IdCard, Calendar } from "lucide-react";
import { findCrmClientByLogin, formatCpf, isValidCpfFormat, onlyDigits } from "@/lib/crm-clients";
import { MaskedInput } from "@/components/ui/masked-input";
import agillizaLogo from "@/assets/agilliza-logo.png";
import agillizaMark from "@/assets/agilliza-mark.png";

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
      { title: "Agilliza — Acesso à Plataforma de Crédito Imobiliário" },
      { name: "description", content: "Login institucional Agilliza para correspondentes, corretores e clientes." },
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
        // sessionStorage indisponível
      }
      navigate({ to: "/cliente" });
      return;
    }

    navigate({ to: current.route });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#f6f8fc_0%,#eef2f8_45%,#e6ecf5_100%)]">
      {/* Decorative brand ornament */}
      <img
        src={agillizaMark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-auto opacity-[0.05] select-none"
      />
      <img
        src={agillizaMark}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-auto opacity-[0.04] select-none rotate-12"
      />
      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="px-6 py-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <img src={agillizaLogo} alt="Agilliza Crédito Imobiliário" className="h-9 w-auto" />
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-white/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              Ambiente seguro · Conexão criptografada
            </div>
          </div>
        </header>

        {/* Centered login card */}
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="relative rounded-2xl border border-border/70 bg-white/85 p-8 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] backdrop-blur-md sm:p-10">
              {/* Brand accent bar */}
              <div className="absolute inset-x-8 top-0 h-[3px] rounded-b-full bg-gradient-to-r from-brand via-brand to-direction" />

              <div className="mb-7 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/15 bg-brand/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                  <span className="h-1 w-1 rounded-full bg-direction" />
                  Plataforma Agilliza
                </span>
                <h1 className="mt-4 text-[22px] font-bold tracking-tight text-graphite">
                  Acesse sua conta
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Selecione o seu perfil para continuar.
                </p>
              </div>

              {/* Profile selector */}
              <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Perfil de acesso">
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
                        "group relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-semibold transition-all",
                        active
                          ? "border-brand bg-brand text-brand-foreground shadow-[0_8px_20px_-10px_rgba(26,35,126,0.55)]"
                          : "border-border bg-white text-muted-foreground hover:border-brand/40 hover:text-graphite",
                      ].join(" ")}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.85} />
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-center text-[11px] text-muted-foreground">{current.description}</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {selected === "cliente" ? (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="cpf" className="flex items-center gap-1.5 text-xs font-medium text-graphite">
                        <IdCard className="h-3.5 w-3.5 text-brand" />
                        CPF do titular
                      </label>
                      <input
                        id="cpf"
                        type="text"
                        inputMode="numeric"
                        autoComplete="username"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                        maxLength={14}
                        className="w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="birth" className="flex items-center gap-1.5 text-xs font-medium text-graphite">
                        <Calendar className="h-3.5 w-3.5 text-brand" />
                        Data de nascimento
                      </label>
                      <input
                        id="birth"
                        type="date"
                        autoComplete="bday"
                        value={birth}
                        onChange={(e) => setBirth(e.target.value)}
                        className="w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                      />
                    </div>

                    <div className="rounded-lg border border-dashed border-brand/30 bg-brand/[0.04] p-3">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand">
                        Acesso de demonstração
                      </p>
                      <div className="space-y-1.5">
                        {[
                          { cpf: "12345678900", nome: "João da Silva", nasc: "1985-04-12" },
                          { cpf: "98765432100", nome: "Maria Oliveira", nasc: "1990-09-23" },
                          { cpf: "11122233344", nome: "Carlos Pereira", nasc: "1978-12-01" },
                        ].map((c) => (
                          <button
                            key={c.cpf}
                            type="button"
                            onClick={() => {
                              setCpf(formatCpf(c.cpf));
                              setBirth(c.nasc);
                              setError(null);
                            }}
                            className="flex w-full items-center justify-between rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px] text-graphite hover:border-brand/60 hover:bg-brand/5"
                          >
                            <span className="font-medium">{c.nome}</span>
                            <span className="text-muted-foreground">{formatCpf(c.cpf)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-medium text-graphite">
                        E-mail corporativo
                      </label>
                      <MaskedInput
                        id="email"
                        type="email"
                        validate="email"
                        autoComplete="email"
                        placeholder="nome@empresa.com.br"
                        className="px-3.5 py-2.5"
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
                        className="w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/10"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <p className="rounded-lg border border-direction/30 bg-direction/5 px-3 py-2 text-xs font-medium text-direction">
                    {error}
                  </p>
                )}

                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-input accent-[color:var(--brand)]" />
                  Manter sessão neste dispositivo
                </label>

                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-[0_10px_25px_-12px_rgba(26,35,126,0.6)] transition-all hover:bg-brand/90 hover:shadow-[0_14px_30px_-12px_rgba(26,35,126,0.65)]"
                >
                  Entrar como {current.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Autenticação protegida · Conformidade LGPD
                </div>
              </form>
            </div>

            <p className="mt-5 text-center text-[11px] text-muted-foreground">
              Problemas para acessar? <span className="font-medium text-brand">Fale com o suporte institucional</span>
            </p>
          </div>
        </main>

        <footer className="px-6 py-5">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-[11px] text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} Agilliza Crédito Imobiliário · Todos os direitos reservados</span>
            <span>Termos · Privacidade · Suporte</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
