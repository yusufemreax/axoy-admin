import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";

// Ürün sil
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ params await edilmeli
  await connectDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

// Ürün güncelle
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ params await edilmeli
  await connectDB();
  const body = await req.json();
  const updated = await Product.findByIdAndUpdate(id, body, {
    new: true,
  });
  return NextResponse.json(updated);
}
