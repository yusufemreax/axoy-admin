import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
    await connectDB();
    return NextResponse.json({ ok: true, message: "MongoDB bağlantısı çalışıyor 🎉" });
}