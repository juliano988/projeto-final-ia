"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import ThemeController from "./components/ThemeController";

export default function Page() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");

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
                  <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-base-content/70">
                      👋 Olá!
                    </h2>
                    <p className="py-2 text-base-content">
                      Como posso ajudá-lo hoje? Digite sua mensagem abaixo para
                      começar nossa conversa.
                    </p>
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
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
              className="flex gap-2"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={status !== "ready"}
                  placeholder="Digite sua mensagem aqui..."
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>
              <button
                type="submit"
                disabled={status !== "ready" || !input.trim()}
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
