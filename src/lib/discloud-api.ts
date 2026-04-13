const DISCLOUD_API_URL = "https://api.discloud.app/v2";
const DISCLOUD_API_KEY = process.env.DISCLOUD_API_KEY;

function headers() {
  return {
    "api-token": DISCLOUD_API_KEY ?? "",
    "Content-Type": "application/json",
  };
}

export interface DiscloudBotStatus {
  appId: string;
  name: string;
  status: "online" | "offline" | "starting" | "stopping" | "error";
  uptime?: number;
  cpu?: string;
  memory?: string;
}

export async function getBotStatus(appId: string): Promise<DiscloudBotStatus> {
  const res = await fetch(`${DISCLOUD_API_URL}/app/${appId}/status`, { headers: headers() });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Erro ao obter status");

  // A Discloud retorna { status: "ok", apps: { ... } } ou { apps: [...] }
  const app = data.apps ?? data.app ?? data;
  const appData = Array.isArray(app) ? app[0] : app;

  return {
    appId: appData.id ?? appId,
    name: appData.name ?? appId,
    status: appData.container === "Online" ? "online" : "offline",
    uptime: appData.startedAt,
    cpu: appData.cpu,
    memory: appData.memory,
  };
}

export async function startBot(appId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${DISCLOUD_API_URL}/app/${appId}/start`, {
    method: "PUT",
    headers: headers(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao iniciar bot");
  }
  return { success: true };
}

export async function stopBot(appId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${DISCLOUD_API_URL}/app/${appId}/stop`, {
    method: "PUT",
    headers: headers(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao parar bot");
  }
  return { success: true };
}

export async function restartBot(appId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${DISCLOUD_API_URL}/app/${appId}/restart`, {
    method: "PUT",
    headers: headers(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erro ao reiniciar bot");
  }
  return { success: true };
}
