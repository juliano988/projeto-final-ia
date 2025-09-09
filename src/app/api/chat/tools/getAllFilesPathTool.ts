"use server";

import createEmbeddingsModelBasedOnCollectionName from "../../../../../db/models/embeddings";

export default async function getAllFilesPathTool(
  repositoryUrl: string
): Promise<string[]> {
  const model = createEmbeddingsModelBasedOnCollectionName(repositoryUrl);
  const results = await model
    .find()
    .select("filePath")
    .lean();
  
  const filePaths = results
    .map((result) => result.filePath)
    .filter((filePath) => filePath); // Remove valores undefined/null
  
  console.log("File paths found:", filePaths);
  return filePaths;
}
