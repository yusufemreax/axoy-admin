import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import ReadySystem from "@/models/ReadySystem"

// GET: tüm sistemleri getir
export async function GET() {
  await connectDB()
  const systems = await ReadySystem.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json(systems)
}

// POST: yeni sistem kaydet
export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()

  const system = await ReadySystem.create(body)
  return NextResponse.json(system)
}
