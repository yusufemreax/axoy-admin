import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import ReadySystem from "@/models/ReadySystem"

// GET: tek sistem
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params
  const system = await ReadySystem.findById(id)
  return NextResponse.json(system)
}

// PUT: güncelle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params
  const body = await req.json()
  const updated = await ReadySystem.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(updated)
}

// DELETE: sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params
  await ReadySystem.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
