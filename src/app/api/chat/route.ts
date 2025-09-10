import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import getAllFilesPathTool from "./tools/getAllFilesPathTool";
import getFilesContentTool from "./tools/getFilesContentTool";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Configuração inicial
  const config = {
    model: openai("gpt-4o-mini"),
    system: `Você é um assistente útil que ajuda a analisar repositórios de código. 

INSTRUÇÕES CRÍTICAS:
- Quando você executar uma ferramenta, SEMPRE forneça uma resposta textual após obter os resultados
- NUNCA termine a conversa apenas executando ferramentas
- Sempre explique os resultados em português brasileiro
- Forneça insights e análises úteis dos dados
- Pergunte se o usuário precisa de mais informações

FLUXO OBRIGATÓRIO após usar ferramentas:
1. Execute a ferramenta getAllFilesPaths
2. Com seu resultado, busque arquivos pertinentes com a ferramenta getFilesContent
3. E com o conteúdo dos arquivos, e gere os testes de unidades.

A resposta deve ser somente os testes de unidades
`,
    tools: {
      getAllFilesPaths: {
        description:
          "Obter todos os caminhos de arquivos de um repositório específico.",
        inputSchema: z.object({
          repositoryUrl: z.string(),
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
                error instanceof Error ? error.message : "Erro desconhecido",
              message: "Falha ao obter os caminhos dos arquivos",
            };
          }
        },
      },
      getFilesContent: {
        description:
          "Obter o conteúdo de arquivos específicos de um repositório.",
        inputSchema: z.object({
          repositoryUrl: z.string(),
          filePaths: z.array(z.string()),
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
                error instanceof Error ? error.message : "Erro desconhecido",
              message: "Falha ao obter o conteúdo dos arquivos",
            };
          }
        },
      },
    },
  };

  // Loop de execução (resolve tool-calls até gerar texto)
  let result = await streamText({
    ...config,
    messages: convertToModelMessages(messages),
  });

  while (await result.finishReason === "tool-calls") {
    console.log("⚙️ Modelo pediu ferramentas, executando...");

    // pega o histórico atualizado com tool-calls e tool-results
    const nextMessages = (await result.response).messages;

    result = await streamText({
      ...config,
      messages: nextMessages,
    });
  }

  return result.toUIMessageStreamResponse();
}
