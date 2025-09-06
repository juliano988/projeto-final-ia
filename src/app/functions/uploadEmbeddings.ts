"use server";

import { connection } from "mongoose";
import createEmbeddingsModelBasedOnCollectionName from "../../../db/models/embeddings";
import { FilesEmbeddings } from "./makeRepositoryEmbeddingsAction";

export default async function uploadEmbeddings(
  repositoryUrl: string,
  embeddings: FilesEmbeddings
) {
  console.log(
    `Iniciando upload de embeddings para repositório: ${repositoryUrl}`
  );
  console.log(`Total de embeddings para processar: ${embeddings.length}`);

  try {
    const model = createEmbeddingsModelBasedOnCollectionName(repositoryUrl);
    console.log(`Modelo criado para coleção: ${repositoryUrl}`);

    const bulkOperations = embeddings.map((embedding) => ({
      updateOne: {
        filter: {
          filePath: embedding.filePath,
          fileContent: embedding.fileContent,
        },
        update: {
          $set: {
            filePath: embedding.filePath,
            fileContent: embedding.fileContent,
            embedding: embedding.embedding,
          },
        },
        upsert: true,
      },
    }));

    console.log(`Executando operação bulk upsert...`);
    const startTime = Date.now();

    const result = await model.bulkWrite(bulkOperations, {
      ordered: false,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Bulk upsert concluído em ${duration}ms`);
    console.log(`Estatísticas da operação:`, {
      insertedCount: result.insertedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
    });
  } catch (e) {
    console.error(`Erro durante upload de embeddings:`, e);
    throw new Error(
      "Erro ao fazer upsert dos embeddings no banco de dados: " + e
    );
  }
}
