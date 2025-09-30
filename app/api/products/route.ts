import { connectDB } from "@/lib/db";
import { productSchema } from "@/lib/validation/product";
import product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(req:Request) {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = {};
    if(type) q.type = type;
    
    const list = await product.find(q).limit(500).lean();

    return NextResponse.json(list);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  // Zod validasyon
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 }
    );
    }   
  

  const created = await product.create(parsed.data);
  return NextResponse.json(created, { status: 201 });
}