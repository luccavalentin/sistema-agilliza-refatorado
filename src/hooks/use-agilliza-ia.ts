/**
 * useAgillizaIA — Hook do assistente virtual AgillizaIA.
 *
 * Hoje: respostas mockadas inteligentes sobre financiamento habitacional.
 * Para integrar com IA real: substitua a função `sendToAI` abaixo por uma
 * chamada à sua Edge Function (Supabase Functions, Vercel, etc.) que chame
 * OpenAI / Gemini / Claude / etc.
 *
 * TODO: apontar `sendToAI` para Edge Function quando provedor for definido.
 */
import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

// ---------------------------------------------------------------------------
// Base de conhecimento mock sobre financiamento habitacional
// ---------------------------------------------------------------------------
const KB: { patterns: string[]; answer: string }[] = [
  {
    patterns: ["taxa", "juros", "cet", "custo efetivo"],
    answer:
      "As taxas de juros para financiamento imobiliário variam conforme o banco e o programa:\n\n• **SBPE (poupança):** a partir de 10,49% a.a. + TR\n• **FGTS / Minha Casa Minha Vida:** a partir de 4% a.a. (renda ≤ R$ 2.640) até 8,16% a.a.\n• **Pro Cotista FGTS:** a partir de 8,76% a.a.\n\nO CET (Custo Efetivo Total) inclui seguros MIP e DFI, além da taxa de juros — sempre compare o CET entre os bancos.",
  },
  {
    patterns: ["fgts", "fundo de garantia", "usar fgts", "utilizar fgts"],
    answer:
      "O FGTS pode ser usado para:\n\n1. **Entrada (amortização):** reduzir o valor financiado\n2. **Parcelas:** abater até 80% de até 12 parcelas consecutivas\n3. **Saldo devedor:** amortização do saldo a qualquer momento\n\n**Requisitos básicos:**\n• Ter 3 anos de trabalho sob regime FGTS (podendo somar períodos)\n• Não possuir outro imóvel no mesmo município\n• Imóvel deve ser residencial urbano\n• Não ter financiamento ativo pelo SFH",
  },
  {
    patterns: ["ltv", "loan to value", "financiamento máximo", "percentual", "quanto posso financiar"],
    answer:
      "O LTV (Loan-to-Value) é a relação entre o valor financiado e o valor do imóvel:\n\n• **SBPE:** até 80% (SAC) ou 70% (PRICE)\n• **FGTS / MCMV:** até 90% em alguns casos\n• **Home Equity:** até 60% do valor do imóvel\n\nExemplo: imóvel avaliado em R$ 500.000 → máximo financiado pelo SBPE = R$ 400.000, sendo R$ 100.000 de entrada mínima.",
  },
  {
    patterns: ["renda", "comprovação", "composição de renda", "informal", "autônomo"],
    answer:
      "A renda para financiamento pode ser composta de várias formas:\n\n• **Assalariado (CLT):** holerites + extrato CTPS\n• **Autônomo/MEI:** declaração de IR + extrato bancário (12 meses)\n• **Empresário:** balanço contábil + IRPJ\n• **Composição com cônjuge:** soma as rendas, reduz a taxa de esforço\n\nRegra geral: a parcela não deve comprometer mais de **30% da renda bruta** familiar.",
  },
  {
    patterns: ["documentos", "documentação", "papéis", "lista"],
    answer:
      "Documentos básicos para financiamento imobiliário:\n\n**Comprador:**\n• RG + CPF (e cônjuge)\n• Comprovante de renda (3 últimos)\n• Extrato FGTS (se usar)\n• Comprovante de endereço\n• Certidão de casamento/nascimento\n• Declaração de IR (2 últimos)\n\n**Imóvel:**\n• Matrícula atualizada (≤ 30 dias)\n• IPTU vigente\n• Habite-se (construção nova)\n• ART/RRT (obra)\n\nBancos podem solicitar documentos adicionais.",
  },
  {
    patterns: ["prazo", "tempo", "meses", "anos", "quanto tempo"],
    answer:
      "Os prazos máximos variam por programa:\n\n• **SBPE:** até **420 meses** (35 anos)\n• **FGTS / MCMV:** até **360 meses** (30 anos)\n• **Home Equity:** até **240 meses** (20 anos)\n\nO prazo influencia diretamente no valor da parcela e no total de juros pagos. Use a tabela SAC para parcelas decrescentes ou PRICE para parcelas fixas.",
  },
  {
    patterns: ["sac", "price", "tabela", "amortização", "qual sistema"],
    answer:
      "**Tabela SAC (Sistema de Amortização Constante):**\n• Parcelas decrescentes ao longo do tempo\n• Amortização constante desde o início\n• Paga menos juros no total\n• Parcela inicial mais alta\n\n**Tabela PRICE (Sistema Francês):**\n• Parcelas fixas (sem correção)\n• Maior incidência de juros no início\n• Parcela menor no começo\n\n✅ **Recomendação:** SAC é mais vantajosa para quem pode pagar parcelas maiores no início.",
  },
  {
    patterns: ["seguro", "mip", "dfi", "morte", "invalidez"],
    answer:
      "Todo financiamento habitacional exige dois seguros obrigatórios:\n\n• **MIP (Morte e Invalidez Permanente):** cobre o saldo devedor em caso de falecimento ou invalidez do mutuário. O valor depende da idade e do saldo.\n\n• **DFI (Danos Físicos ao Imóvel):** cobre danos estruturais ao imóvel (incêndio, desabamento, etc.)\n\nAmbos são calculados mensalmente e já estão incluídos na parcela. Você pode contratar seguros adicionais, mas os dois acima são obrigatórios pelo Banco Central.",
  },
  {
    patterns: ["avaliação", "laudo", "vistoria", "avaliação do imóvel"],
    answer:
      "O banco realiza uma avaliação técnica do imóvel antes de liberar o crédito:\n\n1. **Engenheiro credenciado** pelo banco visita o imóvel\n2. **Laudo de avaliação** determina o valor de mercado (PTam)\n3. O banco financia o **menor valor** entre o PTam e o preço de compra\n\nCusto: R$ 300 a R$ 1.000 (varia por banco/região). O prazo médio de avaliação é de 5 a 15 dias úteis.",
  },
  {
    patterns: ["minha casa minha vida", "mcmv", "faixa 1", "faixa 2", "faixa 3", "habitação popular"],
    answer:
      "**Minha Casa Minha Vida (2024):**\n\n| Faixa | Renda familiar | Taxa a.a. |\n|-------|---------------|----------|\n| 1 | até R$ 2.640 | 4,0% a 5,0% |\n| 2 | até R$ 4.400 | 5,5% a 7,0% |\n| 3 | até R$ 8.000 | até 8,16% |\n\n• Subsídio direto nas faixas 1 e 2\n• Prazo máximo de 360 meses\n• Usa FGTS na entrada e parcelas\n• Imóvel deve ser residencial urbano novo ou usado",
  },
  {
    patterns: ["home equity", "imóvel como garantia", "crédito com garantia", "refinanciamento"],
    answer:
      "**Home Equity (Crédito com Garantia de Imóvel):**\n\n• Usa imóvel quitado ou em financiamento como garantia\n• LTV: até 60% do valor do imóvel\n• Taxa a partir de 1,09% a.m. (bem abaixo do crédito pessoal)\n• Prazo: até 20 anos (240 meses)\n• Uso livre dos recursos\n\nÉ ideal para capital de giro, quitação de dívidas caras ou investimentos. O imóvel fica como alienação fiduciária enquanto o crédito existir.",
  },
  {
    patterns: ["cartório", "escritura", "registro", "itbi", "custos"],
    answer:
      "**Custos de cartório no financiamento:**\n\n• **ITBI:** 2% a 3% do valor do imóvel (varia por município)\n• **Escritura:** não necessária para SFH (o contrato bancário tem força de escritura)\n• **Registro de imóvel:** ~1% do valor de avaliação\n• **Certidões:** R$ 50 a R$ 300 cada\n\nTotal estimado: entre **3% e 5%** do valor do imóvel em custos adicionais. Sempre inclua isso na composição do valor de entrada do cliente.",
  },
];

function findAnswer(question: string): string {
  const q = question.toLowerCase();
  const matched = KB.find((entry) =>
    entry.patterns.some((p) => q.includes(p)),
  );
  if (matched) return matched.answer;
  return (
    "Essa é uma ótima pergunta sobre financiamento habitacional! No momento não tenho uma resposta específica catalogada, mas posso ajudar com:\n\n" +
    "• Taxas de juros (SAC/PRICE)\n" +
    "• Uso do FGTS\n" +
    "• LTV e percentuais de financiamento\n" +
    "• Documentação necessária\n" +
    "• Composição de renda\n" +
    "• Prazos e seguros\n" +
    "• Minha Casa Minha Vida\n" +
    "• Home Equity\n\n" +
    "Digite sua dúvida usando uma dessas palavras-chave e eu explico em detalhes!"
  );
}

// ---------------------------------------------------------------------------
// Integração com IA real — substitua esta função pela chamada à Edge Function
// ---------------------------------------------------------------------------
async function sendToAI(
  _messages: ChatMessage[],
  userMessage: string,
): Promise<string> {
  // TODO: substituir por chamada real quando provedor for definido:
  //
  // const res = await fetch("/api/agilliza-ia", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ messages: _messages, question: userMessage }),
  // });
  // const data = await res.json();
  // return data.answer;

  // Simulação com delay realista
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
  return findAnswer(userMessage);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Olá! Sou o **AgillizaIA**, assistente especializado em financiamento habitacional. 🏠\n\nPosso responder dúvidas sobre taxas de juros, FGTS, LTV, documentação, MCMV, Home Equity e muito mais.\n\nComo posso ajudar?",
  ts: new Date(),
};

export function useAgillizaIA() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      ts: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const answer = await sendToAI(messages, text.trim());
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente.",
          ts: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clear = useCallback(() => setMessages([WELCOME]), []);

  return { messages, isLoading, send, clear };
}
