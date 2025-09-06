"use server";

import fs from "fs";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import path from "path";
import { EmbeddingModelV2Embedding } from "@ai-sdk/provider";

export type FilesEmbeddings = Array<{
  filePath: string;
  fileContent: string;
  embedding: EmbeddingModelV2Embedding;
}>;

export default async function makeRepositoryEmbeddingsAction(
  repositoryPath: string
): Promise<FilesEmbeddings> {
  const projectFiles = fs
    .readdirSync(repositoryPath, {
      recursive: true,
      withFileTypes: true,
    })
    .filter((file) => {
      if (file.parentPath.includes("/.git/") || !file.isFile()) {
        return false;
      }

      const filePath = path.join(file.parentPath, file.name);
      return !isBinaryFile(filePath);
    });

  const allFilesEmbeddings: Array<{
    filePath: string;
    fileContent: string;
    embedding: EmbeddingModelV2Embedding;
  }> = [];
  for await (const projectFile of projectFiles) {
    const filePath = path.join(projectFile.parentPath, projectFile.name);
    const fileContent = fs.readFileSync(filePath).toString();
    const fileContentWithNoWitheSpaces = fileContent.replace(/\s/g, "");

    const { embedding } = await embed({
      model: openai.textEmbeddingModel("text-embedding-3-small"),
      value: fileContentWithNoWitheSpaces,
    });
    allFilesEmbeddings.push({
      filePath,
      fileContent: fileContentWithNoWitheSpaces,
      embedding,
    });
  }

  return allFilesEmbeddings;
}

function isBinaryFile(filePath: string): boolean {
  try {
    const binaryExtensions = [
      ".exe",
      ".dll",
      ".so",
      ".dylib",
      ".bin",
      ".dat",
      ".db",
      ".sqlite",
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".ico",
      ".svg",
      ".webp",
      ".mp3",
      ".mp4",
      ".avi",
      ".mkv",
      ".mov",
      ".wav",
      ".flac",
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".zip",
      ".rar",
      ".7z",
      ".tar",
      ".gz",
      ".bz2",
      ".apk",
      ".ipa",
      ".deb",
      ".rpm",
      ".woff",
      ".woff2",
      ".ttf",
      ".otf",
      ".eot",
      ".jar",
      ".war",
      ".ear",
      ".class",
      ".pyc",
      ".pyo",
      ".pyd",
      ".o",
      ".a",
      ".lib",
      ".lockb",
      ".lock",
    ];

    const fileExtension = path.extname(filePath).toLowerCase();

    if (binaryExtensions.includes(fileExtension)) {
      return true;
    }

    const buffer = fs.readFileSync(filePath);
    const sampleSize = Math.min(buffer.length, 1024);

    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];

      if (
        byte === 0 ||
        (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn(`Erro ao verificar arquivo ${filePath}:`, error);
    return true;
  }
}
