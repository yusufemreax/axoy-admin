import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductType from "@/models/productType";

export async function GET() {
  await connectDB();
  const list = await ProductType.find().lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  // Boş alanları filtrele
  body.fields = (body.fields || []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (f: any) => f.key?.trim() && f.label?.trim()
  );

  if (!body.name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  if (!body.fields.length) {
    return NextResponse.json({ error: "At least one field required" }, { status: 400 });
  }

  const created = await ProductType.create(body);
  return NextResponse.json(created, { status: 201 });
}
