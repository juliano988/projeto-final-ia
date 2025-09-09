import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import getAllFilesPathTool from "./tools/getAllFilesPathTool";
import getFilesContentTool from "./tools/getFilesContentTool";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `Você é um assistente útil que ajuda a analisar repositórios de código. 

INSTRUÇÕES CRÍTICAS:
- Quando você executar uma ferramenta, SEMPRE forneça uma resposta textual após obter os resultados
- NUNCA termine a conversa apenas executando ferramentas
- Sempre explique os resultados em português brasileiro
- Forneça insights e análises úteis dos dados
- Pergunte se o usuário precisa de mais informações

FLUXO OBRIGATÓRIO após usar ferramentas:
1. Execute a ferramenta necessária
2. Analise os resultados obtidos
3. Explique ao usuário o que foi encontrado
4. Ofereça próximos passos ou pergunte se precisa de mais detalhes

Exemplo: Se usar getAllFilesPaths, explique quantos arquivos foram encontrados, que tipos de arquivos são, e se há algum padrão interessante na estrutura.`,
    messages: convertToCoreMessages(messages),
    onFinish: async ({ finishReason, toolCalls, toolResults }) => {
      console.log("=== DEBUG INFO ===");
      console.log("Finish reason:", finishReason);
      console.log("Tool calls:", toolCalls?.length || 0);
      console.log("Tool results:", toolResults?.length || 0);

      if (finishReason === "tool-calls" && toolResults?.length) {
        console.log(
          "AVISO: Conversa terminou apenas com tool-calls. Isso indica que o modelo não gerou resposta textual."
        );
        console.log("Tool results:", JSON.stringify(toolResults, null, 2));
      }
    },
    tools: {
      getAllFilesPaths: {
        description:
          "Obter todos os caminhos de arquivos de um repositório específico. Útil para entender a estrutura do repositório e buscar os arquivos do repositório que contem códigos usando a ferramenta getFilesContent.",
        inputSchema: z.object({
          repositoryUrl: z
            .string()
            .describe("A URL do repositório para analisar"),
        }),
        execute: async ({ repositoryUrl }: { repositoryUrl: string }) => {
          try {
            const filePaths = await getAllFilesPathTool(repositoryUrl);
            return {
              success: true,
              filePaths,
              count: filePaths.length,
              message: `Encontrei ${filePaths.length} arquivos no repositório ${repositoryUrl}`,
            };
          } catch (error) {
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Erro desconhecido ocorreu",
              message: "Falha ao obter os caminhos dos arquivos",
            };
          }
        },
      },
      getFilesContent: {
        description:
          "Obter o conteúdo de arquivos específicos de um repositório. Útil para analisar o código ou conteúdo de arquivos específicos.",
        inputSchema: z.object({
          repositoryUrl: z
            .string()
            .describe("A URL do repositório para analisar"),
          filePaths: z
            .array(z.string())
            .describe("Array com os caminhos dos arquivos a serem analisados"),
        }),
        execute: async ({
          repositoryUrl,
          filePaths,
        }: {
          repositoryUrl: string;
          filePaths: string[];
        }) => {
          try {
            const filesContent = await getFilesContentTool(
              repositoryUrl,
              filePaths
            );
            return {
              success: true,
              filesContent,
              count: filesContent.length,
              message: `Obtive o conteúdo de ${filesContent.length} arquivos do repositório ${repositoryUrl}`,
            };
          } catch (error) {
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Erro desconhecido ocorreu",
              message: "Falha ao obter o conteúdo dos arquivos",
            };
          }
        },
      },
    },
  });

  return result.toTextStreamResponse();
}
