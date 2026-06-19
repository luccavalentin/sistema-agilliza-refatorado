// Dialog de cadastro de Lançamento (Contas a Pagar / Receber)
// Permite definir natureza: Esporádico | Recorrente | Parcelado
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { parseBRL } from "@/lib/formatters";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Calendar as CalIcon, RotateCcw, Layers, FileText } from "lucide-react";
import { categorias, contas } from "@/lib/financeiro/mock-data";
import type { Lancamento, NaturezaLancamento, Frequencia, FormaPagamento } from "@/lib/financeiro/types";

const frequencias: Frequencia[] = ["Semanal", "Quinzenal", "Mensal", "Bimestral", "Trimestral", "Semestral", "Anual", "Personalizada"];
const formas: FormaPagamento[] = ["Pix", "Boleto", "Transferência", "Cartão", "Dinheiro", "TED/DOC", "Débito automático", "Outro"];

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tipo: "receber" | "pagar";
  onSave: (lancamentos: Lancamento[]) => void;
};

export function LancamentoFormDialog({ open, onOpenChange, tipo, onSave }: Props) {
  const [natureza, setNatureza] = useState<NaturezaLancamento>("Esporádico");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? "");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [forma, setForma] = useState<FormaPagamento>("Pix");
  const [contaId, setContaId] = useState(contas[0]?.id ?? "");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Recorrência
  const [freq, setFreq] = useState<Frequencia>("Mensal");
  const [diaVenc, setDiaVenc] = useState(10);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [indefinido, setIndefinido] = useState(true);
  const [valorFixo, setValorFixo] = useState(true);
  const [permitirAlteracao, setPermitirAlteracao] = useState(true);
  const [gerarAuto, setGerarAuto] = useState(true);
  const [mesesPre, setMesesPre] = useState(12);

  // Parcelamento
  const [totalParcelas, setTotalParcelas] = useState(6);
  const [valorTotal, setValorTotal] = useState("");
  const [primeiroVenc, setPrimeiroVenc] = useState("");
  const [freqParc, setFreqParc] = useState<Frequencia>("Mensal");
  const [diaVencParc, setDiaVencParc] = useState(10);
  const [entrada, setEntrada] = useState("");
  const [gerarParcelasAuto, setGerarParcelasAuto] = useState(true);

  const reset = () => {
    setNatureza("Esporádico"); setDescricao(""); setValor(""); setVencimento("");
    setObservacoes(""); setResponsavel(""); setDataInicio(""); setDataFinal("");
    setTotalParcelas(6); setValorTotal(""); setPrimeiroVenc(""); setEntrada("");
  };

  const submit = () => {
    const baseId = `lan-${Date.now()}`;
    const valorNum = parseBRL(valor);
    const status: any = tipo === "receber" ? "Em aberto" : "Em aberto";
    const common = {
      tipo, natureza, descricao: descricao || "(sem descrição)",
      categoriaId, valor: valorNum, emissao: new Date().toISOString(),
      forma, contaId, status, observacoes, responsavel,
      criadoPor: "u-corr-1", criadoEm: new Date().toISOString(),
    } as Partial<Lancamento>;

    const out: Lancamento[] = [];
    if (natureza === "Esporádico") {
      out.push({ ...common, id: baseId, vencimento: vencimento || new Date().toISOString() } as Lancamento);
    } else if (natureza === "Recorrente") {
      const inicio = dataInicio ? new Date(dataInicio) : new Date();
      const meses = Math.max(1, Math.min(mesesPre, 24));
      for (let m = 0; m < meses; m++) {
        const venc = new Date(inicio); venc.setMonth(venc.getMonth() + m); venc.setDate(diaVenc);
        out.push({
          ...common,
          id: `${baseId}-${m}`,
          vencimento: venc.toISOString(),
          status: m === 0 ? "Em aberto" : ("Em aberto" as any),
          valorPrevisto: valorNum,
          lancamentoOriginalId: baseId,
          recorrencia: {
            frequencia: freq, diaVencimento: diaVenc, dataInicio: inicio.toISOString(),
            dataFinal: dataFinal || undefined, indefinido, valorFixo, permitirAlteracao,
            gerarFuturosAuto: gerarAuto, mesesPreGerar: meses, status: "Ativa",
          },
        } as Lancamento);
      }
    } else {
      const total = parseBRL(valorTotal) || valorNum * totalParcelas;
      const valorP = +(((total - parseBRL(entrada)) / totalParcelas).toFixed(2));
      const primeiro = primeiroVenc ? new Date(primeiroVenc) : new Date();
      const grupoId = `grp-${baseId}`;
      for (let p = 0; p < totalParcelas; p++) {
        const venc = new Date(primeiro); venc.setMonth(venc.getMonth() + p);
        out.push({
          ...common,
          id: `${baseId}-p${p + 1}`,
          descricao: `${common.descricao} (${p + 1}/${totalParcelas})`,
          valor: valorP,
          vencimento: venc.toISOString(),
          lancamentoOriginalId: baseId,
          parcelamento: {
            totalParcelas, parcelaAtual: p + 1, valorTotal: total, valorParcela: valorP,
            primeiroVencimento: primeiro.toISOString(), frequencia: freqParc,
            diaVencimento: diaVencParc, entrada: parseBRL(entrada) || undefined, grupoId,
          },
        } as Lancamento);
      }
    }
    onSave(out);
    reset();
    onOpenChange(false);
  };

  const isReceber = tipo === "receber";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo lançamento — {isReceber ? "Conta a Receber" : "Conta a Pagar"}</DialogTitle>
        </DialogHeader>

        {/* Seletor de natureza */}
        <div className="grid grid-cols-3 gap-2">
          {(["Esporádico", "Recorrente", "Parcelado"] as NaturezaLancamento[]).map(n => {
            const Ico = n === "Esporádico" ? FileText : n === "Recorrente" ? RotateCcw : Layers;
            const active = natureza === n;
            return (
              <button key={n} type="button" onClick={() => setNatureza(n)}
                className={`rounded-lg border p-3 text-left transition-colors ${active ? "border-brand bg-brand/5" : "border-border hover:bg-accent"}`}>
                <Ico className={`h-4 w-4 mb-1 ${active ? "text-brand" : "text-muted-foreground"}`} />
                <div className={`text-sm font-semibold ${active ? "text-brand" : "text-graphite"}`}>{n}</div>
                <div className="text-[11px] text-muted-foreground">
                  {n === "Esporádico" && "Lançamento único, sem repetição."}
                  {n === "Recorrente" && "Gera próximos meses automaticamente."}
                  {n === "Parcelado" && "Divide em N parcelas vinculadas."}
                </div>
              </button>
            );
          })}
        </div>

        {/* Campos comuns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Descrição</Label><Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex.: Conta de luz, Aluguel, Compra parcelada" /></div>
          <div><Label>Categoria</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div><Label>Valor</Label><MaskedInput mask="currency" value={valor} onValueChange={setValor} placeholder="R$ 0,00" /></div>
          {natureza === "Esporádico" && (
            <div><Label>Data de vencimento</Label><Input type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} /></div>
          )}
          <div><Label>Forma de {isReceber ? "recebimento" : "pagamento"}</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={forma} onChange={e => setForma(e.target.value as FormaPagamento)}>
              {formas.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div><Label>Conta financeira</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={contaId} onChange={e => setContaId(e.target.value)}>
              {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div><Label>Responsável</Label><Input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Nome do responsável" /></div>
        </div>

        {/* Campos de recorrência */}
        {natureza === "Recorrente" && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" />Configuração de recorrência</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Frequência</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={freq} onChange={e => setFreq(e.target.value as Frequencia)}>
                  {frequencias.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div><Label>Dia de vencimento</Label><Input type="number" min={1} max={31} value={diaVenc} onChange={e => setDiaVenc(Number(e.target.value))} /></div>
              <div><Label>Data de início</Label><Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></div>
              <div><Label>Data final (opcional)</Label><Input type="date" value={dataFinal} onChange={e => setDataFinal(e.target.value)} disabled={indefinido} /></div>
              <div><Label>Meses a pré-gerar</Label><Input type="number" min={1} max={24} value={mesesPre} onChange={e => setMesesPre(Number(e.target.value))} /></div>
              <div className="space-y-2 pt-5">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={indefinido} onChange={e => setIndefinido(e.target.checked)} /> Repetir indefinidamente</label>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={valorFixo} onChange={e => setValorFixo(e.target.checked)} /> Valor fixo</label>
              </div>
              <div className="col-span-full space-y-2">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={permitirAlteracao} onChange={e => setPermitirAlteracao(e.target.checked)} /> Permitir alteração manual dos próximos lançamentos</label>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={gerarAuto} onChange={e => setGerarAuto(e.target.checked)} /> Gerar lançamentos futuros automaticamente</label>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {valorFixo
                ? "Valor fixo: todos os meses serão lançados com o mesmo valor (permite ajuste individual ou em massa)."
                : "Valor variável: próximos lançamentos serão criados como 'Previsto' e o valor poderá ser ajustado a cada mês (ex.: conta de luz, água)."}
            </p>
          </div>
        )}

        {/* Campos de parcelamento */}
        {natureza === "Parcelado" && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" />Configuração de parcelamento</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Quantidade de parcelas</Label><Input type="number" min={2} max={120} value={totalParcelas} onChange={e => setTotalParcelas(Number(e.target.value))} /></div>
              <div><Label>Valor total</Label><MaskedInput mask="currency" value={valorTotal} onValueChange={setValorTotal} placeholder="R$ 0,00 (opcional)" /></div>
              <div><Label>Entrada</Label><MaskedInput mask="currency" value={entrada} onValueChange={setEntrada} placeholder="R$ 0,00 (opcional)" /></div>
              <div><Label>Primeiro vencimento</Label><Input type="date" value={primeiroVenc} onChange={e => setPrimeiroVenc(e.target.value)} /></div>
              <div><Label>Frequência</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={freqParc} onChange={e => setFreqParc(e.target.value as Frequencia)}>
                  {frequencias.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div><Label>Dia de vencimento</Label><Input type="number" min={1} max={31} value={diaVencParc} onChange={e => setDiaVencParc(Number(e.target.value))} /></div>
              <div className="col-span-full">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={gerarParcelasAuto} onChange={e => setGerarParcelasAuto(e.target.checked)} /> Gerar parcelas automaticamente</label>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Serão criadas {totalParcelas} parcelas individuais (1/{totalParcelas}, 2/{totalParcelas} …) vinculadas ao lançamento original.
            </p>
          </div>
        )}

        <div><Label>Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} /></div>
        <Button variant="outline" size="sm" type="button"><Paperclip className="h-4 w-4 mr-1.5" />Anexar arquivos</Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-brand text-white hover:bg-brand/90" onClick={submit}>
            <CalIcon className="h-4 w-4 mr-1.5" />Salvar lançamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
