/**
 * Cliente da API da Discloud
 * NUNCA expõe a API key no frontend
 */

const DISCLOUD_API_URL = process.env.DISCLOUD_API_URL || "https://api.discloud.app";
const DISCLOUD_API_KEY = process.env.DISCLOUD_API_KEY;

if (!DISCLOUD_API_KEY) {
  console.error("⚠️ DISCLOUD_API_KEY não configurada no .env.local");
}

interface DiscloudBotStatus {
  appId: string;
  name: string;
  status: "online" | "offline" | "starting" | "stopping" | "error";
  uptime?: number;
  cpu?: number;
  memory?: number;
}

/**
 * Obter status de um bot
 */
export async function getBotStatus(appId: string): Promise<DiscloudBotStatus> {
  try {
    const response = await fetch(`${DISCLOUD_API_URL}/v1/app/${appId}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${DISCLOUD_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao obter status do bot");
    }

    const data = await response.json();
    return {
      appId: data.appId,
      name: data.name,
      status: data.status,
      uptime: data.uptime,
      cpu: data.cpu,
      memory: data.memory
    };
  } catch (error) {
    console.error("Erro ao obter status do bot:", error);
    throw error;
  }
}

/**
 * Iniciar um bot
 */
export async function startBot(appId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${DISCLOUD_API_URL}/v1/app/${appId}/start`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DISCLOUD_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao iniciar o bot");
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao iniciar bot:", error);
    throw error;
  }
}

/**
 * Parar um bot
 */
export async function stopBot(appId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${DISCLOUD_API_URL}/v1/app/${appId}/stop`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DISCLOUD_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao parar o bot");
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao parar bot:", error);
    throw error;
  }
}

/**
 * Reiniciar um bot
 */
export async function restartBot(appId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${DISCLOUD_API_URL}/v1/app/${appId}/restart`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DISCLOUD_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao reiniciar o bot");
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao reiniciar bot:", error);
    throw error;
  }
}

/**
 * Listar todos os bots do usuário
 */
export async function listBots(): Promise<DiscloudBotStatus[]> {
  try {
    const response = await fetch(`${DISCLOUD_API_URL}/v1/app`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${DISCLOUD_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Erro ao listar bots");
    }

    const data = await response.json();
    return data.map((bot: any) => ({
      appId: bot.appId,
      name: bot.name,
      status: bot.status,
      uptime: bot.uptime,
      cpu: bot.cpu,
      memory: bot.memory
    }));
  } catch (error) {
    console.error("Erro ao listar bots:", error);
    throw error;
  }
}
