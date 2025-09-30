import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductType from "@/models/productType";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ params await edilmesi gerekiyor
  await connectDB();
  const body = await req.json();

  const updated = await ProductType.findByIdAndUpdate(id, body, {
    new: true,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ yine await
  await connectDB();

  await ProductType.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
