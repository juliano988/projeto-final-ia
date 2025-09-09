"use server";

import createEmbeddingsModelBasedOnCollectionName from "../../../../../db/models/embeddings";

export default async function getFilesContentTool(
  repositoryUrl: string,
  filePaths: Array<string>
): Promise<Array<{ filePath: string; fileContent: string }>> {
  if (!filePaths || filePaths.length === 0) {
    return [];
  }

  const model = createEmbeddingsModelBasedOnCollectionName(repositoryUrl);
  
  const results = await model
    .find({ filePath: { $in: filePaths } })
    .select("filePath fileContent")
    .lean();
  
  const filesContent = results
    .map((result) => ({
      filePath: result.filePath,
      fileContent: result.fileContent,
    }))
    .filter((item) => item.filePath && item.fileContent); // Remove valores undefined/null
  
  console.log("Files content found:", filesContent.length);
  return filesContent;
}
