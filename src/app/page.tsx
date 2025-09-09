"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useState, useTransition } from "react";
import ThemeController from "./components/ThemeController";
import cloneRepoAction from "./functions/cloneRepoAction";
import makeRepositoryEmbeddingsAction from "./functions/makeRepositoryEmbeddingsAction";
import uploadEmbeddings from "./functions/uploadEmbeddings";

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [gitHubUrl, setGitHubUrl] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [cloneStatus, setCloneStatus] = useState<{
    loading: boolean;
    message?: string;
    success?: boolean;
  }>({ loading: false });
  const [isPending, startTransition] = useTransition();

  async function handleGitHubUrlUpload(e: FormEvent) {
    e.preventDefault();

    if (!gitHubUrl) return;

    setCloneStatus({ loading: true, message: "Clonando repositório..." });

    startTransition(async () => {
      try {
        const result = await cloneRepoAction(gitHubUrl);

        if (result.localPath) {
          const embeddings = await makeRepositoryEmbeddingsAction(
            result.localPath
          );

          await uploadEmbeddings(gitHubUrl, embeddings);
        }

        setCloneStatus({
          loading: false,
          message: result.message,
          success: result.success,
        });

        if (result.success) {
          sendMessage({
            text: `Quero que gere para mim os testes de unidade para cobrir esse projeto:`,
          });
          sendMessage({
            text: gitHubUrl,
          });
          setGitHubUrl("");
        }
      } catch (error) {
        setCloneStatus({
          loading: false,
          message: `Erro inesperado: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          success: false,
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold">🤖 AI Chat Assistant</h1>
        </div>
        <div className="flex-none">
          <ThemeController />
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                ></path>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a>Limpar conversa</a>
              </li>
              <li>
                <a>Configurações</a>
              </li>
              <li>
                <a>Sobre</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 container mx-auto p-4 max-w-4xl">
        <div className="chat-container bg-base-100 rounded-lg shadow-xl p-6 h-full flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
            {messages.length === 0 ? (
              <div className="hero min-h-32">
                <div className="hero-content text-center">
                  <div className="max-w-xl flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-base-content/70">
                      👋 Olá!
                    </h2>
                    <p className="py-2 text-base-content">
                      Sobre qual repositório que vou te ajudar a gerar os testes
                      de unidade?
                    </p>

                    {cloneStatus.message && (
                      <div
                        className={`alert ${
                          cloneStatus.success ? "alert-success" : "alert-error"
                        } mb-4`}
                      >
                        <svg
                          className="w-6 h-6 shrink-0 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          {cloneStatus.success ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          )}
                        </svg>
                        <span>{cloneStatus.message}</span>
                      </div>
                    )}

                    <form
                      className="flex gap-2"
                      onSubmit={handleGitHubUrlUpload}
                    >
                      <label className="input w-full">
                        GitHub
                        <input
                          type="url"
                          className="grow w-full"
                          placeholder="https://github.com/playcanvas/react.git"
                          value={gitHubUrl}
                          onChange={(e) => setGitHubUrl(e.target.value)}
                          disabled={cloneStatus.loading || isPending}
                        />
                      </label>
                      <button
                        className="btn btn-square"
                        disabled={
                          !gitHubUrl || cloneStatus.loading || isPending
                        }
                        type="submit"
                      >
                        {cloneStatus.loading || isPending ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${
                    message.role === "user" ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          message.role === "user"
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {message.role === "user" ? "U" : "AI"}
                      </div>
                    </div>
                  </div>
                  <div className="chat-header">
                    {message.role === "user" ? "Você" : "Assistente IA"}
                    <time className="text-xs opacity-50 ml-1">
                      {new Date().toLocaleTimeString()}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble ${
                      message.role === "user"
                        ? "chat-bubble-primary"
                        : "chat-bubble-secondary"
                    }`}
                  >
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index} className="whitespace-pre-wrap">
                          {part.text}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {status !== "ready" && (
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-white font-bold">
                      AI
                    </div>
                  </div>
                </div>
                <div className="chat-bubble chat-bubble-secondary">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-base-300 pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim()) {
                  sendMessage({ text: chatInput });
                  setChatInput("");
                }
              }}
              className="flex gap-2"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={status !== "ready"}
                  placeholder="Digite sua mensagem aqui..."
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>
              <button
                type="submit"
                disabled={status !== "ready" || !chatInput.trim()}
                className="btn btn-primary"
              >
                {status !== "ready" ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                )}
              </button>
            </form>

            {/* Status indicator */}
            <div className="mt-2 text-center">
              {status === "ready" && (
                <div className="badge badge-success badge-sm">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  Conectado
                </div>
              )}
              {status !== "ready" && (
                <div className="badge badge-warning badge-sm">
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                  Processando...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>Desenvolvido com ❤️ usando Next.js, Tailwind CSS e DaisyUI</p>
        </aside>
      </footer>
    </div>
  );
}
