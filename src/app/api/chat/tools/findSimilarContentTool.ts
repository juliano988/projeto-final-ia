"use server";

import { cosineSimilarity } from "ai";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { EmbeddingModelV2Embedding } from "@ai-sdk/provider";

export async function findSimilarContentTool(
  userQuery: string,
  storedEmbeddings: Array<{
    fileContent: string;
    embedding: EmbeddingModelV2Embedding;
  }>
) {
  // Gera embedding da pergunta do usuário
  const { embedding: queryEmbedding } = await embed({
    model: openai.textEmbeddingModel("text-embedding-3-small"),
    value: userQuery,
  });

  // Calcula similaridade com cada chunk
  const similarities = storedEmbeddings.map((item) => ({
    content: item.fileContent,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  // Retorna os mais similares
  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}
