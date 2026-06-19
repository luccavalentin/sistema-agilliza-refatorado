// PopoutChat: chat inline com opção de "soltar" em janela flutuante
// estilo Messenger/Facebook — arrastável, minimizável, fechável.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minus, Send, X, MessageSquare, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatMensagem = {
  autor: string;
  texto: string;
  quando: string;
};

type Props = {
  titulo: string;
  mensagens: ChatMensagem[];
  placeholder?: string;
  onEnviar?: (texto: string) => void;
  /** identificador único — preserva estado da janela ao trocar de aba */
  storageKey?: string;
};

export function PopoutChat({ titulo, mensagens, placeholder = "Escrever mensagem…", onEnviar, storageKey }: Props) {
  const [popOut, setPopOut] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const [texto, setTexto] = useState("");
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 80, y: 80 };
    return { x: window.innerWidth - 400, y: window.innerHeight - 520 };
  });

  function handleEnviar() {
    if (!texto.trim()) return;
    onEnviar?.(texto.trim());
    setTexto("");
  }

  // Inline view
  if (!popOut) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MessageSquare className="mr-1 inline h-3.5 w-3.5" /> {titulo}
          </h4>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs"
            onClick={() => setPopOut(true)}
            title="Soltar em janela flutuante"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Soltar janela
          </Button>
        </div>
        <ListaMensagens mensagens={mensagens} />
        <Composer
          texto={texto}
          setTexto={setTexto}
          onEnviar={handleEnviar}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Pop-out placeholder + floating window
  return (
    <>
      <div className="flex items-center justify-between rounded-md border border-dashed border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          Chat aberto em janela flutuante.
        </div>
        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setPopOut(false)}>
          <Minimize2 className="h-3.5 w-3.5" /> Encaixar de volta
        </Button>
      </div>
      <FloatingWindow
        titulo={titulo}
        pos={pos}
        setPos={setPos}
        minimizado={minimizado}
        setMinimizado={setMinimizado}
        onClose={() => setPopOut(false)}
        storageKey={storageKey}
      >
        <ListaMensagens mensagens={mensagens} />
        <Composer
          texto={texto}
          setTexto={setTexto}
          onEnviar={handleEnviar}
          placeholder={placeholder}
        />
      </FloatingWindow>
    </>
  );
}

function ListaMensagens({ mensagens }: { mensagens: ChatMensagem[] }) {
  return (
    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {mensagens.map((m, i) => (
        <div key={i} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-graphite">{m.autor}</p>
            <span className="text-[10px] text-muted-foreground">{m.quando}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{m.texto}</p>
        </div>
      ))}
      {mensagens.length === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">Nenhuma mensagem ainda.</p>
      )}
    </div>
  );
}

function Composer({
  texto, setTexto, onEnviar, placeholder,
}: {
  texto: string;
  setTexto: (v: string) => void;
  onEnviar: () => void;
  placeholder: string;
}) {
  return (
    <div className="flex gap-2">
      <Input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEnviar();
          }
        }}
        placeholder={placeholder}
      />
      <Button onClick={onEnviar} className="gap-1">
        <Send className="h-4 w-4" /> Enviar
      </Button>
    </div>
  );
}

function FloatingWindow({
  titulo, pos, setPos, minimizado, setMinimizado, onClose, storageKey, children,
}: {
  titulo: string;
  pos: { x: number; y: number };
  setPos: (p: { x: number; y: number }) => void;
  minimizado: boolean;
  setMinimizado: (v: boolean) => void;
  onClose: () => void;
  storageKey?: string;
  children: React.ReactNode;
}) {
  const dragState = useRef<{ dx: number; dy: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const x = Math.max(0, Math.min(window.innerWidth - 360, e.clientX - dragState.current.dx));
    const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragState.current.dy));
    setPos({ x, y });
  }
  function onPointerUp() {
    dragState.current = null;
  }

  useEffect(() => {
    function onResize() {
      setPos({
        x: Math.min(pos.x, window.innerWidth - 360),
        y: Math.min(pos.y, window.innerHeight - 60),
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos, setPos]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[60] w-[360px] overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
      style={{ left: pos.x, top: pos.y }}
      data-storage-key={storageKey}
    >
      <header
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex cursor-grab items-center justify-between border-b border-border bg-graphite px-3 py-2 text-white active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{titulo}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMinimizado(!minimizado)}
            className="rounded p-1 hover:bg-white/10"
            title={minimizado ? "Restaurar" : "Minimizar"}
          >
            {minimizado ? <Maximize2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/10"
            title="Encaixar de volta"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>
      {!minimizado && (
        <div className="space-y-3 p-3">
          {children}
        </div>
      )}
    </div>,
    document.body,
  );
}
