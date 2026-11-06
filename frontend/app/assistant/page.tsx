
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Plus,
  Search,
  Trash2,
  MessageSquare,
  Loader2,
  FileText,
  Sparkles,
  AlertCircle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Chat = {
  id: number;
  customer_id?: number | null;
  question: string;
  answer: string;
  sources: string[];
  created_at: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export default function AssistantPage() {
  const [history, setHistory] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Get previous conversations
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(`${API_URL}/ai/history?page=1&page_size=100`);

      if (!response.ok) {
        throw new Error("Unable to load chat history");
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load chat history. Please check your backend.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Send question to FastAPI
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage: Message = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setLoading(true);
    setError("");
    setActiveChatId(null);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          customer_id: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "AI response failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      };

      setMessages((previous) => [...previous, assistantMessage]);

      await fetchHistory();
    } catch (err) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Select a previous conversation
  const openChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setMessages([
      {
        role: "user",
        content: chat.question,
      },
      {
        role: "assistant",
        content: chat.answer,
        sources: chat.sources || [],
      },
    ]);
    setError("");
  };

  // Start a new chat
  const newChat = () => {
    setMessages([]);
    setQuestion("");
    setActiveChatId(null);
    setError("");
  };

  // Search previous conversations
  const searchHistory = async (value: string) => {
    setSearchTerm(value);

    if (!value.trim()) {
      fetchHistory();
      return;
    }

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/ai/history/search?keyword=${encodeURIComponent(value)}&page=1&page_size=100`
      );

      if (!response.ok) {
        throw new Error("History search failed");
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError("Unable to search chat history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Delete one conversation
  const deleteChat = async (
    e: React.MouseEvent,
    chatId: number
  ) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/ai/history/${chatId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete conversation");
      }

      setHistory((previous) =>
        previous.filter((chat) => chat.id !== chatId)
      );

      if (activeChatId === chatId) {
        newChat();
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete this conversation.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] min-h-150 overflow-hidden rounded-xl border border-gray-200 bg-white">

      {/* LEFT SIDEBAR */}
      {sidebarOpen && (
        <aside className="flex w-70 shrink-0 flex-col border-r border-gray-200 bg-gray-50">

          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  AI Assistant
                </h2>
                <p className="text-xs text-gray-500">
                  E-commerce support
                </p>
              </div>
            </div>
          </div>

          <div className="p-3">
            <button
              onClick={newChat}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={17} />
              New conversation
            </button>
          </div>

          {/* SEARCH */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => searchHistory(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          {/* HISTORY */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Recent conversations
            </p>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={22} />
              </div>
            ) : history.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <MessageSquare
                  size={25}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-sm text-gray-500">
                  No conversations found
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className={`group flex cursor-pointer items-start gap-2 rounded-lg px-3 py-3 transition ${
                      activeChatId === chat.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <MessageSquare
                      size={16}
                      className="mt-0.5 shrink-0 text-gray-500"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {chat.question}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(chat.created_at)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => deleteChat(e, chat.id)}
                      title="Delete conversation"
                      className="rounded p-1 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-2 rounded-lg bg-white p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Knowledge Assistant
                </p>
                <p className="text-xs text-gray-500">
                  Powered by your RAG system
                </p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* RIGHT CHAT AREA */}
      <main className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}
        <header className="flex h-16.25 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              title="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose size={19} />
              ) : (
                <PanelLeft size={19} />
              )}
            </button>

            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                {activeChatId ? "Previous conversation" : "New conversation"}
              </h1>
              <p className="text-xs text-gray-500">
                Ask questions about your e-commerce operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-700">
              AI Assistant
            </span>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-6 sm:px-8">

          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Bot size={34} />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900">
                How can I help you today?
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Ask me questions about products, shipping, returns, refunds,
                and customer service policies.
              </p>

              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {[
                  "How long does a refund take?",
                  "What is the return policy?",
                  "How long does shipping take?",
                  "What should I do if a product is damaged?",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuestion(item)}
                    className="rounded-xl border border-gray-200 p-4 text-left text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <Sparkles
                      size={16}
                      className="mb-2 text-blue-600"
                    />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-7">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Bot size={19} />
                    </div>
                  )}

                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                        message.role === "user"
                          ? "rounded-br-sm bg-blue-600 text-white"
                          : "rounded-bl-sm border border-gray-200 bg-gray-50 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {message.role === "assistant" &&
                      message.sources &&
                      message.sources.length > 0 && (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <FileText size={15} className="text-blue-600" />
                            Source documents
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, sourceIndex) => (
                              <span
                                key={`${source}-${sourceIndex}`}
                                className="rounded-md bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                      U
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Bot size={19} />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    Generating response...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mx-auto mt-4 flex max-w-3xl items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={17} />
              {error}
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-8">
          <form
            onSubmit={sendMessage}
            className="mx-auto max-w-3xl"
          >
            <div className="flex items-end gap-3 rounded-xl border border-gray-300 bg-white p-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Ask anything about your e-commerce operations..."
                rows={1}
                className="max-h-32 min-h-10.5 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />

              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                title="Send message"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              AI responses are generated using your e-commerce knowledge base.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
