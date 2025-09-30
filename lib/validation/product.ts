import { z } from "zod";

// Ortak alanlar
const base = z.object({
  brand: z.string().min(1, "Marka zorunlu"),
  model: z.string().min(1, "Model zorunlu"),
  price: z.number().nonnegative(),
  image: z.string().min(1, "Resim zorunlu"),
});

// Amfi specs
const amplifierSpecsSchema = z.object({
  kanalSayisi: z.number().int().min(1, "Kanal sayısı 1+ olmalı"),
  guc_4ohm: z.string().min(1),
  guc_2ohm: z.string().optional(),
  guc_1ohm: z.string().optional(),
  guc_bridge: z.string().optional(),
});

// Hoparlör specs
const speakerSpecsSchema = z.object({
  cap: z.string().min(1),
  ohm: z.union([z.string(), z.number()]),
  rms: z.union([z.string(), z.number()]),
  frekansAraligi: z.string().min(1),
});

// Tipi belirli ürünler (discriminated)
const amplifierProductSchema = base.extend({
  type: z.literal("amfi"),
  specs: amplifierSpecsSchema,
});

const speakerProductSchema = base.extend({
  type: z.literal("hoparlör"),
  specs: speakerSpecsSchema,
});

const specificProducts = z.discriminatedUnion("type", [
  amplifierProductSchema,
  speakerProductSchema,
]);

// Diğer tüm tipler için generic (literal değil!)
const genericProductSchema = base.extend({
  type: z.string().min(1),
  specs: z.record(z.string(),z.any()).optional(),
});

// Nihai şema: (discriminated iki tip) OR (generic)
export const productSchema = z.union([specificProducts, genericProductSchema]);
export type ProductInput = z.infer<typeof productSchema>;
