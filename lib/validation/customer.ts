import { z } from "zod";

export const customerProductSchema = z.object({
  _id: z.any().optional(),
  localId: z.string().optional(),
  image: z.string().optional(),
  type: z.string(),
  brand: z.string(),
  model: z.string(),
  qty: z.number().min(1),
  unitPrice: z.number().min(0),
  commissionRate: z.number().min(0),
  unitCommission: z.number().min(0),
  totalCommission: z.number().min(0),
  totalPrice: z.number().min(0),
});

export const customerSchema = z.object({
  customerName: z.string().min(1),
  probability: z.number().min(0).max(100),
  jobDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih biçimi YYYY-MM-DD olmalı")
    .transform((s) => new Date(`${s}T00:00:00.000Z`))
    .optional(),
  products: z.array(customerProductSchema).default([]),
  productTotal: z.number().default(0),
  totalCommission: z.number().default(0),
  laborCost: z.number().default(0),
  travelCost: z.number().default(0),
  customerPrice: z.number().default(0),
  profit: z.number().default(0),
  status: z.string().optional(), // "lead" default'u model tarafında
});
