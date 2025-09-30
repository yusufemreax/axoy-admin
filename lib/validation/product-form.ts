import { z } from "zod"

export const baseProductSchema = z.object({
  type: z.string().min(1, "Ürün tipi gerekli"),
  brand: z.string().min(1, "Marka gerekli"),
  model: z.string().min(1, "Model gerekli"),
  price: z.string().min(1, "Fiyat gerekli"),
})

// Amfi özel specs
export const amplifierSpecsSchema = z.object({
  kanalSayisi: z.string().optional(),
  guc_4ohm: z.string().optional(),
  guc_2ohm: z.string().optional(),
  guc_1ohm: z.string().optional(),
  guc_bridge: z.string().optional(),
})

// Hoparlör özel specs
export const speakerSpecsSchema = z.object({
  cap: z.string().optional(),
  ohm: z.string().optional(),
  rms: z.string().optional(),
  frekansAraligi: z.string().optional(),
})

export type BaseProduct = z.infer<typeof baseProductSchema>
export type AmplifierSpecs = z.infer<typeof amplifierSpecsSchema>
export type SpeakerSpecs = z.infer<typeof speakerSpecsSchema>
