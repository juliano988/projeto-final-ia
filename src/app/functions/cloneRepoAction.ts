"use server";

import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

const execAsync = promisify(exec);

interface CloneResult {
  success: boolean;
  message: string;
  localPath?: string;
  error?: string;
}

export default async function cloneRepoAction(
  url: string
): Promise<CloneResult> {
  try {
    if (!isValidGitHubUrl(url)) {
      return {
        success: false,
        message: "URL inválida. Por favor, forneça uma URL válida do GitHub.",
        error: "Invalid GitHub URL",
      };
    }

    const repoName = extractRepoName(url);

    const baseDir = path.join(process.cwd(), "cloned-repos");
    const localPath = path.join(baseDir, repoName);

    // Criar diretório base se não existir
    await fs.mkdir(baseDir, { recursive: true });

    try {
      await fs.access(localPath);
      console.log(`Repositório já existe, atualizando: ${repoName}`);
      console.log(`Destino: ${localPath}`);

      await execAsync(`cd "${localPath}" && git pull`, {
        timeout: 30 * 1000,
      });

      return {
        success: true,
        message: `Repositório atualizado com sucesso em: ${localPath}`,
        localPath,
      };
    } catch {
      console.log(`Repositório não existe, clonando: ${url}`);
      console.log(`Destino: ${localPath}`);
    }

    await execAsync(`git clone ${url} "${localPath}"`, {
      timeout: 30 * 1000,
    });

    try {
      await fs.access(path.join(localPath, ".git"));

      return {
        success: true,
        message: `Repositório clonado com sucesso em: ${localPath}`,
        localPath,
      };
    } catch {
      return {
        success: false,
        message: "Erro ao verificar se o repositório foi clonado corretamente.",
        error: "Clone verification failed",
      };
    }
  } catch (error) {
    console.error("Erro ao clonar repositório:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return {
      success: false,
      message: `Erro ao clonar repositório: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

// Função auxiliar para validar URLs do GitHub
function isValidGitHubUrl(url: string): boolean {
  const patterns = [
    /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?$/,
    /^git@github\.com:[\w\-\.]+\/[\w\-\.]+(?:\.git)?$/,
  ];

  return patterns.some((pattern) => pattern.test(url));
}

// Função auxiliar para extrair o nome do repositório da URL
function extractRepoName(url: string): string {
  // Remove .git se presente
  const cleanUrl = url.replace(/\.git$/, "");

  // Extrai o nome do repositório
  const parts = cleanUrl.split("/");
  return parts[parts.length - 1];
}
