import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * scan-documento — Edge Function Agilliza
 *
 * Recebe imagem/PDF de documento via multipart/form-data,
 * envia ao Google Gemini Vision e retorna JSON estruturado
 * com os campos extraídos para pré-preenchimento do cadastro.
 *
 * Variável de ambiente necessária no Supabase:
 *   GEMINI_API_KEY — obtenha em: https://aistudio.google.com/apikey
 */

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PROMPT = `Você é um sistema de OCR especializado em documentos brasileiros de identificação e financiamento habitacional.

Analise esta imagem de documento e extraia TODOS os campos visíveis.
Retorne um JSON com os seguintes campos (deixe null para campos não encontrados):

{
  "tipo_documento": "RG" | "CNH" | "CPF" | "HOLERITE" | "COMPROVANTE_RESIDENCIA" | "EXTRATO_BANCARIO" | "DECLARACAO_IR" | "OUTRO",
  "nome_completo": string | null,
  "cpf": string | null,           // formato: 000.000.000-00
  "rg": string | null,            // formato original do documento
  "orgao_expedidor": string | null, // ex: SSP-SP, DETRAN-MG
  "data_nascimento": string | null, // formato: DD/MM/AAAA
  "nome_mae": string | null,
  "nome_pai": string | null,
  "naturalidade": string | null,
  "nacionalidade": string | null,
  "data_expedicao": string | null, // data de emissão do documento
  "validade": string | null,
  "cnh_numero": string | null,
  "cnh_categoria": string | null,  // ex: B, AB, C
  "endereco_logradouro": string | null,
  "endereco_numero": string | null,
  "endereco_complemento": string | null,
  "endereco_bairro": string | null,
  "endereco_municipio": string | null,
  "endereco_uf": string | null,
  "endereco_cep": string | null,   // formato: 00000-000
  "renda_mensal": string | null,   // formato: R$ 0.000,00
  "empregador": string | null,
  "cnpj_empregador": string | null,
  "cargo": string | null,
  "mes_referencia": string | null,
  "banco": string | null,
  "agencia": string | null,
  "conta": string | null,
  "confianca": "alta" | "media" | "baixa",
  "observacoes": string | null     // alertas sobre legibilidade, cortes, etc.
}

REGRAS:
- Extraia exatamente o que está escrito, sem inferir dados
- Para CPF, normalize para o formato 000.000.000-00
- Para datas, normalize para DD/MM/AAAA
- Se o documento estiver ilegível, parcialmente cortado ou for inválido, indique em "observacoes"
- Responda APENAS com o JSON, sem texto adicional`;

export default async function handler(req: Request): Promise<Response> {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ erro: "Método não permitido" }, 405);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return json({ erro: "GEMINI_API_KEY não configurada no Supabase Edge Secrets" }, 500);
  }

  try {
    // Lê o body como FormData (multipart) ou JSON com base64
    const contentType = req.headers.get("content-type") ?? "";
    let base64Data: string;
    let mimeType: string;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("documento") as File | null;
      if (!file) return json({ erro: "Campo 'documento' não encontrado no FormData" }, 400);

      const buffer = await file.arrayBuffer();
      base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      mimeType = file.type || "image/jpeg";
    } else {
      // JSON com { base64: "...", mimeType: "..." }
      const body = await req.json() as { base64?: string; mimeType?: string };
      if (!body.base64) return json({ erro: "Campo 'base64' não encontrado no JSON" }, 400);
      base64Data = body.base64;
      mimeType = body.mimeType || "image/jpeg";
    }

    // Converte PDF para imagem não é possível no Deno puro —
    // PDFs são enviados diretamente ao Gemini como application/pdf
    const isSupportedMime = [
      "image/jpeg", "image/jpg", "image/png", "image/webp",
      "image/gif", "image/heic", "image/heif", "application/pdf",
    ].includes(mimeType);

    if (!isSupportedMime) {
      return json({ erro: `Tipo de arquivo não suportado: ${mimeType}. Use JPG, PNG, WEBP ou PDF.` }, 400);
    }

    // Chama Gemini Vision
    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return json({ erro: "Erro ao chamar Gemini Vision", detalhe: err }, 502);
    }

    const geminiData = await geminiRes.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return json({ erro: "Gemini não retornou dados" }, 502);
    }

    // Parse do JSON retornado pelo Gemini
    let dadosExtraidos: Record<string, string | null>;
    try {
      // Gemini às vezes envolve em ```json ... ```
      const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      dadosExtraidos = JSON.parse(clean);
    } catch {
      return json({ erro: "Gemini retornou JSON inválido", raw: text }, 502);
    }

    return json({ sucesso: true, dados: dadosExtraidos }, 200);
  } catch (err) {
    console.error("Erro interno:", err);
    return json({ erro: "Erro interno", detalhe: String(err) }, 500);
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
