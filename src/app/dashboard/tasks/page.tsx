"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, CheckCircle, Trash2, ListTodo, Circle, Clock, CheckCircle2 } from "lucide-react";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { useConfirm } from "@/hooks/use-confirm";
import { CustomSelect } from "@/components/dashboard/custom-select";

interface Task {
  id: string; title: string; description: string | null; status: string; priority: string; assignedTo: string | null; createdAt: string;
}

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" };
const inputClass = "w-full bg-black/40 border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-silver/30 backdrop-blur-sm";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="w-4 h-4 text-silver/40" />,
  in_progress: <Clock className="w-4 h-4 text-amber-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-green-400" />,
};
const statusLabels: Record<string, string> = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída" };
const priorityColors: Record<string, string> = { low: "#3b82f6", medium: "#f59e0b", high: "#ef4444" };
const priorityLabels: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const { confirm, modalProps } = useConfirm();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || undefined, priority, assignedTo: assignedTo || undefined }),
    });
    setSaving(false);
    if (res.ok) {
      setTitle(""); setDescription(""); setPriority("medium"); setAssignedTo("");
      setSuccess(true); fetchTasks();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function cycleStatus(task: Task) {
    const next: Record<string, string> = { pending: "in_progress", in_progress: "done", done: "pending" };
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next[task.status] }),
    });
    fetchTasks();
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: "Deletar tarefa", message: "Tem certeza que deseja remover esta tarefa?", confirmText: "Deletar" });
    if (!ok) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ListTodo className="w-6 h-6" /> Tarefas</h1>
      <ConfirmModal {...modalProps} />

      <form onSubmit={handleSubmit} className="rounded-lg p-6" style={cardStyle}>
        <h2 className="text-sm font-semibold text-silver/60 uppercase tracking-wider mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Nova Tarefa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Título *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Título da tarefa" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Responsável</label>
            <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Nome do responsável" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Descrição</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" className={inputClass} style={{ borderColor: "rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-xs text-silver/40 mb-1.5">Prioridade</label>
            <CustomSelect value={priority} onChange={setPriority} options={[
              { value: "low", label: "Baixa" },
              { value: "medium", label: "Média" },
              { value: "high", label: "Alta" },
            ]} placeholder="Selecione" />
          </div>
        </div>
        {success && <p className="text-green-400 text-sm mb-4 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Tarefa criada</p>}
        <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? "Salvando..." : "Criar"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-silver/40"><Loader2 className="w-5 h-5 animate-spin mr-2" />Carregando...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-silver/30 text-sm">Nenhuma tarefa criada.</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg p-4 flex items-center gap-4 transition-colors" style={cardStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <button onClick={() => cycleStatus(task)} className="shrink-0 cursor-pointer" title="Alterar status">
                {statusIcons[task.status]}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-silver/40" : ""}`}>{task.title}</p>
                {task.description && <p className="text-xs text-silver/40 mt-0.5">{task.description}</p>}
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${priorityColors[task.priority]}15`, color: priorityColors[task.priority] }}>
                {priorityLabels[task.priority]}
              </span>
              <span className="text-xs text-silver/30 shrink-0">{statusLabels[task.status]}</span>
              {task.assignedTo && <span className="text-xs text-silver/40 shrink-0">@{task.assignedTo}</span>}
              <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-md transition-colors cursor-pointer shrink-0" style={{ color: "#666" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
