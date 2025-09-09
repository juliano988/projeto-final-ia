"use server";

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

    await model.deleteMany();
    await model.insertMany(embeddings);

    console.log(
      `Upload de embeddings concluído com sucesso para: ${repositoryUrl}`
    );
  } catch (e) {
    console.error(`Erro durante upload de embeddings:`, e);
    throw new Error(
      "Erro ao fazer upsert dos embeddings no banco de dados: " + e
    );
  }
}
