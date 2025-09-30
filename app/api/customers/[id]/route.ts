// app/api/customers/[id]/route.ts
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Customer from "@/models/customer"
import { customerSchema } from "@/lib/validation/customer" // Zod şeman

// GET /api/customers/[id]
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await ctx.params        // 🔑 params'ı await et
  const doc = await Customer.findById(id).lean()
  if (!doc) return NextResponse.json({ error: "NotFound" }, { status: 404 })
  return NextResponse.json(doc)
}

// PUT /api/customers/[id]
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await ctx.params        // 🔑
  const body = await req.json()

  // İstersen validation
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await Customer.findByIdAndUpdate(id, parsed.data, { new: true }).lean()
  if (!updated) return NextResponse.json({ error: "NotFound" }, { status: 404 })
  return NextResponse.json(updated)
}

// DELETE /api/customers/[id]
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connectDB()
  const { id } = await ctx.params        // 🔑
  await Customer.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
