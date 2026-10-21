import { z } from "zod";
import { emailSchema } from "./validation";
import { RECEIPT_NAME } from "./receipts";

// Schemas do corpo das rotas de escrita. Todos .strict(): campo desconhecido (ex.: "id", "createdAt", "role")
// é recusado em vez de ir parar no banco. Os limites de tamanho valem para o painel e para a API.

const text = (max: number) => z.string().trim().min(1).max(max);
const optText = (max: number) => z.string().trim().max(max).nullish();
const money = z.number().finite().min(0).max(10_000_000);

export const clientCreate = z
  .object({
    name: text(100),
    discordId: optText(40),
    email: emailSchema.or(z.literal("")).nullish(),
    notes: optText(2000),
  })
  .strict();

export const productCreate = z
  .object({
    name: text(120),
    price: money,
    category: optText(60),
    description: optText(2000),
    badge: optText(40),
    billing: z.string().trim().min(1).max(30).optional(),
    tags: optText(300),
  })
  .strict();
export const productPatch = productCreate.partial().extend({ active: z.boolean().optional() }).strict();

export const saleCreate = z
  .object({
    client: text(120),
    product: text(500),
    value: money,
    notes: optText(2000),
    staffName: text(100),
    receipt: z.string().trim().regex(RECEIPT_NAME, "Comprovante inválido").nullish(),
  })
  .strict();
export const salePatch = saleCreate.omit({ receipt: true }).partial().strict();

const priority = z.enum(["low", "medium", "high"]);
export const taskCreate = z
  .object({ title: text(200), description: optText(2000), priority: priority.optional(), assignedTo: optText(100) })
  .strict();
export const taskPatch = taskCreate
  .partial()
  .extend({ status: z.enum(["pending", "in_progress", "done"]).optional() })
  .strict();

export const applicationReview = z.object({ status: z.enum(["approved", "rejected"]) }).strict();

export const publicApplication = z
  .object({
    name: text(100),
    age: text(10),
    discordId: text(32),
    discord: text(64),
    why: text(1500),
    experience: text(1500),
    hours: text(30),
    extra: optText(1000),
  })
  .strict();

export const staffBotCreate = z
  .object({
    userId: text(64),
    discloudAppId: z.string().trim().regex(/^[A-Za-z0-9_-]{3,40}$/, "App ID inválido"),
    name: optText(100),
    botClientId: z.string().trim().regex(/^\d{5,25}$/, "Client ID inválido").nullish(),
  })
  .strict();

export const profileUpdate = z
  .object({ name: text(80).or(z.literal("")).optional(), email: emailSchema.optional() })
  .strict();
