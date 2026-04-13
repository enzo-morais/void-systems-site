"use client";

import { useState, useEffect } from "react";
import { Bot, Play, Square, RotateCw, Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { VoidCard } from "@/components/landing/void-card";

interface DiscloudBot {
  id: string;
  name: string;
  discloudAppId: string;
  status: "online" | "offline" | "starting" | "stopping" | "error";
  createdAt: string;
}

interface BotStatus {
  appId: string;
  name: string;
  status: "online" | "offline" | "starting" | "stopping" | "error";
  uptime?: number;
  cpu?: number;
  memory?: number;
}

export function DiscloudBots() {
  const [bots, setBots] = useState<DiscloudBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingBot, setAddingBot] = useState(false);
  const [newBotAppId, setNewBotAppId] = useState("");
  const [newBotName, setNewBotName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Carregar bots
  useEffect(() => {
    loadBots();
  }, []);

  async function loadBots() {
    try {
      const response = await fetch("/api/bots");
      if (!response.ok) throw new Error("Erro ao carregar bots");
      const data = await response.json();
      setBots(data.bots);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar bots");
    } finally {
      setLoading(false);
    }
  }

  // Adicionar bot
  async function handleAddBot() {
    if (!newBotAppId || !newBotName) {
      setError("Preencha todos os campos");
      return;
    }

    setAddingBot(true);
    setError(null);

    try {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discloudAppId: newBotAppId,
          name: newBotName
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao adicionar bot");
      }

      setNewBotAppId("");
      setNewBotName("");
      loadBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setAddingBot(false);
    }
  }

  // Atualizar status (apenas recarrega do banco, sem chamar Discloud)
  async function updateStatus(botId: string) {
    setStatusUpdating(botId);
    setError(null);
    try {
      await loadBots();
    } catch (err) {
      setError("Erro ao atualizar status");
    } finally {
      setStatusUpdating(null);
    }
  }

  // Iniciar bot
  async function handleStart(botId: string) {
    setStatusUpdating(botId);
    setError(null);

    try {
      const response = await fetch(`/api/bots/${botId}/start`, {
        method: "POST"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao iniciar bot");
      }

      // Atualizar status
      setBots(prev => prev.map(b => 
        b.id === botId ? { ...b, status: "starting" } : b
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar bot");
    } finally {
      setStatusUpdating(null);
    }
  }

  // Parar bot
  async function handleStop(botId: string) {
    setStatusUpdating(botId);
    setError(null);

    try {
      const response = await fetch(`/api/bots/${botId}/stop`, {
        method: "POST"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao parar bot");
      }

      // Atualizar status
      setBots(prev => prev.map(b => 
        b.id === botId ? { ...b, status: "stopping" } : b
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao parar bot");
    } finally {
      setStatusUpdating(null);
    }
  }

  // Reiniciar bot
  async function handleRestart(botId: string) {
    setStatusUpdating(botId);
    setError(null);

    try {
      const response = await fetch(`/api/bots/${botId}/restart`, {
        method: "POST"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao reiniciar bot");
      }

      // Atualizar status
      setBots(prev => prev.map(b => 
        b.id === botId ? { ...b, status: "starting" } : b
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reiniciar bot");
    } finally {
      setStatusUpdating(null);
    }
  }

  // Remover bot
  async function handleRemove(botId: string) {
    if (!confirm("Tem certeza que deseja remover este bot?")) return;

    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Erro ao remover bot");

      setBots(prev => prev.filter(b => b.id !== botId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover bot");
    }
  }

  // Formatar status
  function formatStatus(status: string) {
    const colors = {
      online: "bg-green-500",
      offline: "bg-red-500",
      starting: "bg-yellow-500",
      stopping: "bg-orange-500",
      error: "bg-red-500"
    };

    const labels = {
      online: "Online",
      offline: "Offline",
      starting: "Iniciando...",
      stopping: "Parando...",
      error: "Erro"
    };

    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors]}`} />
        <span className="text-sm text-silver">{labels[status as keyof typeof labels]}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bots Discloud</h2>
          <p className="text-silver/60 text-sm mt-1">Gerencie seus bots hospedados na Discloud</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Add Bot Form */}
      <VoidCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Novo Bot
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="App ID da Discloud"
            value={newBotAppId}
            onChange={(e) => setNewBotAppId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-silver/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Nome do bot"
            value={newBotName}
            onChange={(e) => setNewBotName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-silver/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={handleAddBot}
            disabled={addingBot}
            className="px-6 py-2 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {addingBot ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </VoidCard>

      {/* Bots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((bot) => (
          <VoidCard key={bot.id} className="p-6 relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Bot className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{bot.name}</h3>
                  <p className="text-xs text-silver/50 font-mono">{bot.discloudAppId}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(bot.id)}
                className="text-silver/40 hover:text-red-500 transition-colors"
                title="Remover bot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              {formatStatus(bot.status)}
            </div>

            <div className="flex items-center gap-2">
              {bot.status === "online" ? (
                <button
                  onClick={() => handleStop(bot.id)}
                  disabled={statusUpdating === bot.id}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Square className="w-4 h-4" /> Parar
                </button>
              ) : (
                <button
                  onClick={() => handleStart(bot.id)}
                  disabled={statusUpdating === bot.id}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Play className="w-4 h-4" /> Iniciar
                </button>
              )}

              <button
                onClick={() => handleRestart(bot.id)}
                disabled={statusUpdating === bot.id}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RotateCw className="w-4 h-4" /> Reiniciar
              </button>

              <button
                onClick={() => updateStatus(bot.id)}
                disabled={statusUpdating === bot.id}
                className="px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Atualizar status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </VoidCard>
        ))}

        {bots.length === 0 && (
          <div className="col-span-full text-center py-12 text-silver/50">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nenhum bot cadastrado</p>
            <p className="text-sm">Adicione um bot acima para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
